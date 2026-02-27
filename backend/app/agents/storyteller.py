import json
from typing import Any, Dict

from app.agents.base import BaseAgent


class StorytellerAgent(BaseAgent):
    """Agent 3: Takes evidence brief + classification and generates profile content."""

    system_prompt_file = "storyteller_system.md"
    max_tokens = 4096

    def build_user_message(self, input_data: Dict[str, Any]) -> str:
        evidence_brief = input_data["evidence_brief"]
        classification = input_data["classification"]

        return (
            "Generate a runner profile based on the evidence brief and classification below.\n\n"
            f"EVIDENCE BRIEF:\n```json\n{json.dumps(evidence_brief, indent=2)}\n```\n\n"
            f"CLASSIFICATION:\n```json\n{json.dumps(classification, indent=2)}\n```"
        )
