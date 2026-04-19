from __future__ import annotations

from django.db.models import QuerySet


def clinic_scope(qs: QuerySet, clinic):
    return qs.filter(clinic=clinic)
