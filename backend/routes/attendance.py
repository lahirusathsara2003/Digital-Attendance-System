from flask import Blueprint, request, jsonify
from datetime import datetime, date
from extensions import db
from models.attendance import Attendance
from models.attendance_session import AttendanceSession
from models.student import Student
from models.class_model import Class
from middleware.auth_middleware import role_required, get_authenticated_user
from services.lecturer_service import update_attendance_record

bp = Blueprint('attendance', __name__, url_prefix='/api/attendance')

@bp.route('', methods=['GET'])
@role_required('ADMINISTRATOR', 'LECTURER')
def get_all_attendance():
    session_id = request.args.get('session_id', type=int)
    student_id = request.args.get('student_id', type=int)
    class_id = request.args.get('class_id', type=int)
    subject_id = request.args.get('subject_id', type=int)
    status = request.args.get('status')
    date_str = request.args.get('date')

    query = Attendance.query
    if session_id:
        query = query.filter_by(session_id=session_id)
    if student_id:
        query = query.filter_by(student_id=student_id)
    if status:
        query = query.filter_by(status=status.upper())
    if date_str:
        try:
            d = datetime.strptime(date_str, '%Y-%m-%d').date()
            query = query.filter_by(attendance_date=d)
        except ValueError:
            pass

    if class_id:
        query = query.join(AttendanceSession).filter(AttendanceSession.class_id == class_id)
    elif subject_id:
        query = query.join(AttendanceSession).join(Class).filter(Class.subject_id == subject_id)

    records = query.order_by(Attendance.id.desc()).all()
    return jsonify([r.to_dict() for r in records]), 200

@bp.route('/<int:attendance_id>', methods=['GET'])
@role_required()
def get_attendance_record(attendance_id):
    record = Attendance.query.get_or_404(attendance_id)
    return jsonify(record.to_dict()), 200

@bp.route('/<int:attendance_id>', methods=['PUT'])
@role_required('LECTURER', 'ADMINISTRATOR')
def edit_attendance(attendance_id):
    data = request.get_json() or {}
    new_status = data.get('status', '').strip().upper()

    record, error = update_attendance_record(attendance_id, new_status)
    if error:
        return jsonify({'error': 'Bad Request', 'message': error}), 400

    return jsonify({'message': f"Attendance status updated to '{new_status}'", 'attendance': record}), 200

@bp.route('/manual', methods=['POST'])
@role_required('LECTURER', 'ADMINISTRATOR')
def manual_mark_attendance():
    data = request.get_json() or {}
    session_id = data.get('session_id')
    student_id = data.get('student_id')
    status = data.get('status', 'PRESENT').upper()
    seat_id = data.get('seat_id')

    if not session_id or not student_id:
        return jsonify({'error': 'Bad Request', 'message': 'session_id and student_id are required'}), 400

    existing = Attendance.query.filter_by(session_id=session_id, student_id=student_id).first()
    now = datetime.now()
    time_str = now.strftime('%I:%M %p')

    if existing:
        existing.status = status
        existing.attendance_time = time_str
        if seat_id:
            existing.seat_id = seat_id
        db.session.commit()
        return jsonify({'message': 'Attendance updated successfully', 'attendance': existing.to_dict()}), 200

    attendance = Attendance(
        session_id=session_id,
        student_id=student_id,
        seat_id=seat_id,
        attendance_date=date.today(),
        attendance_time=time_str,
        status=status
    )
    db.session.add(attendance)
    db.session.commit()
    return jsonify({'message': 'Attendance marked manually', 'attendance': attendance.to_dict()}), 201
