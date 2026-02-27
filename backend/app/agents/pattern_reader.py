import json
from typing import Any, Dict

from app.agents.base import BaseAgent


class PatternReaderAgent(BaseAgent):
    """Agent 2: Takes evidence brief and classifies runner into archetypes."""

    system_prompt_file = "pattern_reader_system.md"
    max_tokens = 4096

    def build_user_message(self, input_data: Dict[str, Any]) -> str:
        return (
            "Classify the following runner based on their evidence brief.\n\n"
            f"EVIDENCE BRIEF:\n```json\n{json.dumps(input_data, indent=2)}\n```"
        )
