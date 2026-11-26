from datetime import date
from extensions import db
from models.lecturer import Lecturer
from models.class_model import Class
from models.attendance_session import AttendanceSession
from models.attendance import Attendance
from models.seat_reservation import SeatReservation
from models.seat import Seat
from models.enrollment import Enrollment

def get_lecturer_dashboard(lecturer_id):
    lecturer = Lecturer.query.get(lecturer_id)
    if not lecturer:
        return None, "Lecturer not found"

    classes = Class.query.filter_by(lecturer_id=lecturer.id).all()
    class_ids = [c.id for c in classes]

    today = date.today()

    today_sessions = AttendanceSession.query.filter(
        AttendanceSession.class_id.in_(class_ids),
        AttendanceSession.session_date == today
    ).all() if class_ids else []

    all_sessions = AttendanceSession.query.filter(
        AttendanceSession.class_id.in_(class_ids)
    ).order_by(AttendanceSession.id.desc()).all() if class_ids else []

    # Total unique enrolled students across lecturer's classes
    enrollments = Enrollment.query.filter(Enrollment.class_id.in_(class_ids)).all() if class_ids else []
    total_students = len(set(e.student_id for e in enrollments))

    # Active session stats
    active_sessions = [s for s in today_sessions if s.status == 'OPEN']
    active_session_stats = []
    for s in active_sessions:
        enrolled_count = len(s.class_ref.enrollments) if s.class_ref else 0
        present_count = len([a for a in s.attendance_records if a.status in ('PRESENT', 'LATE')])
        reserved_seats = len(s.reservations)
        total_seats = len(s.classroom.seats) if (s.classroom and s.classroom.seats) else 0
        available_seats = max(0, total_seats - reserved_seats)
        absent_count = max(0, enrolled_count - present_count)

        active_session_stats.append({
            'session': s.to_dict(),
            'total_students': enrolled_count,
            'present': present_count,
            'absent': absent_count,
            'reserved_seats': reserved_seats,
            'available_seats': available_seats
        })

    return {
        'lecturer': lecturer.to_dict(),
        'assigned_classes': [c.to_dict() for c in classes],
        'today_sessions': [s.to_dict() for s in today_sessions],
        'active_sessions_stats': active_session_stats,
        'total_assigned_classes': len(classes),
        'total_enrolled_students': total_students,
        'all_sessions_count': len(all_sessions)
    }, None

def update_attendance_record(attendance_id, new_status):
    if new_status not in ('PRESENT', 'ABSENT', 'LATE'):
        return None, "Invalid attendance status"

    record = Attendance.query.get(attendance_id)
    if not record:
        return None, "Attendance record not found"

    record.status = new_status
    db.session.commit()
    return record.to_dict(), None

def get_session_attendance_details(session_id):
    session = AttendanceSession.query.get(session_id)
    if not session:
        return None, "Session not found"

    class_ref = session.class_ref
    enrollments = Enrollment.query.filter_by(class_id=class_ref.id).all() if class_ref else []
    attendance_records = Attendance.query.filter_by(session_id=session.id).all()
    reservations = SeatReservation.query.filter_by(session_id=session.id).all()

    att_by_student = {a.student_id: a for a in attendance_records}
    res_by_student = {r.student_id: r for r in reservations}

    student_list = []
    for enr in enrollments:
        stud = enr.student
        att = att_by_student.get(stud.id)
        res = res_by_student.get(stud.id)
        
        student_list.append({
            'student_id': stud.id,
            'student_code': stud.student_id,
            'name': stud.name,
            'email': stud.email,
            'phone': stud.phone,
            'seat_number': res.seat.seat_number if (res and res.seat) else (att.seat.seat_number if (att and att.seat) else 'N/A'),
            'seat_block': res.seat.block if (res and res.seat) else None,
            'status': att.status if att else 'ABSENT',
            'attendance_id': att.id if att else None,
            'attendance_time': att.attendance_time if att else None,
            'reservation_time': res.reserved_at.isoformat() if res else None
        })

    return {
        'session': session.to_dict(),
        'students': student_list,
        'total_enrolled': len(enrollments),
        'present_count': len([a for a in attendance_records if a.status in ('PRESENT', 'LATE')]),
        'absent_count': len(enrollments) - len([a for a in attendance_records if a.status in ('PRESENT', 'LATE')]),
        'late_count': len([a for a in attendance_records if a.status == 'LATE'])
    }, None
