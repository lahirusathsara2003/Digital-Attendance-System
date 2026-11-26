from extensions import db

class Seat(db.Model):
    __tablename__ = 'seats'

    id = db.Column(db.Integer, primary_key=True)
    classroom_id = db.Column(db.Integer, db.ForeignKey('classrooms.id', ondelete='CASCADE'), nullable=False)
    seat_number = db.Column(db.String(20), nullable=False)
    row_number = db.Column(db.Integer, nullable=False)
    column_number = db.Column(db.Integer, nullable=False)
    block = db.Column(db.String(10), nullable=False, default='LEFT')  # 'LEFT' or 'RIGHT'
    status = db.Column(db.String(20), default='AVAILABLE')  # 'AVAILABLE' or 'UNAVAILABLE' (admin disabled)

    __table_args__ = (
        db.UniqueConstraint('classroom_id', 'seat_number', name='uq_classroom_seat_number'),
    )

    # Relationships
    classroom = db.relationship('Classroom', back_populates='seats')
    reservations = db.relationship('SeatReservation', back_populates='seat', cascade="all, delete-orphan")
    attendance_records = db.relationship('Attendance', back_populates='seat')

    def to_dict(self):
        return {
            'id': self.id,
            'classroom_id': self.classroom_id,
            'seat_number': self.seat_number,
            'row_number': self.row_number,
            'column_number': self.column_number,
            'block': self.block,
            'status': self.status
        }
