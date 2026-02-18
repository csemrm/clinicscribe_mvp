from celery import shared_task
from django.utils import timezone
from .models import Encounter, Document, AuditEvent
from .llm.providers import get_provider
from .forms_library import FORM_TEMPLATES
from .services import create_audit

SYSTEM_PROMPT = (
    "You are ClinicScribe, a documentation assistant. "
    "Do NOT provide diagnosis. Create structured documentation drafts based on provided notes. "
    "Clinician must review."
)

def _encounter_context(enc: Encounter) -> dict:
    p = enc.patient
    return {
        "patient_name": p.name,
        "patient_dob": str(p.dob),
        "patient_mrn": p.mrn or "",
        "visit_type": enc.visit_type,
        "occurred_at": enc.occurred_at.isoformat(),
        "clinician_email": enc.clinician.email,
        "raw_notes": enc.raw_notes or "",
        "patient_context": p.context or "",
    }

@shared_task
def generate_soap(encounter_id: int, user_id: int):
    enc = Encounter.objects.select_related("patient","clinician","clinic").get(id=encounter_id)
    ctx = _encounter_context(enc)
    user_prompt = f"""Create a SOAP note draft.

Patient context:
{ctx['patient_context']}

Raw notes:
{ctx['raw_notes']}

Return with headings:
Subjective:\nObjective:\nAssessment:\nPlan:
"""
    provider = get_provider()
    res = provider.generate(system=SYSTEM_PROMPT, user=user_prompt)
    doc = Document.objects.create(
        encounter=enc,
        type=Document.Type.SOAP,
        status=Document.Status.DRAFT_AI,
        ai_draft_text=res.text,
        final_text=res.text,
        structured_json=None,
        created_by_id=user_id,
    )
    create_audit(doc, action=AuditEvent.Action.GENERATED, actor_id=user_id, from_status=None, to_status=doc.status, metadata={"type": "SOAP"})
    return doc.id

@shared_task
def generate_avs(encounter_id: int, user_id: int):
    enc = Encounter.objects.select_related("patient","clinician","clinic").get(id=encounter_id)
    ctx = _encounter_context(enc)
    user_prompt = f"""Write an After-Visit Summary in plain language (no diagnosis).\n\nPatient: {ctx['patient_name']}\nVisit type: {ctx['visit_type']}\n\nRaw notes:\n{ctx['raw_notes']}\n\nKeep it short, friendly, and actionable.\n"""
    provider = get_provider()
    res = provider.generate(system=SYSTEM_PROMPT, user=user_prompt)
    doc = Document.objects.create(
        encounter=enc,
        type=Document.Type.AVS,
        status=Document.Status.DRAFT_AI,
        ai_draft_text=res.text,
        final_text=res.text,
        structured_json=None,
        created_by_id=user_id,
    )
    create_audit(doc, action=AuditEvent.Action.GENERATED, actor_id=user_id, from_status=None, to_status=doc.status, metadata={"type": "AVS"})
    return doc.id

@shared_task
def generate_form(encounter_id: int, user_id: int, form_type: str, extra_fields: dict):
    enc = Encounter.objects.select_related("patient","clinician","clinic").get(id=encounter_id)
    tpl = FORM_TEMPLATES[form_type]
    ctx = _encounter_context(enc)
    prompt = tpl["prompt"].format(**ctx, extra_fields=extra_fields)
    provider = get_provider()
    res = provider.generate(system=SYSTEM_PROMPT, user=prompt, json_schema=tpl["schema"])
    doc = Document.objects.create(
        encounter=enc,
        type=form_type,
        status=Document.Status.DRAFT_AI,
        ai_draft_text=res.text,
        final_text=res.text,
        structured_json=res.structured or extra_fields,
        created_by_id=user_id,
    )
    create_audit(doc, action=AuditEvent.Action.GENERATED, actor_id=user_id, from_status=None, to_status=doc.status, metadata={"type": form_type})
    return doc.id
