from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

DISCLAIMER = "For documentation assistance only; clinician must verify."

def render_document_pdf(*, clinic_name: str, patient_name: str, occurred_at: str, doc_title: str, body_text: str) -> bytes:
    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=letter)
    width, height = letter

    y = height - 72
    c.setFont("Helvetica-Bold", 14)
    c.drawString(72, y, clinic_name)
    y -= 18
    c.setFont("Helvetica", 11)
    c.drawString(72, y, f"Patient: {patient_name}")
    y -= 14
    c.drawString(72, y, f"Date: {occurred_at}")
    y -= 20
    c.setFont("Helvetica-Bold", 12)
    c.drawString(72, y, doc_title)
    y -= 18

    c.setFont("Helvetica", 10)
    # simple text wrap
    max_width = width - 144
    for para in (body_text or "").split("\n"):
        line = ""
        for word in para.split(" "):
            test = (line + " " + word).strip()
            if c.stringWidth(test, "Helvetica", 10) <= max_width:
                line = test
            else:
                c.drawString(72, y, line)
                y -= 12
                line = word
                if y < 72:
                    c.showPage()
                    y = height - 72
                    c.setFont("Helvetica", 10)
        if line:
            c.drawString(72, y, line)
            y -= 12
        y -= 6
        if y < 72:
            c.showPage()
            y = height - 72
            c.setFont("Helvetica", 10)

    # footer disclaimer
    c.setFont("Helvetica-Oblique", 9)
    c.drawString(72, 48, DISCLAIMER)

    c.showPage()
    c.save()
    return buf.getvalue()
