from __future__ import annotations

from celery import shared_task

from backend.core.models import Encounter
from backend.core.services import upsert_generated_document


@shared_task(bind=True)
def generate_document_task(self, encounter_id: int, kind: str, user_id: int | None = None, prompt: str = ""):
    encounter = Encounter.objects.select_related("clinic", "patient").get(id=encounter_id)
    user = encounter.created_by if user_id is None else encounter.clinic.users.filter(id=user_id).first()
    return upsert_generated_document(encounter, kind=kind, user=user, prompt=prompt).id
