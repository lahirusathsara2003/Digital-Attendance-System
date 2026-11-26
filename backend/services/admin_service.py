from datetime import date, datetime, timedelta
from extensions import db
from models.user import User
from models.student import Student
from models.lecturer import Lecturer
from models.administrator import Administrator
from models.subject import Subject
from models.class_model import Class
from models.enrollment import Enrollment
from models.classroom import Classroom
from models.seat import Seat
from models.attendance_session import AttendanceSession
from models.attendance import Attendance
from utils.code_generator import generate_classroom_seats

def get_admin_dashboard():
    total_students = Student.query.count()
    total_lecturers = Lecturer.query.count()
    total_subjects = Subject.query.count()
    total_classes = Class.query.count()
    total_classrooms = Classroom.query.count()
    
    today = date.today()
    today_attendance = Attendance.query.filter_by(attendance_date=today, status='PRESENT').count()
    active_sessions = AttendanceSession.query.filter_by(status='OPEN').count()

    # Subject-wise attendance stats
    subjects = Subject.query.all()
    subject_chart_data = []
    for sub in subjects:
        # Total attendance records for this subject
        att_count = Attendance.query.join(AttendanceSession).join(Class).filter(Class.subject_id == sub.id, Attendance.status == 'PRESENT').count()
        sess_count = AttendanceSession.query.join(Class).filter(Class.subject_id == sub.id).count()
        subject_chart_data.append({
            'subject_name': sub.subject_name,
            'subject_code': sub.subject_code,
            'attendance_count': att_count,
            'sessions_count': sess_count
        })

    # Last 7 days attendance trend
    date_chart_data = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        count = Attendance.query.filter_by(attendance_date=day, status='PRESENT').count()
        date_chart_data.append({
            'date': day.strftime('%d/%m'),
            'present': count
        })

    return {
        'total_students': total_students,
        'total_lecturers': total_lecturers,
        'total_subjects': total_subjects,
        'total_classes': total_classes,
        'total_classrooms': total_classrooms,
        'today_attendance': today_attendance,
        'active_sessions': active_sessions,
        'subject_statistics': subject_chart_data,
        'date_trends': date_chart_data
    }

# Classroom Seat Management
def update_seat_status(seat_id, status, seat_number=None):
    seat = Seat.query.get(seat_id)
    if not seat:
        return None, "Seat not found"

    if status:
        seat.status = status
    if seat_number:
        seat.seat_number = str(seat_number)

    db.session.commit()
    return seat.to_dict(), None

def configure_classroom_layout(classroom_id, rows, left_block_columns, right_block_columns, room_name=None):
    classroom = Classroom.query.get(classroom_id)
    if not classroom:
        return None, "Classroom not found"

    classroom.rows = rows
    classroom.left_block_columns = left_block_columns
    classroom.right_block_columns = right_block_columns
    if room_name:
        classroom.room_name = room_name

    db.session.commit()
    # Regenerate seats for the updated layout
    generate_classroom_seats(classroom)
    return classroom.to_dict(include_seats=True), None
