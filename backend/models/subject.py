from extensions import db

class Subject(db.Model):
    __tablename__ = 'subjects'

    id = db.Column(db.Integer, primary_key=True)
    subject_code = db.Column(db.String(30), unique=True, nullable=False, index=True)
    subject_name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)

    # Relationships
    classes = db.relationship('Class', back_populates='subject', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'subject_code': self.subject_code,
            'subject_name': self.subject_name,
            'description': self.description,
            'classes_count': len(self.classes) if self.classes else 0
        }
