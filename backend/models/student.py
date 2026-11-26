from extensions import db

class Student(db.Model):
    __tablename__ = 'students'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True)
    student_id = db.Column(db.String(50), unique=True, nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    status = db.Column(db.String(20), default='ACTIVE')

    # Relationships
    user = db.relationship('User', back_populates='student_profile')
    enrollments = db.relationship('Enrollment', back_populates='student', cascade="all, delete-orphan")
    reservations = db.relationship('SeatReservation', back_populates='student', cascade="all, delete-orphan")
    attendance_records = db.relationship('Attendance', back_populates='student', cascade="all, delete-orphan")

    def to_dict(self, include_user=True):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'student_id': self.student_id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'status': self.status,
            'enrolled_classes_count': len(self.enrollments) if self.enrollments else 0
        }
        if include_user and self.user:
            data['username'] = self.user.username
            data['user_status'] = self.user.status
        return data
