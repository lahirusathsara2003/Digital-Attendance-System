import io
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def export_attendance_to_excel(report_data):
    """
    Generate styled Excel workbook from attendance report records in memory.
    """
    wb = Workbook()
    ws = wb.active
    ws.title = "Attendance Report"

    # Header styling
    header_fill = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
    header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    thin_border = Border(
        left=Side(style='thin', color='CBD5E1'),
        right=Side(style='thin', color='CBD5E1'),
        top=Side(style='thin', color='CBD5E1'),
        bottom=Side(style='thin', color='CBD5E1')
    )

    # Title & Metadata
    ws.merge_cells('A1:H1')
    ws['A1'] = "PHYSICAL CLASSROOM SEAT RESERVATION & ATTENDANCE REPORT"
    ws['A1'].font = Font(name="Calibri", size=14, bold=True, color="1E3A8A")
    ws['A1'].alignment = Alignment(horizontal="center")

    ws['A2'] = f"Generated: {report_data.get('generated_at', '')}"
    ws['A2'].font = Font(size=9, italic=True)

    ws['D2'] = f"Total: {report_data.get('total_records', 0)} | Present: {report_data.get('present_count', 0)} | Absent: {report_data.get('absent_count', 0)} | Rate: {report_data.get('attendance_rate', 0)}%"
    ws['D2'].font = Font(size=9, bold=True)

    headers = [
        "Student ID", "Student Name", "Subject", "Class",
        "Classroom", "Seat No", "Date", "Time", "Status"
    ]

    row_num = 4
    for col_num, header in enumerate(headers, 1):
        cell = ws.cell(row=row_num, column=col_num, value=header)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center")

    records = report_data.get('records', [])
    for rec in records:
        row_num += 1
        ws.cell(row=row_num, column=1, value=rec.get('student_code', ''))
        ws.cell(row=row_num, column=2, value=rec.get('student_name', ''))
        ws.cell(row=row_num, column=3, value=f"{rec.get('subject_code', '')} - {rec.get('subject_name', '')}")
        ws.cell(row=row_num, column=4, value=rec.get('class_name', ''))
        ws.cell(row=row_num, column=5, value=rec.get('classroom_name', ''))
        ws.cell(row=row_num, column=6, value=f"Seat {rec.get('seat_number', 'N/A')}")
        ws.cell(row=row_num, column=7, value=rec.get('attendance_date', ''))
        ws.cell(row=row_num, column=8, value=rec.get('attendance_time', ''))
        
        status_cell = ws.cell(row=row_num, column=9, value=rec.get('status', ''))
        if rec.get('status') == 'PRESENT':
            status_cell.font = Font(color="166534", bold=True)
        elif rec.get('status') == 'ABSENT':
            status_cell.font = Font(color="991B1B", bold=True)
        elif rec.get('status') == 'LATE':
            status_cell.font = Font(color="854D0E", bold=True)

        for col in range(1, 10):
            ws.cell(row=row_num, column=col).border = thin_border

    # Adjust column widths
    for col in ws.columns:
        max_len = max(len(str(cell.value or '')) for cell in col)
        col_letter = col[0].column_letter
        ws.column_dimensions[col_letter].width = max(max_len + 3, 12)

    output = io.BytesIO()
    wb.save(output)
    output.seek(0)
    return output

def export_attendance_to_pdf(report_data):
    """
    Generate styled PDF document from attendance report records.
    """
    output = io.BytesIO()
    doc = SimpleDocTemplate(
        output,
        pagesize=landscape(letter),
        rightMargin=30,
        leftMargin=30,
        topMargin=30,
        bottomMargin=30
    )
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=16,
        textColor=colors.HexColor('#1E3A8A'),
        spaceAfter=6,
        alignment=1
    )
    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#475569'),
        alignment=1
    )

    elements = [
        Paragraph("Physical Classroom Seat Reservation & Attendance Report", title_style),
        Paragraph(
            f"Generated: {report_data.get('generated_at', '')} | Total Records: {report_data.get('total_records', 0)} | "
            f"Present: {report_data.get('present_count', 0)} | Absent: {report_data.get('absent_count', 0)} | "
            f"Attendance Rate: {report_data.get('attendance_rate', 0)}%",
            meta_style
        ),
        Spacer(1, 15)
    ]

    table_data = [
        ["ID", "Name", "Subject", "Class", "Room", "Seat", "Date", "Time", "Status"]
    ]

    for r in report_data.get('records', []):
        table_data.append([
            r.get('student_code', ''),
            r.get('student_name', '')[:16],
            r.get('subject_code', ''),
            r.get('class_name', '')[:18],
            r.get('classroom_name', '')[:14],
            f"#{r.get('seat_number', '')}",
            r.get('attendance_date', ''),
            r.get('attendance_time', ''),
            r.get('status', '')
        ])

    col_widths = [50, 95, 60, 110, 85, 45, 65, 60, 55]
    t = Table(table_data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E3A8A')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
        ('TOPPADDING', (0, 0), (-1, 0), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
    ]))

    elements.append(t)
    doc.build(elements)
    output.seek(0)
    return output
