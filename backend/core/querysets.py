def clinic_filtered_queryset(qs, user):
    # Ensures clinic isolation for models that have clinic FK via related fields
    if hasattr(qs.model, "clinic_id"):
        return qs.filter(clinic_id=user.clinic_id)
    return qs
