from __future__ import annotations

import io
from html import escape
from textwrap import wrap

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch, mm
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from backend.core.models import Document


PAGE_WIDTH, PAGE_HEIGHT = letter

NAVY = colors.HexColor("#0F2747")
BLUE = colors.HexColor("#2563EB")
SLATE = colors.HexColor("#475569")
LIGHT_BG = colors.HexColor("#F8FAFC")
LINE = colors.HexColor("#D9E2EC")
SOFT_BLUE = colors.HexColor("#EAF2FF")
SOFT_GREEN = colors.HexColor("#E9F8EF")
SOFT_AMBER = colors.HexColor("#FFF5DF")


def _safe_text(value) -> str:
    if value is None:
        return ""
    return escape(str(value)).replace("\n", "<br/>")


def _encounter_text(document: Document) -> str:
    encounter = document.encounter
    text = (getattr(encounter, "raw_notes", "") or getattr(encounter, "chief_complaint", "") or "").strip()
    if not text:
        return "Not provided."
    return text[:5000]


def _split_soap_sections(content: str) -> dict[str, str]:
    sections = {"Subjective": "", "Objective": "", "Assessment": "", "Plan": ""}
    current = None

    for raw in (content or "").splitlines():
        line = raw.strip()
        if not line:
            continue
        normalized = line.strip("*").strip().rstrip(":").lower()
        if normalized == "subjective":
            current = "Subjective"
            continue
        if normalized == "objective":
            current = "Objective"
            continue
        if normalized == "assessment":
            current = "Assessment"
            continue
        if normalized == "plan":
            current = "Plan"
            continue
        if current:
            sections[current] = (sections[current] + "\n" + raw).strip() if sections[current] else raw

    return sections


def _section_card(title: str, body: str, accent: colors.Color) -> Table:
    styles = getSampleStyleSheet()
    section_title = ParagraphStyle(
        "SectionTitle",
        parent=styles["Heading3"],
        fontName="Helvetica-Bold",
        fontSize=9.5,
        leading=11,
        textColor=NAVY,
        spaceAfter=2,
    )
    section_body = ParagraphStyle(
        "SectionBody",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=8.3,
        leading=10.2,
        textColor=colors.black,
    )

    if not body.strip():
        body = "Not provided."

    inner = [
        Paragraph(title, section_title),
        Paragraph(_safe_text(body), section_body),
    ]

    tbl = Table([[inner]], colWidths=[6.95 * inch])
    tbl.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.white),
                ("BOX", (0, 0), (-1, -1), 0.7, accent),
                ("LEFTPADDING", (0, 0), (-1, -1), 9),
                ("RIGHTPADDING", (0, 0), (-1, -1), 9),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    return tbl


def _info_table(document: Document) -> Table:
    encounter = document.encounter
    patient = encounter.patient

    styles = getSampleStyleSheet()
    label_style = ParagraphStyle(
        "LabelStyle",
        parent=styles["BodyText"],
        fontName="Helvetica-Bold",
        fontSize=7.8,
        leading=9,
        textColor=SLATE,
    )
    value_style = ParagraphStyle(
        "ValueStyle",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=8.6,
        leading=10,
        textColor=NAVY,
    )

    data = [
        [
            Paragraph("PATIENT", label_style),
            Paragraph(_safe_text(patient), value_style),
            Paragraph("ENCOUNTER ID", label_style),
            Paragraph(_safe_text(encounter.id), value_style),
        ],
        [
            Paragraph("VISIT DATE", label_style),
            Paragraph(_safe_text(encounter.visit_date), value_style),
            Paragraph("DOCUMENT TYPE", label_style),
            Paragraph(_safe_text(document.kind.upper()), value_style),
        ],
        [
            Paragraph("CHIEF COMPLAINT", label_style),
            Paragraph(_safe_text(encounter.chief_complaint or "Not provided"), value_style),
            Paragraph("STATUS", label_style),
            Paragraph(_safe_text(document.status.upper()), value_style),
        ],
    ]

    tbl = Table(data, colWidths=[1.0 * inch, 2.35 * inch, 1.05 * inch, 2.0 * inch])
    tbl.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.white),
                ("BOX", (0, 0), (-1, -1), 0.8, LINE),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, LINE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return tbl


def _header_footer(canvas, doc, title: str) -> None:
    canvas.saveState()

    # Header background
    canvas.setFillColor(NAVY)
    canvas.rect(0, PAGE_HEIGHT - 0.95 * inch, PAGE_WIDTH, 0.95 * inch, fill=1, stroke=0)

    # Logo badge
    badge_x = doc.leftMargin
    badge_y = PAGE_HEIGHT - 0.77 * inch
    canvas.setFillColor(colors.white)
    canvas.roundRect(badge_x, badge_y, 0.55 * inch, 0.55 * inch, 6, fill=1, stroke=0)
    canvas.setFillColor(NAVY)
    canvas.setFont("Helvetica-Bold", 16)
    canvas.drawCentredString(badge_x + 0.275 * inch, badge_y + 0.17 * inch, "D")

    # Brand + department block
    text_x = badge_x + 0.7 * inch
    canvas.setFillColor(colors.white)
    canvas.setFont("Helvetica-Bold", 15)
    canvas.drawString(text_x, PAGE_HEIGHT - 0.43 * inch, "Doczen AI")
    canvas.setFont("Helvetica", 8.2)
    canvas.drawString(text_x, PAGE_HEIGHT - 0.58 * inch, "Hospital Clinical Documentation System")
    canvas.setFont("Helvetica-Bold", 8.2)
    canvas.drawString(text_x, PAGE_HEIGHT - 0.72 * inch, "Department of Medicine")

    # Right-aligned report title and confidentiality strip
    canvas.setFont("Helvetica-Bold", 10.5)
    canvas.drawRightString(PAGE_WIDTH - doc.rightMargin, PAGE_HEIGHT - 0.43 * inch, title)
    canvas.setFont("Helvetica", 7.5)
    canvas.drawRightString(PAGE_WIDTH - doc.rightMargin, PAGE_HEIGHT - 0.60 * inch, "Confidential - For Clinical Use Only")

    # Thin divider
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.6)
    canvas.line(doc.leftMargin, 0.55 * inch, PAGE_WIDTH - doc.rightMargin, 0.55 * inch)

    # Footer
    canvas.setFillColor(SLATE)
    canvas.setFont("Helvetica", 7.5)
    canvas.drawString(doc.leftMargin, 0.33 * inch, "Generated by Doczen AI for clinician review")
    canvas.drawRightString(PAGE_WIDTH - doc.rightMargin, 0.33 * inch, f"Page {canvas.getPageNumber()}")

    canvas.restoreState()


def build_final_pdf(document: Document) -> bytes:
    if document.status != Document.Status.FINAL:
        raise ValueError("Only finalized documents can be exported.")

    buffer = io.BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=0.45 * inch,
        rightMargin=0.45 * inch,
        topMargin=0.95 * inch,
        bottomMargin=0.65 * inch,
        title=f"Doczen AI - {document.kind.upper()}",
        author="Doczen AI",
        subject=f"{document.kind.upper()} export",
        creator="Doczen AI",
    )

    styles = getSampleStyleSheet()
    story = []

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=16,
        leading=18,
        textColor=NAVY,
        spaceAfter=0,
    )
    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=10,
        textColor=SLATE,
        spaceAfter=0,
    )

    story.append(Spacer(1, 0.06 * inch))
    story.append(Paragraph(f"{_safe_text(document.title or document.kind.upper())}", title_style))
    story.append(Spacer(1, 0.03 * inch))
    story.append(Paragraph("Clinician-reviewed clinical export", subtitle_style))
    story.append(Spacer(1, 0.10 * inch))

    story.append(_info_table(document))
    story.append(Spacer(1, 0.11 * inch))

    section_header = ParagraphStyle(
        "SectionHeader",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=11.5,
        leading=13,
        textColor=NAVY,
        spaceAfter=0,
    )
    story.append(Paragraph("Document Content", section_header))
    story.append(Spacer(1, 0.05 * inch))

    kind = (document.kind or "").lower()
    content = document.content or ""

    if kind == Document.Kind.SOAP:
        sections = _split_soap_sections(content)
        story.append(_section_card("Subjective", sections["Subjective"] or _encounter_text(document), SOFT_BLUE))
        story.append(Spacer(1, 0.05 * inch))
        story.append(_section_card("Objective", sections["Objective"], LIGHT_BG))
        story.append(Spacer(1, 0.05 * inch))
        story.append(_section_card("Assessment", sections["Assessment"], SOFT_AMBER))
        story.append(Spacer(1, 0.05 * inch))
        story.append(_section_card("Plan", sections["Plan"], SOFT_GREEN))
    else:
        chunks = [c.strip() for c in content.split("\n\n") if c.strip()] or ["Not provided."]
        for i, chunk in enumerate(chunks):
            title = None
            body = chunk
            if "\n" in chunk:
                first, rest = chunk.split("\n", 1)
                if len(first) < 80 and not first.endswith("."):
                    title = first.strip().strip("*").strip(":")
                    body = rest.strip()
            if title:
                story.append(_section_card(title, body, SOFT_BLUE if i % 2 == 0 else LIGHT_BG))
            else:
                story.append(_section_card("Content", body, LIGHT_BG))
            if i < len(chunks) - 1:
                story.append(Spacer(1, 0.05 * inch))

    if document.review_notes:
        story.append(Spacer(1, 0.08 * inch))
        story.append(_section_card("Review Notes", document.review_notes, SOFT_AMBER))

    story.append(Spacer(1, 0.08 * inch))
    story.append(HRFlowable(width="100%", thickness=0.8, color=LINE))
    story.append(Spacer(1, 0.08 * inch))

    signature = Table(
        [[
            Paragraph("<b>Prepared by:</b> Doczen AI", styles["BodyText"]),
            Paragraph("<b>Reviewed by:</b> Clinician", styles["BodyText"]),
        ]],
        colWidths=[3.35 * inch, 3.35 * inch],
    )
    signature.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 0.5, LINE),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, LINE),
                ("BACKGROUND", (0, 0), (-1, -1), colors.white),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    story.append(signature)

    story.append(Spacer(1, 0.07 * inch))
    story.append(
        Paragraph(
            "Draft output for clinician review and final approval.",
            ParagraphStyle(
                "FooterNote",
                parent=styles["Italic"],
                textColor=SLATE,
                fontSize=7.8,
                leading=9,
                alignment=TA_LEFT,
            ),
        )
    )

    title = f"{document.kind.upper()} NOTE"

    def on_page(canvas, doc_obj):
        _header_footer(canvas, doc_obj, title=title)

    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
