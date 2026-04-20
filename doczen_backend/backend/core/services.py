from __future__ import annotations

import logging
import os
from typing import Tuple

from openai import OpenAI

from backend.core.forms_library import FORMS_LIBRARY
from backend.core.models import AuditEvent, Document, Encounter
from backend.core.red_flags import detect_red_flags


logger = logging.getLogger(__name__)


def _soap_template(encounter: Encounter) -> Tuple[str, dict]:
    assessment = "Assessment: Draft generated from clinician notes."
    plan = "Plan: Review with clinician and finalize before export."
    body = (
        f"Subjective\n{_encounter_text(encounter)}\n\n"
        f"Objective\n{encounter.metadata.get('objective', 'Not provided')}\n\n"
        f"Assessment\n{assessment}\n\n"
        f"Plan\n{plan}"
    )
    return body, {"sections": ["Subjective", "Objective", "Assessment", "Plan"], "source": "template"}


def _avs_template(encounter: Encounter) -> Tuple[str, dict]:
    body = (
        f"After Visit Summary\n\nReason for visit: {_encounter_text(encounter)}\n\n"
        "Follow the clinician-approved instructions in the final version.\n"
        "This draft is for review only."
    )
    return body, {"sections": ["After Visit Summary"], "source": "template"}


def _form_template(encounter: Encounter, form_kind: str) -> Tuple[str, dict]:
    label = FORMS_LIBRARY.get(form_kind, form_kind.upper())
    body = (
        f"{label}\n\nPatient: {encounter.patient}\n"
        f"Encounter: {encounter.id}\n\n"
        "Draft fields should be confirmed by the clinician before submission."
    )
    return body, {"form_kind": form_kind, "form_label": label, "source": "template"}


def _encounter_text(encounter: Encounter) -> str:
    text = (getattr(encounter, "raw_notes", "") or getattr(encounter, "chief_complaint", "") or "").strip()
    if not text:
        return "No raw notes entered."
    return text[:5000]


def _fallback_chief_complaint(raw_notes: str) -> str:
    text = (raw_notes or "").strip()
    if not text:
        return ""
    first_sentence = text.split(".")[0].strip()
    words = first_sentence.split()
    return " ".join(words[:8])


def extract_chief_complaint(raw_notes: str) -> Tuple[str, dict]:
    notes = (raw_notes or "").strip()
    if not notes:
        return "", {"source": "empty"}

    api_key = os.getenv("OPENAI_API_KEY")
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    if not api_key:
        return _fallback_chief_complaint(notes), {"source": "fallback"}

    client = OpenAI(api_key=api_key)
    prompt = (
        "Extract the chief complaint from the clinical note below.\n"
        "Return only a short phrase of 2 to 8 words.\n"
        "Use plain clinical language.\n"
        "Do not include diagnosis, explanation, or punctuation unless needed.\n"
        "If the note is vague, return the most likely presenting problem.\n\n"
        f"Clinical note:\n{notes}"
    )

    response = client.responses.create(
        model=model,
        input=prompt,
    )
    chief = (response.output_text or "").strip()
    if not chief:
        chief = _fallback_chief_complaint(notes)
    return chief, {"source": "openai", "model": model}


def _build_ai_prompt(encounter: Encounter, kind: str, prompt: str = "") -> str:
    kind = (kind or "").lower()
    notes = _encounter_text(encounter)
    objective = (encounter.metadata or {}).get("objective", "Not provided")
    patient_name = str(encounter.patient)

    if kind == Document.Kind.SOAP:
        return (
            "You are a clinical documentation assistant drafting a SOAP note for clinician review only.\n"
            "Write in concise professional clinical language.\n"
            "Do not copy the raw notes verbatim. Synthesize the content.\n"
            "Do not invent facts. If a section is missing, write 'Not provided'.\n"
            "Use headings exactly: Subjective, Objective, Assessment, Plan.\n"
            "Assessment should be clinically meaningful and concise.\n"
            "Plan should be practical and consistent with the note.\n\n"
            f"Patient: {patient_name}\n"
            f"Chief complaint: {encounter.chief_complaint or 'Not provided'}\n"
            f"Objective: {objective}\n"
            f"Raw notes: {notes}\n"
            f"Additional instructions: {prompt or 'None'}"
        )

    if kind == Document.Kind.AVS:
        return (
            "You are a clinical documentation assistant drafting an After Visit Summary for patient-facing review only.\n"
            "Use clear plain language.\n"
            "Do not add new diagnoses or recommendations beyond the note.\n"
            "Do not copy the raw notes verbatim. Synthesize and simplify.\n"
            "If a detail is missing, write 'Not provided'.\n\n"
            f"Patient: {patient_name}\n"
            f"Chief complaint: {encounter.chief_complaint or 'Not provided'}\n"
            f"Raw notes: {notes}\n"
            f"Additional instructions: {prompt or 'None'}"
        )

    label = FORMS_LIBRARY.get(kind, kind.upper())
    return (
        "You are a clinical documentation assistant drafting a form for clinician review only.\n"
        "Complete the form using only the provided context.\n"
        "Do not invent missing data. Use placeholders such as 'Not provided' when needed.\n\n"
        f"Form label: {label}\n"
        f"Patient: {patient_name}\n"
        f"Encounter ID: {encounter.id}\n"
        f"Chief complaint: {encounter.chief_complaint or 'Not provided'}\n"
        f"Raw notes: {notes}\n"
        f"Additional instructions: {prompt or 'None'}"
    )


def _generate_with_openai(encounter: Encounter, kind: str, prompt: str = "") -> Tuple[str, dict]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured")

    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    client = OpenAI(api_key=api_key)
    response = client.responses.create(
        model=model,
        input=_build_ai_prompt(encounter, kind, prompt=prompt),
    )
    body = (response.output_text or "").strip()
    if not body:
        raise RuntimeError("OpenAI returned an empty response")
    meta = {
        "source": "openai",
        "model": model,
    }
    return body, meta


def generate_document_content(encounter: Encounter, kind: str, prompt: str = "") -> Tuple[str, dict]:
    kind = kind.lower()
    try:
        body, meta = _generate_with_openai(encounter, kind, prompt=prompt)
        meta["source"] = "openai"
    except Exception as exc:
        logger.warning("OpenAI generation failed for kind=%s: %s", kind, exc.__class__.__name__)
        if kind == Document.Kind.SOAP:
            body, meta = _soap_template(encounter)
        elif kind == Document.Kind.AVS:
            body, meta = _avs_template(encounter)
        else:
            body, meta = _form_template(encounter, kind)
        meta["fallback_reason"] = exc.__class__.__name__
    flags = detect_red_flags(encounter.raw_notes or encounter.chief_complaint or "")
    if flags:
        meta["red_flags"] = flags
    if prompt:
        meta["prompt"] = prompt
    return body, meta


def upsert_generated_document(encounter: Encounter, kind: str, user, prompt: str = "") -> Document:
    body, meta = generate_document_content(encounter, kind, prompt=prompt)
    normalized_kind = kind.lower()
    title = {
        Document.Kind.SOAP: "SOAP Note",
        Document.Kind.AVS: "After Visit Summary",
    }.get(normalized_kind, FORMS_LIBRARY.get(normalized_kind, f"{normalized_kind.upper()} Draft"))
    document, _created = Document.objects.update_or_create(
        encounter=encounter,
        kind=normalized_kind,
        defaults={
            "title": title,
            "content": body,
            "content_json": meta,
            "status": Document.Status.DRAFT,
        },
    )
    AuditEvent.objects.create(
        clinic=encounter.clinic,
        actor=user,
        entity_type="Document",
        entity_id=str(document.id),
        action="generated",
        payload={"kind": normalized_kind, "meta": meta},
    )
    return document
