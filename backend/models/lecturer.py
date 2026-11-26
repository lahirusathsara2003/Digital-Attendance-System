from extensions import db

class Lecturer(db.Model):
    __tablename__ = 'lecturers'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True)
    lecturer_id = db.Column(db.String(50), unique=True, nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    status = db.Column(db.String(20), default='ACTIVE')

    # Relationships
    user = db.relationship('User', back_populates='lecturer_profile')
    classes = db.relationship('Class', back_populates='lecturer')

    def to_dict(self, include_user=True):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'lecturer_id': self.lecturer_id,
            'name': self.name,
            'email': self.email,
            'status': self.status,
            'assigned_classes_count': len(self.classes) if self.classes else 0
        }
        if include_user and self.user:
            data['username'] = self.user.username
            data['user_status'] = self.user.status
        return data
