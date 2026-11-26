from flask import Blueprint, request, jsonify
from datetime import datetime, date
from extensions import db
from models.attendance_session import AttendanceSession
from models.class_model import Class
from middleware.auth_middleware import role_required, get_authenticated_user
from services.session_service import (
    create_session,
    update_session_status,
    verify_code_and_get_session,
    get_session_seat_map
)
from services.lecturer_service import get_session_attendance_details
from utils.code_generator import generate_attendance_code

bp = Blueprint('attendance_sessions', __name__, url_prefix='/api/attendance-sessions')

@bp.route('', methods=['GET'])
@role_required()
def get_sessions():
    class_id = request.args.get('class_id', type=int)
    status = request.args.get('status')
    date_str = request.args.get('date')

    query = AttendanceSession.query
    if class_id:
        query = query.filter_by(class_id=class_id)
    if status:
        query = query.filter_by(status=status.upper())
    if date_str:
        try:
            d = datetime.strptime(date_str, '%Y-%m-%d').date()
            query = query.filter_by(session_date=d)
        except ValueError:
            pass

    sessions = query.order_by(AttendanceSession.id.desc()).all()
    return jsonify([s.to_dict() for s in sessions]), 200

@bp.route('/<int:session_id>', methods=['GET'])
@role_required()
def get_session(session_id):
    session = AttendanceSession.query.get_or_404(session_id)
    return jsonify(session.to_dict()), 200

@bp.route('/<int:session_id>', methods=['PUT'])
@role_required('LECTURER', 'ADMINISTRATOR')
def update_session(session_id):
    current_user = get_authenticated_user()
    session = AttendanceSession.query.get_or_404(session_id)

    if current_user.role == 'LECTURER':
        if not current_user.lecturer_profile or (session.class_ref and session.class_ref.lecturer_id != current_user.lecturer_profile.id):
            return jsonify({'error': 'Forbidden', 'message': 'You can only edit your own sessions'}), 403

    data = request.get_json() or {}

    if 'session_date' in data and data['session_date']:
        try:
            session.session_date = datetime.strptime(data['session_date'], '%Y-%m-%d').date()
        except ValueError:
            pass

    if 'start_time' in data and data['start_time']:
        session.start_time = data['start_time'].strip()

    if 'end_time' in data and data['end_time']:
        session.end_time = data['end_time'].strip()

    if 'attendance_code' in data and data['attendance_code']:
        new_code = data['attendance_code'].strip().upper()
        existing = AttendanceSession.query.filter(
            AttendanceSession.attendance_code == new_code,
            AttendanceSession.status == 'OPEN',
            AttendanceSession.id != session.id
        ).first()
        if existing:
            return jsonify({'error': 'Conflict', 'message': f"Code '{new_code}' is already in use by another active session"}), 409
        session.attendance_code = new_code

    if 'start_student_id' in data:
        session.start_student_id = data['start_student_id'].strip().upper() if data['start_student_id'] else None

    if 'end_student_id' in data:
        session.end_student_id = data['end_student_id'].strip().upper() if data['end_student_id'] else None

    if 'classroom_id' in data and data['classroom_id']:
        session.classroom_id = int(data['classroom_id'])

    if 'status' in data and data['status'] in ('NOT_STARTED', 'OPEN', 'CLOSED'):
        session.status = data['status']

    db.session.commit()
    return jsonify({'message': 'Session details updated successfully', 'session': session.to_dict()}), 200

@bp.route('', methods=['POST'])
@role_required('LECTURER', 'ADMINISTRATOR')
def create_new_session():
    data = request.get_json() or {}
    class_id = data.get('class_id')
    classroom_id = data.get('classroom_id')
    session_date_str = data.get('session_date')
    start_time = data.get('start_time', '').strip()
    end_time = data.get('end_time', '').strip()
    custom_code = data.get('attendance_code')
    start_student_id = data.get('start_student_id', '').strip().upper() if data.get('start_student_id') else None
    end_student_id = data.get('end_student_id', '').strip().upper() if data.get('end_student_id') else None

    if not class_id or not classroom_id or not start_time or not end_time:
        return jsonify({'error': 'Bad Request', 'message': 'class_id, classroom_id, start_time, and end_time are required'}), 400

    if start_student_id and end_student_id:
        from utils.range_validator import is_student_id_in_range
        if not is_student_id_in_range(start_student_id, None, end_student_id):
            return jsonify({
                'error': 'Bad Request',
                'message': f"Start Student ID ('{start_student_id}') cannot be greater than End Student ID ('{end_student_id}')."
            }), 400

    session_date = None
    if session_date_str:
        try:
            session_date = datetime.strptime(session_date_str, '%Y-%m-%d').date()
        except ValueError:
            session_date = date.today()
    else:
        session_date = date.today()

    session_dict, error = create_session(
        class_id=class_id,
        classroom_id=classroom_id,
        session_date=session_date,
        start_time=start_time,
        end_time=end_time,
        custom_code=custom_code,
        start_student_id=start_student_id,
        end_student_id=end_student_id
    )
    if error:
        return jsonify({'error': 'Bad Request', 'message': error}), 400

    return jsonify({'message': 'Attendance session created successfully', 'session': session_dict}), 201

@bp.route('/<int:session_id>/status', methods=['PUT'])
@role_required('LECTURER', 'ADMINISTRATOR')
def change_status(session_id):
    data = request.get_json() or {}
    status = data.get('status', '').strip().upper()

    session_dict, error = update_session_status(session_id, status)
    if error:
        return jsonify({'error': 'Bad Request', 'message': error}), 400

    return jsonify({'message': f"Session status updated to '{status}'", 'session': session_dict}), 200

@bp.route('/<int:session_id>/regenerate-code', methods=['POST'])
@role_required('LECTURER', 'ADMINISTRATOR')
def regenerate_code(session_id):
    session = AttendanceSession.query.get_or_404(session_id)
    prefix = session.class_ref.subject.subject_code if (session.class_ref and session.class_ref.subject) else "ATT"
    session.attendance_code = generate_attendance_code(prefix)
    db.session.commit()
    return jsonify({'message': 'New attendance code generated', 'attendance_code': session.attendance_code}), 200

@bp.route('/verify-code', methods=['POST'])
@role_required('STUDENT')
def verify_code():
    user = get_authenticated_user()
    if not user or not user.student_profile:
        return jsonify({'error': 'Unauthorized', 'message': 'Student profile required'}), 403

    data = request.get_json() or {}
    session_id = data.get('session_id')
    code = data.get('attendance_code', '').strip()

    if not code:
        return jsonify({'error': 'Bad Request', 'message': 'Please enter the attendance code'}), 400

    result, error = verify_code_and_get_session(user.student_profile.id, session_id or code, input_code=code if session_id else None)
    if error:
        return jsonify({'error': 'Verification Failed', 'message': error}), 400

    return jsonify(result), 200

@bp.route('/<int:session_id>/seat-map', methods=['GET'])
@role_required()
def session_seat_map(session_id):
    user = get_authenticated_user()
    current_student_id = user.student_profile.id if (user and user.student_profile) else None

    data, error = get_session_seat_map(session_id, current_student_id)
    if error:
        return jsonify({'error': 'Bad Request', 'message': error}), 400

    return jsonify(data), 200

@bp.route('/<int:session_id>/live-view', methods=['GET'])
@role_required('LECTURER', 'ADMINISTRATOR')
def session_live_view(session_id):
    data, error = get_session_attendance_details(session_id)
    if error:
        return jsonify({'error': 'Bad Request', 'message': error}), 400

    return jsonify(data), 200

@bp.route('/<int:session_id>', methods=['DELETE'])
@role_required('LECTURER', 'ADMINISTRATOR')
def delete_session(session_id):
    current_user = get_authenticated_user()
    session = AttendanceSession.query.get_or_404(session_id)

    if current_user.role == 'LECTURER':
        if not current_user.lecturer_profile or (session.class_ref and session.class_ref.lecturer_id != current_user.lecturer_profile.id):
            return jsonify({'error': 'Forbidden', 'message': 'You can only delete your own sessions'}), 403

    from models.attendance import Attendance
    from models.seat_reservation import SeatReservation

    SeatReservation.query.filter_by(session_id=session.id).delete()
    Attendance.query.filter_by(session_id=session.id).delete()
    db.session.delete(session)
    db.session.commit()

    return jsonify({'message': 'Session deleted successfully'}), 200
