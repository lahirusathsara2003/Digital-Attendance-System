from extensions import db

class Administrator(db.Model):
    __tablename__ = 'administrators'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)

    # Relationships
    user = db.relationship('User', back_populates='admin_profile')

    def to_dict(self, include_user=True):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'email': self.email
        }
        if include_user and self.user:
            data['username'] = self.user.username
            data['user_status'] = self.user.status
        return data
