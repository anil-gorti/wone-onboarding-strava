import json
from typing import Any, Dict

from app.agents.base import BaseAgent


class DetectiveAgent(BaseAgent):
    """Agent 1: Takes raw runner data and produces a structured evidence brief."""

    system_prompt_file = "detective_system.md"
    max_tokens = 4096

    def build_user_message(self, input_data: Dict[str, Any]) -> str:
        return (
            "Analyze the following runner data and produce a structured evidence brief.\n\n"
            f"RUNNER DATA:\n```json\n{json.dumps(input_data, indent=2)}\n```"
        )
