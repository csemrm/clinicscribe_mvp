from __future__ import annotations

from typing import Tuple

from backend.core.forms_library import FORMS_LIBRARY
from backend.core.models import AuditEvent, Document, Encounter
from backend.core.red_flags import detect_red_flags


def _soap_template(encounter: Encounter) -> Tuple[str, dict]:
    assessment = "Assessment: Draft generated from clinician notes."
    plan = "Plan: Review with clinician and finalize before export."
    body = (
        f"Subjective\n{encounter.raw_notes.strip() or encounter.chief_complaint.strip() or 'No raw notes entered.'}\n\n"
        f"Objective\n{encounter.metadata.get('objective', 'Not provided')}\n\n"
        f"Assessment\n{assessment}\n\n"
        f"Plan\n{plan}"
    )
    return body, {"sections": ["Subjective", "Objective", "Assessment", "Plan"]}


def _avs_template(encounter: Encounter) -> Tuple[str, dict]:
    body = (
        f"After Visit Summary\n\nReason for visit: {encounter.chief_complaint or 'Not provided'}\n\n"
        "Follow the clinician-approved instructions in the final version.\n"
        "This draft is for review only."
    )
    return body, {"sections": ["After Visit Summary"]}


def _form_template(encounter: Encounter, form_kind: str) -> Tuple[str, dict]:
    label = FORMS_LIBRARY.get(form_kind, form_kind.upper())
    body = (
        f"{label}\n\nPatient: {encounter.patient}\n"
        f"Encounter: {encounter.id}\n\n"
        "Draft fields should be confirmed by the clinician before submission."
    )
    return body, {"form_kind": form_kind, "form_label": label}


def generate_document_content(encounter: Encounter, kind: str, prompt: str = "") -> Tuple[str, dict]:
    kind = kind.lower()
    if kind == Document.Kind.SOAP:
        body, meta = _soap_template(encounter)
    elif kind == Document.Kind.AVS:
        body, meta = _avs_template(encounter)
    else:
        body, meta = _form_template(encounter, kind)
    flags = detect_red_flags(encounter.raw_notes or encounter.chief_complaint or "")
    if flags:
        meta["red_flags"] = flags
    if prompt:
        meta["prompt"] = prompt
    return body, meta


def upsert_generated_document(encounter: Encounter, kind: str, user, prompt: str = "") -> Document:
    body, meta = generate_document_content(encounter, kind, prompt=prompt)
    title = {
        Document.Kind.SOAP: "SOAP Note",
        Document.Kind.AVS: "After Visit Summary",
    }.get(kind, FORMS_LIBRARY.get(kind, f"{kind.upper()} Draft"))
    document, _created = Document.objects.update_or_create(
        encounter=encounter,
        kind=kind,
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
        payload={"kind": kind, "meta": meta},
    )
    return document
