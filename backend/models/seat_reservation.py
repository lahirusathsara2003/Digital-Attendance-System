from datetime import datetime
from extensions import db

class SeatReservation(db.Model):
    __tablename__ = 'seat_reservations'

    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('attendance_sessions.id', ondelete='CASCADE'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    seat_id = db.Column(db.Integer, db.ForeignKey('seats.id', ondelete='CASCADE'), nullable=False)
    reserved_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('session_id', 'student_id', name='uq_session_student_reservation'),
        db.UniqueConstraint('session_id', 'seat_id', name='uq_session_seat_reservation'),
    )

    # Relationships
    session = db.relationship('AttendanceSession', back_populates='reservations')
    student = db.relationship('Student', back_populates='reservations')
    seat = db.relationship('Seat', back_populates='reservations')

    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'student_id': self.student_id,
            'seat_id': self.seat_id,
            'reserved_at': self.reserved_at.isoformat() if self.reserved_at else None,
            'student_name': self.student.name if self.student else None,
            'student_code': self.student.student_id if self.student else None,
            'seat_number': self.seat.seat_number if self.seat else None,
            'row_number': self.seat.row_number if self.seat else None,
            'column_number': self.seat.column_number if self.seat else None,
            'block': self.seat.block if self.seat else None
        }
