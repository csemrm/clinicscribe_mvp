from django.utils import timezone
from django.db import transaction
from .models import Document, AuditEvent

def create_audit(document: Document, *, action: str, actor, from_status=None, to_status=None, metadata=None):
    AuditEvent.objects.create(
        document=document,
        action=action,
        actor=actor,
        from_status=from_status,
        to_status=to_status,
        metadata=metadata or {},
    )

@transaction.atomic
def submit_review(document: Document, *, actor):
    if document.status != Document.Status.DRAFT_AI:
        raise ValueError("Only AI drafts can be submitted for review.")
    from_status = document.status
    document.status = Document.Status.REVIEWED
    document.reviewed_by = actor
    document.reviewed_at = timezone.now()
    document.version += 1
    document.save(update_fields=["status","reviewed_by","reviewed_at","version","updated_at"])
    create_audit(document, action=AuditEvent.Action.SUBMIT_REVIEW, actor=actor, from_status=from_status, to_status=document.status)

@transaction.atomic
def finalize_document(document: Document, *, actor):
    if document.status != Document.Status.REVIEWED:
        raise ValueError("Only reviewed documents can be finalized.")
    from_status = document.status
    document.status = Document.Status.FINAL
    document.finalized_at = timezone.now()
    document.version += 1
    document.save(update_fields=["status","finalized_at","version","updated_at"])
    create_audit(document, action=AuditEvent.Action.FINALIZED, actor=actor, from_status=from_status, to_status=document.status)
