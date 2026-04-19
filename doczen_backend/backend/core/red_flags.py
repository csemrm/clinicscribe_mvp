from __future__ import annotations

import re
from typing import List

RED_FLAG_PATTERNS = [
    (r"\bchest pain\b", "Chest pain mentioned"),
    (r"\bshortness of breath\b", "Shortness of breath mentioned"),
    (r"\bsuicid(al|e)\b", "Suicidality mentioned"),
    (r"\bsevere\b", "Severity keyword detected"),
    (r"\bstat\b", "STAT / urgent keyword detected"),
    (r"\ballergy\b", "Allergy mentioned"),
    (r"\bmedication error\b", "Medication error mentioned"),
]


def detect_red_flags(text: str) -> List[str]:
    if not text:
        return []
    lowered = text.lower()
    flags = []
    for pattern, label in RED_FLAG_PATTERNS:
        if re.search(pattern, lowered):
            flags.append(label)
    return list(dict.fromkeys(flags))
