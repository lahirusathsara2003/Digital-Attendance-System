from datetime import datetime, date
from extensions import db
from models.attendance_session import AttendanceSession
from models.classroom import Classroom
from models.seat import Seat
from models.seat_reservation import SeatReservation
from models.attendance import Attendance
from models.enrollment import Enrollment
from models.class_model import Class
from utils.code_generator import generate_attendance_code
from utils.range_validator import is_student_id_in_range

def create_session(class_id, classroom_id, session_date, start_time, end_time, custom_code=None, start_student_id=None, end_student_id=None):
    class_obj = Class.query.get(class_id)
    if not class_obj:
        return None, "Class not found"

    classroom = Classroom.query.get(classroom_id)
    if not classroom:
        return None, "Classroom not found"

    code_prefix = class_obj.subject.subject_code if class_obj.subject else "ATT"
    code = custom_code or generate_attendance_code(code_prefix)

    # Ensure unique code among open sessions
    existing = AttendanceSession.query.filter_by(attendance_code=code, status='OPEN').first()
    if existing:
        code = generate_attendance_code(code_prefix)

    session = AttendanceSession(
        class_id=class_id,
        classroom_id=classroom_id,
        session_date=session_date or date.today(),
        start_time=start_time,
        end_time=end_time,
        attendance_code=code,
        status='NOT_STARTED',
        start_student_id=start_student_id,
        end_student_id=end_student_id
    )
    db.session.add(session)
    db.session.commit()
    return session.to_dict(), None

def update_session_status(session_id, new_status):
    if new_status not in ('NOT_STARTED', 'OPEN', 'CLOSED'):
        return None, "Invalid session status"

    session = AttendanceSession.query.get(session_id)
    if not session:
        return None, "Attendance session not found"

    session.status = new_status
    db.session.commit()
    return session.to_dict(), None

def verify_code_and_get_session(student_id, session_id_or_code, input_code=None):
    """
    Validate attendance code for a student and verify student enrollment and range.
    """
    if input_code is None:
        # User supplied code directly as lookup
        session = AttendanceSession.query.filter_by(attendance_code=session_id_or_code.strip()).first()
    else:
        session = AttendanceSession.query.get(session_id_or_code)
        if not session or session.attendance_code.strip() != input_code.strip():
            return None, "Invalid attendance code."

    if not session:
        return None, "Invalid attendance code."

    if session.status != 'OPEN':
        if session.status == 'CLOSED':
            return None, "Attendance session is currently closed."
        else:
            return None, "Attendance session has not started yet."

    # Check student enrollment in the session's class
    enrollment = Enrollment.query.filter_by(student_id=student_id, class_id=session.class_id).first()
    if not enrollment:
        return None, "You are not enrolled in this class."

    # Check Student ID range restriction if configured for this session
    from models.student import Student
    student = Student.query.get(student_id)
    if student and (session.start_student_id or session.end_student_id):
        if not is_student_id_in_range(student.student_id, session.start_student_id, session.end_student_id):
            range_label = f"'{session.start_student_id or 'Start'}' to '{session.end_student_id or 'End'}'"
            return None, f"Your Student ID ('{student.student_id}') is outside the allowed range ({range_label}) for this session."

    # Check if student already marked attendance / reserved seat in this session or class today
    existing_reservation = SeatReservation.query.filter_by(session_id=session.id, student_id=student_id).first()
    if not existing_reservation:
        existing_reservation = (
            SeatReservation.query.join(AttendanceSession)
            .filter(
                AttendanceSession.class_id == session.class_id,
                AttendanceSession.session_date == session.session_date,
                SeatReservation.student_id == student_id
            )
            .first()
        )

    existing_attendance = Attendance.query.filter_by(session_id=session.id, student_id=student_id).first()
    if not existing_attendance:
        existing_attendance = (
            Attendance.query.join(AttendanceSession)
            .filter(
                AttendanceSession.class_id == session.class_id,
                Attendance.attendance_date == session.session_date,
                Attendance.student_id == student_id
            )
            .first()
        )

    already_attended = (existing_reservation is not None) or (existing_attendance is not None)

    return {
        'session': session.to_dict(),
        'already_attended': already_attended,
        'existing_reservation': existing_reservation.to_dict() if existing_reservation else None,
        'existing_attendance': existing_attendance.to_dict() if existing_attendance else None
    }, None

def get_session_seat_map(session_id, current_student_id=None):
    session = AttendanceSession.query.get(session_id)
    if not session:
        return None, "Session not found"

    classroom = session.classroom
    if not classroom:
        return None, "Classroom not associated with this session"

    # Check if current student already reserved a seat in this session or in this class today
    current_student_reservation = None
    current_student_attendance = None
    if current_student_id:
        my_res = SeatReservation.query.filter_by(session_id=session.id, student_id=current_student_id).first()
        if not my_res:
            my_res = (
                SeatReservation.query.join(AttendanceSession)
                .filter(
                    AttendanceSession.class_id == session.class_id,
                    AttendanceSession.session_date == session.session_date,
                    SeatReservation.student_id == current_student_id
                )
                .first()
            )
        if my_res:
            current_student_reservation = my_res.to_dict()

        my_att = Attendance.query.filter_by(session_id=session.id, student_id=current_student_id).first()
        if not my_att:
            my_att = (
                Attendance.query.join(AttendanceSession)
                .filter(
                    AttendanceSession.class_id == session.class_id,
                    Attendance.attendance_date == session.session_date,
                    Attendance.student_id == current_student_id
                )
                .first()
            )
        if my_att:
            current_student_attendance = my_att.to_dict()

    # Fetch all seats of classroom
    seats = Seat.query.filter_by(classroom_id=classroom.id).order_by(Seat.row_number, Seat.column_number).all()

    # Fetch all active reservations for this session
    reservations = SeatReservation.query.filter_by(session_id=session.id).all()
    reservations_by_seat = {r.seat_id: r for r in reservations}

    # Fetch attendance records for this session
    attendance_records = Attendance.query.filter_by(session_id=session.id).all()
    attendance_by_student = {a.student_id: a for a in attendance_records}

    seat_list = []
    for s in seats:
        seat_data = s.to_dict()
        
        # Check if seat is reserved in this session
        res = reservations_by_seat.get(s.id)
        if s.status == 'UNAVAILABLE':
            seat_data['session_status'] = 'UNAVAILABLE'
        elif res:
            seat_data['session_status'] = 'RESERVED'
            is_my_seat = (current_student_id is not None and res.student_id == current_student_id)
            seat_data['reserved_by_current_student'] = is_my_seat
            seat_data['is_my_seat'] = is_my_seat
            seat_data['reservation'] = {
                'id': res.id,
                'student_id': res.student.id if res.student else None,
                'student_code': res.student.student_id if res.student else None,
                'student_name': res.student.name if res.student else None,
                'reserved_at': res.reserved_at.isoformat() if res.reserved_at else None,
                'attendance_status': attendance_by_student.get(res.student_id).status if (res.student_id in attendance_by_student) else 'PRESENT',
                'attendance_time': attendance_by_student.get(res.student_id).attendance_time if (res.student_id in attendance_by_student) else None
            }
        else:
            seat_data['session_status'] = 'AVAILABLE'
            seat_data['reserved_by_current_student'] = False
            seat_data['is_my_seat'] = False
            
        seat_list.append(seat_data)

    current_student_has_reserved = (current_student_reservation is not None) or (current_student_attendance is not None)

    return {
        'session': session.to_dict(),
        'classroom': classroom.to_dict(),
        'seats': seat_list,
        'total_seats': len(seat_list),
        'available_count': len([s for s in seat_list if s['session_status'] == 'AVAILABLE']),
        'reserved_count': len([s for s in seat_list if s['session_status'] == 'RESERVED']),
        'unavailable_count': len([s for s in seat_list if s['session_status'] == 'UNAVAILABLE']),
        'current_student_has_reserved': current_student_has_reserved,
        'current_student_reservation': current_student_reservation,
        'current_student_attendance': current_student_attendance
    }, None
