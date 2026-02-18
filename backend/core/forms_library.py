FORM_TEMPLATES = {
    "FORM_PRIOR_AUTH": {
        "title": "Prior Authorization Request",
        "schema": {
            "type": "object",
            "properties": {
                "medication_or_service": {"type": "string"},
                "diagnosis_summary": {"type": "string"},
                "clinical_justification": {"type": "string"},
                "requested_duration": {"type": "string"},
            },
            "required": ["medication_or_service", "clinical_justification"],
        },
        "prompt": """Draft a Prior Authorization request letter.

Patient: {patient_name}, DOB: {patient_dob}, MRN: {patient_mrn}
Encounter date: {occurred_at}, Visit type: {visit_type}
Clinician: {clinician_email}

Raw notes (may be incomplete):
{raw_notes}

Extra fields:
{extra_fields}

Write a concise letter with: requested medication/service, clinical justification, brief dx summary, requested duration, and closing.
""",
    },
    "FORM_REFERRAL": {
        "title": "Referral Letter",
        "schema": {
            "type": "object",
            "properties": {
                "referred_to": {"type": "string"},
                "reason_for_referral": {"type": "string"},
                "pertinent_history": {"type": "string"},
            },
            "required": ["referred_to", "reason_for_referral"],
        },
        "prompt": """Draft a referral letter.

Patient: {patient_name}, DOB: {patient_dob}
Encounter date: {occurred_at}
Clinician: {clinician_email}

Raw notes:
{raw_notes}

Extra fields:
{extra_fields}

Write: to whom referred, reason, pertinent history, and requested evaluation.
""",
    },
    "FORM_EXCUSE": {
        "title": "Work/School Excuse Note",
        "schema": {
            "type": "object",
            "properties": {
                "excuse_dates": {"type": "string"},
                "limitations": {"type": "string"},
            },
            "required": ["excuse_dates"],
        },
        "prompt": """Draft a work/school excuse note.

Patient: {patient_name}, DOB: {patient_dob}
Encounter date: {occurred_at}
Clinician: {clinician_email}

Raw notes:
{raw_notes}

Extra fields:
{extra_fields}

Keep it short, professional, non-diagnostic.
""",
    },
    "FORM_MED_NECESSITY": {
        "title": "Medical Necessity Letter",
        "schema": {
            "type": "object",
            "properties": {
                "service_or_device": {"type": "string"},
                "need_summary": {"type": "string"},
                "duration": {"type": "string"},
            },
            "required": ["service_or_device", "need_summary"],
        },
        "prompt": """Draft a medical necessity letter.

Patient: {patient_name}, DOB: {patient_dob}
Encounter date: {occurred_at}
Clinician: {clinician_email}

Raw notes:
{raw_notes}

Extra fields:
{extra_fields}

Write concise justification and duration.
""",
    },
}
