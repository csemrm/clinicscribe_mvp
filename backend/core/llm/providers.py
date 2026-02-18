from __future__ import annotations
from dataclasses import dataclass
import os
import json
import urllib.request

@dataclass
class LLMResult:
    text: str
    structured: dict | None = None

class LLMProvider:
    name: str = "base"

    def generate(self, *, system: str, user: str, json_schema: dict | None = None) -> LLMResult:
        raise NotImplementedError

class MockLLMProvider(LLMProvider):
    name = "mock"

    def generate(self, *, system: str, user: str, json_schema: dict | None = None) -> LLMResult:
        # Deterministic output for tests/dev (no PHI logging).
        # We do not include the prompt content; we just return stable text.
        base = "CLINICSCRIBE_MOCK_OUTPUT"
        if json_schema:
            structured = {k: f"mock_{k}" for k in json_schema.get("properties", {}).keys()}
            return LLMResult(text=f"{base}: GENERATED_FORM_DRAFT", structured=structured)
        return LLMResult(text=f"{base}: GENERATED_TEXT_DRAFT", structured=None)

class OpenAICompatibleProvider(LLMProvider):
    name = "openai"

    def __init__(self, base_url: str, api_key: str, model: str):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.model = model

    def generate(self, *, system: str, user: str, json_schema: dict | None = None) -> LLMResult:
        # OpenAI-compatible /v1/chat/completions
        url = f"{self.base_url}/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
        }
        messages = [{"role": "system", "content": system}, {"role": "user", "content": user}]
        payload = {"model": self.model, "messages": messages}
        # Optional structured output hint (provider-dependent; keep generic)
        if json_schema:
            payload["response_format"] = {"type": "json_object"}

        req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode("utf-8"))

        content = data["choices"][0]["message"]["content"]
        structured = None
        if json_schema:
            try:
                structured = json.loads(content)
            except Exception:
                structured = None
        return LLMResult(text=content, structured=structured)

def get_provider():
    from django.conf import settings
    if settings.LLM_PROVIDER == "openai":
        return OpenAICompatibleProvider(settings.OPENAI_BASE_URL, settings.OPENAI_API_KEY, settings.OPENAI_MODEL)
    return MockLLMProvider()
