from datetime import datetime, date
from extensions import db
from models.attendance import Attendance
from models.attendance_session import AttendanceSession
from models.class_model import Class
from models.subject import Subject
from models.student import Student
from models.lecturer import Lecturer
from models.classroom import Classroom
from models.enrollment import Enrollment

def generate_attendance_report(
    report_type='overall',
    session_id=None,
    student_id=None,
    student_search=None,
    subject_id=None,
    class_id=None,
    lecturer_id=None,
    start_date=None,
    end_date=None,
    exact_date=None,
    status=None,
    search_query=None
):
    """
    Generate structured report data for all attendance dimensions with filtering.
    """
    query = Attendance.query.join(AttendanceSession).join(Class).join(Subject).join(Student)

    if session_id:
        query = query.filter(Attendance.session_id == session_id)
    if student_id:
        query = query.filter(Attendance.student_id == student_id)
    if student_search:
        s_search = f"%{student_search}%"
        query = query.filter(
            db.or_(
                Student.name.ilike(s_search),
                Student.student_id.ilike(s_search),
            )
        )
    if class_id:
        query = query.filter(AttendanceSession.class_id == class_id)
    if subject_id:
        query = query.filter(Class.subject_id == subject_id)
    if lecturer_id:
        query = query.filter(Class.lecturer_id == lecturer_id)
    if status:
        query = query.filter(Attendance.status == status)
    if exact_date:
        query = query.filter(Attendance.attendance_date == exact_date)
    else:
        if start_date:
            query = query.filter(Attendance.attendance_date >= start_date)
        if end_date:
            query = query.filter(Attendance.attendance_date <= end_date)

    if search_query:
        search = f"%{search_query}%"
        query = query.filter(
            db.or_(
                Student.name.ilike(search),
                Student.student_id.ilike(search),
                Subject.subject_name.ilike(search),
                Class.class_name.ilike(search)
            )
        )

    records = query.order_by(Attendance.attendance_date.desc(), Attendance.id.desc()).all()
    record_dicts = [r.to_dict() for r in records]

    # Calculate summary metrics
    total_records = len(record_dicts)
    present_count = len([r for r in record_dicts if r['status'] == 'PRESENT'])
    late_count = len([r for r in record_dicts if r['status'] == 'LATE'])
    absent_count = len([r for r in record_dicts if r['status'] == 'ABSENT'])
    
    attendance_rate = round(((present_count + late_count) / total_records * 100), 1) if total_records > 0 else 100.0

    return {
        'report_type': report_type,
        'generated_at': datetime.now().strftime('%d/%m/%Y %I:%M %p'),
        'total_records': total_records,
        'present_count': present_count,
        'late_count': late_count,
        'absent_count': absent_count,
        'attendance_rate': attendance_rate,
        'records': record_dicts
    }
