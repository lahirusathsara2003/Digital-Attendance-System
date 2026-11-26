from datetime import datetime, date
from extensions import db
from models.attendance_session import AttendanceSession
from models.seat import Seat
from models.student import Student
from models.enrollment import Enrollment
from models.seat_reservation import SeatReservation
from models.attendance import Attendance
from utils.range_validator import is_student_id_in_range

def reserve_seat_and_mark_attendance(session_id, student_id, seat_id, confirmed_student_code=None, confirmed_name=None):
    """
    Core physical classroom seat reservation and self-attendance transaction.
    Enforces all 8 business rules and creates both reservation and attendance records atomically.
    """
    session = AttendanceSession.query.get(session_id)
    if not session:
        return None, "Attendance session not found."

    # Rule 4: Session must be OPEN
    if session.status != 'OPEN':
        if session.status == 'CLOSED':
            return None, "Attendance session is currently closed."
        else:
            return None, "Attendance session has not started yet."

    student = Student.query.get(student_id)
    if not student:
        return None, "Student record not found."

    # Student ID & Name Confirmation validation
    if confirmed_student_code and confirmed_student_code.strip().upper() != student.student_id.strip().upper():
        return None, f"Student ID verification failed. Provided '{confirmed_student_code}', expected '{student.student_id}'."

    # Check enrollment in class
    enrollment = Enrollment.query.filter_by(student_id=student.id, class_id=session.class_id).first()
    if not enrollment:
        return None, "You are not enrolled in this class."

    # Check Student ID range restriction if configured for this session
    if session.start_student_id or session.end_student_id:
        if not is_student_id_in_range(student.student_id, session.start_student_id, session.end_student_id):
            range_label = f"'{session.start_student_id or 'Start'}' to '{session.end_student_id or 'End'}'"
            return None, f"Your Student ID ('{student.student_id}') is outside the allowed range ({range_label}) for this session."

    # Rule 2 & Rule 8: Student cannot reserve more than one seat or mark attendance twice in one session
    existing_reservation = SeatReservation.query.filter_by(session_id=session.id, student_id=student.id).first()
    if existing_reservation:
        seat_label = f"Seat #{existing_reservation.seat.seat_number}" if existing_reservation.seat else "a seat"
        return None, f"You have already reserved {seat_label} and marked attendance for this session. A student cannot mark more than one seat."

    existing_attendance = Attendance.query.filter_by(session_id=session.id, student_id=student.id).first()
    if existing_attendance:
        seat_label = f" (Seat #{existing_attendance.seat.seat_number})" if existing_attendance.seat else ""
        return None, f"You have already marked attendance{seat_label} for this session."

    # Prevent student from marking multiple seats in the same class on the same day
    existing_class_res = (
        SeatReservation.query.join(AttendanceSession)
        .filter(
            AttendanceSession.class_id == session.class_id,
            AttendanceSession.session_date == session.session_date,
            SeatReservation.student_id == student.id
        )
        .first()
    )
    if existing_class_res:
        seat_label = f"Seat #{existing_class_res.seat.seat_number}" if existing_class_res.seat else "a seat"
        return None, f"You have already reserved {seat_label} for this class today. A student cannot mark more than one seat in the same class."

    existing_class_att = (
        Attendance.query.join(AttendanceSession)
        .filter(
            AttendanceSession.class_id == session.class_id,
            Attendance.attendance_date == session.session_date,
            Attendance.student_id == student.id
        )
        .first()
    )
    if existing_class_att:
        seat_label = f" (Seat #{existing_class_att.seat.seat_number})" if existing_class_att.seat else ""
        return None, f"You have already marked attendance{seat_label} for this class today."

    # Seat validation
    seat = Seat.query.get(seat_id)
    if not seat or seat.classroom_id != session.classroom_id:
        return None, "Selected seat is not valid for this classroom."

    if seat.status == 'UNAVAILABLE':
        return None, f"Seat {seat.seat_number} is currently unavailable."

    # Rule 1 & Rule 3 & Rule 7: Seat cannot be reserved by another student
    seat_already_reserved = SeatReservation.query.filter_by(session_id=session.id, seat_id=seat.id).first()
    if seat_already_reserved:
        return None, f"Seat {seat.seat_number} has already been reserved by another student."

    now = datetime.now()
    time_str = now.strftime('%I:%M %p')
    today = date.today()

    try:
        # Atomic creation of SeatReservation and Attendance
        reservation = SeatReservation(
            session_id=session.id,
            student_id=student.id,
            seat_id=seat.id,
            reserved_at=now
        )
        db.session.add(reservation)

        attendance = Attendance(
            session_id=session.id,
            student_id=student.id,
            seat_id=seat.id,
            attendance_date=today,
            attendance_time=time_str,
            status='PRESENT'
        )
        db.session.add(attendance)

        db.session.commit()

        # Build complete confirmation response
        return {
            'reservation_id': reservation.id,
            'attendance_id': attendance.id,
            'student_id': student.student_id,
            'student_name': student.name,
            'subject_name': session.class_ref.subject.subject_name if session.class_ref and session.class_ref.subject else 'N/A',
            'subject_code': session.class_ref.subject.subject_code if session.class_ref and session.class_ref.subject else 'N/A',
            'class_name': session.class_ref.class_name if session.class_ref else 'N/A',
            'room_name': session.classroom.room_name if session.classroom else 'N/A',
            'room_code': session.classroom.room_code if session.classroom else 'N/A',
            'seat_number': seat.seat_number,
            'seat_block': seat.block,
            'seat_row': seat.row_number,
            'seat_column': seat.column_number,
            'date': today.strftime('%d/%m/%Y'),
            'time': time_str,
            'status': 'PRESENT',
            'attendance_code': session.attendance_code
        }, None

    except Exception as e:
        db.session.rollback()
        return None, f"Failed to complete reservation: {str(e)}"
