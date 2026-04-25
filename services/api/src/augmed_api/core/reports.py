"""PDF report generation using ReportLab (pure Python, no native deps)."""
from __future__ import annotations

import logging
from datetime import UTC, datetime
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    Image as RLImage,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

logger = logging.getLogger(__name__)

_BRAND_COLOR = colors.HexColor("#0f3460")
_ACCENT_GREEN = colors.HexColor("#27ae60")
_ACCENT_ORANGE = colors.HexColor("#e67e22")
_ACCENT_RED = colors.HexColor("#c0392b")
_LIGHT_BG = colors.HexColor("#f4f6fa")

_LABEL_COLORS = {
    "Healthy": _ACCENT_GREEN,
    "Pneumonia": _ACCENT_ORANGE,
    "Tuberculosis": _ACCENT_RED,
}


def _resolve_image(path: str | Path | None, width: float = 5 * cm) -> RLImage | None:
    if not path:
        return None
    p = Path(path)
    if not p.exists():
        return None
    try:
        return RLImage(str(p), width=width, height=width, kind="proportional")
    except Exception:
        return None


def generate_pdf_report(
    *,
    case_id: str,
    patient_reference: str | None,
    modality: str,
    status: str,
    created_at: str,
    notes: str | None,
    label: str,
    confidence: float,
    model_name: str,
    model_version: str,
    enhanced_technique: str,
    heatmap_method: str,
    original_path: str | None,
    enhanced_path: str | None,
    heatmap_path: str | None,
    review: dict | None,
    output_path: Path,
) -> Path:
    """Render the case report as a PDF and write it to *output_path*."""
    generated_at = datetime.now(UTC).strftime("%Y-%m-%d %H:%M UTC")
    output_path.parent.mkdir(parents=True, exist_ok=True)

    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.5 * cm,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "AugMedTitle",
        parent=styles["Title"],
        fontSize=18,
        textColor=colors.white,
        spaceAfter=4,
    )
    subtitle_style = ParagraphStyle(
        "AugMedSubtitle",
        parent=styles["Normal"],
        fontSize=9,
        textColor=colors.HexColor("#cccccc"),
    )
    section_style = ParagraphStyle(
        "SectionTitle",
        parent=styles["Heading2"],
        fontSize=12,
        textColor=_BRAND_COLOR,
        spaceBefore=12,
        spaceAfter=6,
        borderWidth=0,
        borderPadding=0,
    )
    normal = styles["Normal"]
    small_gray = ParagraphStyle("SmallGray", parent=normal, fontSize=8, textColor=colors.gray)
    label_color = _LABEL_COLORS.get(label, _BRAND_COLOR)

    elements: list = []

    # --- Header banner ---
    header_data = [[
        Paragraph("AugMed  -  Chest X-Ray Analysis Report", title_style),
    ], [
        Paragraph(f"Case {case_id[:12]}...  |  Generated {generated_at}", subtitle_style),
    ]]
    header_table = Table(header_data, colWidths=[doc.width])
    header_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), _BRAND_COLOR),
        ("TOPPADDING", (0, 0), (-1, 0), 14),
        ("BOTTOMPADDING", (0, -1), (-1, -1), 10),
        ("LEFTPADDING", (0, 0), (-1, -1), 16),
        ("ROUNDEDCORNERS", [6, 6, 6, 6]),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 14))

    # --- Patient & Case Info ---
    elements.append(Paragraph("Patient &amp; Case Information", section_style))
    info_rows = [
        ["Patient Reference", patient_reference or "-"],
        ["Case ID", case_id],
        ["Modality", modality],
        ["Status", status.replace("_", " ").title()],
        ["Upload Date", created_at],
        ["Notes", notes or "-"],
    ]
    info_table = Table(
        [[Paragraph(f"<b>{r[0]}</b>", normal), Paragraph(str(r[1]), normal)] for r in info_rows],
        colWidths=[doc.width * 0.35, doc.width * 0.65],
    )
    info_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), _LIGHT_BG),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#eeeeee")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 10))

    # --- AI Prediction ---
    elements.append(Paragraph("AI Prediction", section_style))
    conf_pct = f"{confidence * 100:.1f}%"
    pred_rows = [
        ["Classification", Paragraph(f'<font color="{label_color.hexval()}">{label}</font>', normal)],
        ["Confidence", conf_pct],
        ["Model", f"{model_name} ({model_version})"],
    ]
    pred_table = Table(
        [
            [Paragraph(f"<b>{r[0]}</b>", normal), r[1] if isinstance(r[1], Paragraph) else Paragraph(str(r[1]), normal)]
            for r in pred_rows
        ],
        colWidths=[doc.width * 0.35, doc.width * 0.65],
    )
    pred_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), _LIGHT_BG),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#eeeeee")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(pred_table)
    elements.append(Spacer(1, 10))

    # --- Images ---
    images = []
    for img_path, caption in [
        (original_path, "Original"),
        (enhanced_path, f"Enhanced ({enhanced_technique})"),
        (heatmap_path, f"Grad-CAM ({heatmap_method})"),
    ]:
        rl_img = _resolve_image(img_path, width=5 * cm)
        if rl_img:
            images.append([rl_img, Paragraph(f"<font size='8'>{caption}</font>", normal)])

    if images:
        elements.append(Paragraph("Images", section_style))
        # Build a row of images with captions below each.
        img_cells = [[item[0] for item in images]]
        cap_cells = [[item[1] for item in images]]
        col_w = doc.width / max(len(images), 1)
        img_table = Table(img_cells + cap_cells, colWidths=[col_w] * len(images))
        img_table.setStyle(TableStyle([
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        elements.append(img_table)
        elements.append(Spacer(1, 10))

    # --- Expert Review ---
    if review:
        elements.append(Paragraph("Expert Review", section_style))
        review_rows = [
            ["Reviewer", review.get("reviewer_name", "-")],
            ["Decision", review.get("decision", "-")],
        ]
        if review.get("corrected_label"):
            review_rows.append(["Corrected Label", review["corrected_label"]])
        if review.get("comments"):
            review_rows.append(["Comments", review["comments"]])
        review_rows.append(["Reviewed At", review.get("reviewed_at", "-")])

        rev_table = Table(
            [[Paragraph(f"<b>{r[0]}</b>", normal), Paragraph(str(r[1]), normal)] for r in review_rows],
            colWidths=[doc.width * 0.35, doc.width * 0.65],
        )
        rev_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), _LIGHT_BG),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#eeeeee")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ]))
        elements.append(rev_table)
        elements.append(Spacer(1, 10))

    # --- Footer ---
    elements.append(Spacer(1, 16))
    elements.append(Paragraph(
        "AugMed Medical Imaging Workflow  |  "
        "This report is AI-generated and must be reviewed by a qualified clinician before clinical use.",
        small_gray,
    ))

    doc.build(elements)
    logger.info("PDF report written to %s", output_path)
    return output_path
