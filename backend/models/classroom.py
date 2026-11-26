from extensions import db

class Classroom(db.Model):
    __tablename__ = 'classrooms'

    id = db.Column(db.Integer, primary_key=True)
    room_code = db.Column(db.String(30), unique=True, nullable=False, index=True)
    room_name = db.Column(db.String(100), nullable=False)
    rows = db.Column('row_count', db.Integer, nullable=False, default=5)
    left_block_columns = db.Column(db.Integer, nullable=False, default=6)
    right_block_columns = db.Column(db.Integer, nullable=False, default=7)

    # Relationships
    seats = db.relationship('Seat', back_populates='classroom', cascade="all, delete-orphan", order_by="Seat.id")
    sessions = db.relationship('AttendanceSession', back_populates='classroom')

    def to_dict(self, include_seats=False):
        data = {
            'id': self.id,
            'room_code': self.room_code,
            'room_name': self.room_name,
            'rows': self.rows,
            'left_block_columns': self.left_block_columns,
            'right_block_columns': self.right_block_columns,
            'total_seats_count': len(self.seats) if self.seats else (self.rows * (self.left_block_columns + self.right_block_columns)),
            'active_seats_count': len([s for s in self.seats if s.status != 'UNAVAILABLE']) if self.seats else 0
        }
        if include_seats:
            data['seats'] = [s.to_dict() for s in self.seats]
        return data
