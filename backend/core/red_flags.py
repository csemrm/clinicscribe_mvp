import re

PATTERNS = [
    re.compile(r"\bsuicidal\b", re.IGNORECASE),
    re.compile(r"\bself[-\s]?harm\b", re.IGNORECASE),
]

def has_red_flag(text: str | None) -> bool:
    if not text:
        return False
    return any(p.search(text) for p in PATTERNS)
