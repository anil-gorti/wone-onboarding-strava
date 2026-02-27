import asyncio
import json
import logging
import re
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, Optional

import anthropic

from app.config import settings

logger = logging.getLogger(__name__)

PROMPTS_DIR = Path(__file__).parent.parent / "prompts"


@dataclass
class AgentResult:
    data: Dict[str, Any]
    model_used: str
    input_tokens: int
    output_tokens: int
    latency_ms: int
    raw_response: str = ""


class AgentError(Exception):
    pass


class PermanentAgentError(AgentError):
    """Non-retryable error (e.g., invalid request)."""
    pass


class TransientAgentError(AgentError):
    """Retryable error (e.g., rate limit, overloaded)."""
    pass


def load_prompt(filename: str) -> str:
    return (PROMPTS_DIR / filename).read_text()


def extract_json(text: str) -> Dict[str, Any]:
    """Extract JSON from a Claude response that may include markdown fences."""
    # Try direct parse first
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try extracting from markdown code fences
    pattern = r"```(?:json)?\s*\n?(.*?)\n?```"
    match = re.search(pattern, text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except json.JSONDecodeError:
            pass

    # Try finding the first { ... } block
    brace_start = text.find("{")
    if brace_start != -1:
        depth = 0
        for i in range(brace_start, len(text)):
            if text[i] == "{":
                depth += 1
            elif text[i] == "}":
                depth -= 1
                if depth == 0:
                    try:
                        return json.loads(text[brace_start : i + 1])
                    except json.JSONDecodeError:
                        break

    raise PermanentAgentError(f"Could not extract valid JSON from response: {text[:500]}...")


class BaseAgent:
    system_prompt_file: str = ""
    max_tokens: int = 4096

    def __init__(self, client: anthropic.AsyncAnthropic):
        self.client = client

    def get_system_prompt(self) -> str:
        return load_prompt(self.system_prompt_file)

    def build_user_message(self, input_data: Dict[str, Any]) -> str:
        raise NotImplementedError

    async def run(self, input_data: Dict[str, Any]) -> AgentResult:
        system_prompt = self.get_system_prompt()
        user_message = self.build_user_message(input_data)
        max_retries = settings.anthropic_max_retries

        for attempt in range(max_retries):
            try:
                start = time.monotonic()
                response = await self.client.messages.create(
                    model=settings.anthropic_model,
                    max_tokens=self.max_tokens,
                    system=system_prompt,
                    messages=[{"role": "user", "content": user_message}],
                )
                latency_ms = int((time.monotonic() - start) * 1000)

                raw_text = response.content[0].text
                data = extract_json(raw_text)

                return AgentResult(
                    data=data,
                    model_used=settings.anthropic_model,
                    input_tokens=response.usage.input_tokens,
                    output_tokens=response.usage.output_tokens,
                    latency_ms=latency_ms,
                    raw_response=raw_text,
                )

            except (anthropic.RateLimitError, anthropic.InternalServerError) as e:
                wait = 2**attempt
                logger.warning(f"{self.__class__.__name__} attempt {attempt+1} failed (transient): {e}. Retrying in {wait}s")
                if attempt < max_retries - 1:
                    await asyncio.sleep(wait)
                else:
                    raise TransientAgentError(f"Exhausted {max_retries} retries: {e}")

            except anthropic.BadRequestError as e:
                raise PermanentAgentError(f"Bad request: {e}")

        raise TransientAgentError("Exhausted retries")
