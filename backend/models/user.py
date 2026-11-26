from datetime import datetime
from extensions import db
import bcrypt

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'STUDENT', 'LECTURER', 'ADMINISTRATOR'
    status = db.Column(db.String(20), default='ACTIVE')  # 'ACTIVE', 'INACTIVE'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    student_profile = db.relationship('Student', back_populates='user', uselist=False, cascade="all, delete-orphan")
    lecturer_profile = db.relationship('Lecturer', back_populates='user', uselist=False, cascade="all, delete-orphan")
    admin_profile = db.relationship('Administrator', back_populates='user', uselist=False, cascade="all, delete-orphan")

    def set_password(self, password):
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    def check_password(self, password):
        if not self.password_hash:
            return False
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'profile': self.get_profile_dict()
        }

    def get_profile_dict(self):
        if self.role == 'STUDENT' and self.student_profile:
            return self.student_profile.to_dict(include_user=False)
        elif self.role == 'LECTURER' and self.lecturer_profile:
            return self.lecturer_profile.to_dict(include_user=False)
        elif self.role == 'ADMINISTRATOR' and self.admin_profile:
            return self.admin_profile.to_dict(include_user=False)
        return None
