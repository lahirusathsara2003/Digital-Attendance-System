from datetime import datetime, date
from extensions import db

class AttendanceSession(db.Model):
    __tablename__ = 'attendance_sessions'

    id = db.Column(db.Integer, primary_key=True)
    class_id = db.Column(db.Integer, db.ForeignKey('classes.id', ondelete='CASCADE'), nullable=False)
    classroom_id = db.Column(db.Integer, db.ForeignKey('classrooms.id', ondelete='RESTRICT'), nullable=False)
    session_date = db.Column(db.Date, nullable=False, default=date.today)
    start_time = db.Column(db.String(20), nullable=False)
    end_time = db.Column(db.String(20), nullable=False)
    attendance_code = db.Column(db.String(30), nullable=False, index=True)
    status = db.Column(db.String(20), nullable=False, default='NOT_STARTED')  # 'NOT_STARTED', 'OPEN', 'CLOSED'
    start_student_id = db.Column(db.String(50), nullable=True)
    end_student_id = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    class_ref = db.relationship('Class', back_populates='sessions')
    classroom = db.relationship('Classroom', back_populates='sessions')
    reservations = db.relationship('SeatReservation', back_populates='session', cascade="all, delete-orphan")
    attendance_records = db.relationship('Attendance', back_populates='session', cascade="all, delete-orphan")

    def to_dict(self, include_details=True, show_code=None):
        if show_code is None:
            try:
                from middleware.auth_middleware import get_authenticated_user
                user = get_authenticated_user()
                show_code = bool(user and user.role in ('LECTURER', 'ADMINISTRATOR'))
            except Exception:
                show_code = False

        data = {
            'id': self.id,
            'class_id': self.class_id,
            'classroom_id': self.classroom_id,
            'session_date': self.session_date.isoformat() if self.session_date else None,
            'start_time': self.start_time,
            'end_time': self.end_time,
            'attendance_code': self.attendance_code if show_code else None,
            'start_student_id': self.start_student_id,
            'end_student_id': self.end_student_id,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'total_reservations': len(self.reservations) if self.reservations else 0,
            'present_count': len([a for a in self.attendance_records if a.status in ('PRESENT', 'LATE')]) if self.attendance_records else 0
        }
        if include_details:
            if self.class_ref:
                data['class_name'] = self.class_ref.class_name
                data['semester'] = self.class_ref.semester
                data['academic_year'] = self.class_ref.academic_year
                if self.class_ref.subject:
                    data['subject_id'] = self.class_ref.subject.id
                    data['subject_name'] = self.class_ref.subject.subject_name
                    data['subject_code'] = self.class_ref.subject.subject_code
                if self.class_ref.lecturer:
                    data['lecturer_id'] = self.class_ref.lecturer.id
                    data['lecturer_name'] = self.class_ref.lecturer.name
                    data['lecturer_code'] = self.class_ref.lecturer.lecturer_id
            if self.classroom:
                data['classroom_name'] = self.classroom.room_name
                data['classroom_code'] = self.classroom.room_code
                data['rows'] = self.classroom.rows
                data['left_block_columns'] = self.classroom.left_block_columns
                data['right_block_columns'] = self.classroom.right_block_columns
        return data
