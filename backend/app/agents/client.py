import anthropic

from app.config import settings


def get_anthropic_client() -> anthropic.AsyncAnthropic:
    return anthropic.AsyncAnthropic(
        api_key=settings.anthropic_api_key,
        timeout=settings.anthropic_timeout,
        max_retries=0,  # We handle retries in the base agent
    )
