from datetime import datetime, date
from extensions import db

class Attendance(db.Model):
    __tablename__ = 'attendance'

    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('attendance_sessions.id', ondelete='CASCADE'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    seat_id = db.Column(db.Integer, db.ForeignKey('seats.id', ondelete='SET NULL'), nullable=True)
    attendance_date = db.Column(db.Date, nullable=False, default=date.today)
    attendance_time = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='PRESENT')  # 'PRESENT', 'ABSENT', 'LATE'

    __table_args__ = (
        db.UniqueConstraint('session_id', 'student_id', name='uq_session_student_attendance'),
    )

    # Relationships
    session = db.relationship('AttendanceSession', back_populates='attendance_records')
    student = db.relationship('Student', back_populates='attendance_records')
    seat = db.relationship('Seat', back_populates='attendance_records')

    def to_dict(self):
        data = {
            'id': self.id,
            'session_id': self.session_id,
            'student_id': self.student_id,
            'seat_id': self.seat_id,
            'attendance_date': self.attendance_date.isoformat() if self.attendance_date else None,
            'attendance_time': self.attendance_time,
            'status': self.status
        }
        if self.student:
            data['student_name'] = self.student.name
            data['student_code'] = self.student.student_id
            data['student_email'] = self.student.email
        if self.seat:
            data['seat_number'] = self.seat.seat_number
            data['seat_block'] = self.seat.block
            data['seat_row'] = self.seat.row_number
            data['seat_column'] = self.seat.column_number
        if self.session:
            data['session_date'] = self.session.session_date.isoformat() if self.session.session_date else None
            data['session_code'] = self.session.attendance_code
            if self.session.class_ref:
                data['class_name'] = self.session.class_ref.class_name
                if self.session.class_ref.subject:
                    data['subject_name'] = self.session.class_ref.subject.subject_name
                    data['subject_code'] = self.session.class_ref.subject.subject_code
                if self.session.class_ref.lecturer:
                    data['lecturer_name'] = self.session.class_ref.lecturer.name
            if self.session.classroom:
                data['classroom_name'] = self.session.classroom.room_name
                data['classroom_code'] = self.session.classroom.room_code
        return data
