from flask import Blueprint, request, jsonify, send_file
from datetime import datetime
from middleware.auth_middleware import role_required
from services.report_service import generate_attendance_report
from utils.pdf_excel_exporter import export_attendance_to_excel, export_attendance_to_pdf

bp = Blueprint('reports', __name__, url_prefix='/api/reports')

def _parse_report_filters():
    return {
        'report_type': request.args.get('type', 'overall'),
        'session_id': request.args.get('session_id', type=int),
        'student_id': request.args.get('student_id', type=int),
        'student_search': request.args.get('student_search'),
        'subject_id': request.args.get('subject_id', type=int),
        'class_id': request.args.get('class_id', type=int),
        'lecturer_id': request.args.get('lecturer_id', type=int),
        'status': request.args.get('status'),
        'search_query': request.args.get('search'),
        'start_date': datetime.strptime(request.args.get('start_date'), '%Y-%m-%d').date() if request.args.get('start_date') else None,
        'end_date': datetime.strptime(request.args.get('end_date'), '%Y-%m-%d').date() if request.args.get('end_date') else None,
        'exact_date': datetime.strptime(request.args.get('exact_date'), '%Y-%m-%d').date() if request.args.get('exact_date') else None,
    }

@bp.route('', methods=['GET'])
@role_required('ADMINISTRATOR', 'LECTURER')
def get_report_json():
    filters = _parse_report_filters()
    report_data = generate_attendance_report(**filters)
    return jsonify(report_data), 200

@bp.route('/export/excel', methods=['GET'])
@role_required('ADMINISTRATOR', 'LECTURER')
def export_excel():
    filters = _parse_report_filters()
    report_data = generate_attendance_report(**filters)
    excel_stream = export_attendance_to_excel(report_data)
    
    filename = f"attendance_report_{datetime.now().strftime('%Y%m%d_%H%M')}.xlsx"
    return send_file(
        excel_stream,
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        as_attachment=True,
        download_name=filename
    )

@bp.route('/export/pdf', methods=['GET'])
@role_required('ADMINISTRATOR', 'LECTURER')
def export_pdf():
    filters = _parse_report_filters()
    report_data = generate_attendance_report(**filters)
    pdf_stream = export_attendance_to_pdf(report_data)
    
    filename = f"attendance_report_{datetime.now().strftime('%Y%m%d_%H%M')}.pdf"
    return send_file(
        pdf_stream,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=filename
    )
