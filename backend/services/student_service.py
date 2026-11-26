from datetime import date
from models.student import Student
from models.enrollment import Enrollment
from models.attendance_session import AttendanceSession
from models.attendance import Attendance
from models.class_model import Class
from models.subject import Subject

def get_student_dashboard(student_id):
    student = Student.query.get(student_id)
    if not student:
        return None, "Student not found"

    enrollments = Enrollment.query.filter_by(student_id=student.id).all()
    enrolled_class_ids = [e.class_id for e in enrollments]

    today = date.today()

    # Active / today's sessions for enrolled classes
    today_sessions = AttendanceSession.query.filter(
        AttendanceSession.class_id.in_(enrolled_class_ids),
        AttendanceSession.session_date == today
    ).all() if enrolled_class_ids else []

    all_class_sessions = AttendanceSession.query.filter(
        AttendanceSession.class_id.in_(enrolled_class_ids)
    ).all() if enrolled_class_ids else []

    # Student's attendance records
    student_attendance = Attendance.query.filter_by(student_id=student.id).all()
    attended_session_ids = {a.session_id for a in student_attendance if a.status in ('PRESENT', 'LATE')}

    # Calculate overall attendance statistics
    total_completed_or_open_sessions = len(all_class_sessions)
    classes_attended = len(student_attendance)
    classes_missed = max(0, total_completed_or_open_sessions - classes_attended)
    overall_percentage = round((classes_attended / total_completed_or_open_sessions * 100), 1) if total_completed_or_open_sessions > 0 else 100.0

    # Subject-wise attendance calculation
    subject_stats = []
    for enr in enrollments:
        cls = enr.class_ref
        if not cls or not cls.subject:
            continue
        
        cls_sessions = [s for s in all_class_sessions if s.class_id == cls.id]
        cls_attended = [a for a in student_attendance if a.session and a.session.class_id == cls.id]
        
        total_cls_sess = len(cls_sessions)
        att_count = len(cls_attended)
        missed_count = max(0, total_cls_sess - att_count)
        pct = round((att_count / total_cls_sess * 100), 1) if total_cls_sess > 0 else 100.0

        subject_stats.append({
            'class_id': cls.id,
            'class_name': cls.class_name,
            'subject_id': cls.subject.id,
            'subject_code': cls.subject.subject_code,
            'subject_name': cls.subject.subject_name,
            'lecturer_name': cls.lecturer.name if cls.lecturer else 'N/A',
            'total_sessions': total_cls_sess,
            'attended': att_count,
            'missed': missed_count,
            'percentage': pct
        })

    # Prepare today sessions with status indicating whether student attended
    today_sessions_data = []
    for s in today_sessions:
        s_data = s.to_dict()
        s_data['is_attended'] = s.id in attended_session_ids
        # Find student's attendance record if attended
        att_rec = next((a for a in student_attendance if a.session_id == s.id), None)
        s_data['attendance_status'] = att_rec.status if att_rec else ('NOT_MARKED' if s.status == 'OPEN' else 'ABSENT')
        today_sessions_data.append(s_data)

    return {
        'student': student.to_dict(),
        'attendance_percentage': overall_percentage,
        'classes_attended': classes_attended,
        'classes_missed': classes_missed,
        'total_sessions': total_completed_or_open_sessions,
        'today_classes': today_sessions_data,
        'subject_statistics': subject_stats,
        'enrolled_classes': [e.to_dict() for e in enrollments]
    }, None

def get_student_attendance_history(student_id, subject_id=None, class_id=None):
    student = Student.query.get(student_id)
    if not student:
        return None, "Student not found"

    query = Attendance.query.filter_by(student_id=student.id)
    if class_id:
        query = query.join(AttendanceSession).filter(AttendanceSession.class_id == class_id)
    elif subject_id:
        query = query.join(AttendanceSession).join(Class).filter(Class.subject_id == subject_id)

    records = query.order_by(Attendance.attendance_date.desc(), Attendance.id.desc()).all()
    return [r.to_dict() for r in records], None
