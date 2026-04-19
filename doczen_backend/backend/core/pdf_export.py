from __future__ import annotations

from io import BytesIO

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.units import inch

from backend.core.models import Document


def build_final_pdf(document: Document) -> bytes:
    if document.status != Document.Status.FINAL:
        raise ValueError("Only final documents can be exported as PDF.")

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=54, leftMargin=54, topMargin=54, bottomMargin=54)
    styles = getSampleStyleSheet()
    story = []
    story.append(Paragraph(document.title, styles["Title"]))
    story.append(Spacer(1, 0.15 * inch))
    story.append(Paragraph(f"Encounter ID: {document.encounter_id}", styles["Normal"]))
    story.append(Spacer(1, 0.15 * inch))

    for block in (document.content or "").split("\n"):
        if block.strip():
            story.append(Paragraph(block.replace(" ", "&nbsp;"), styles["BodyText"]))
            story.append(Spacer(1, 0.08 * inch))
        else:
            story.append(Spacer(1, 0.05 * inch))

    if document.review_notes:
        story.append(Spacer(1, 0.1 * inch))
        story.append(Paragraph("Review Notes", styles["Heading2"]))
        story.append(Paragraph(document.review_notes.replace(" ", "&nbsp;"), styles["BodyText"]))

    doc.build(story)
    return buffer.getvalue()
