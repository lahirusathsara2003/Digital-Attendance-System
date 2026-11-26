from datetime import datetime
from extensions import db

class Enrollment(db.Model):
    __tablename__ = 'enrollments'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    class_id = db.Column(db.Integer, db.ForeignKey('classes.id', ondelete='CASCADE'), nullable=False)
    enrolled_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('student_id', 'class_id', name='uq_student_class_enrollment'),
    )

    # Relationships
    student = db.relationship('Student', back_populates='enrollments')
    class_ref = db.relationship('Class', back_populates='enrollments')

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'class_id': self.class_id,
            'enrolled_at': self.enrolled_at.isoformat() if self.enrolled_at else None,
            'student_name': self.student.name if self.student else None,
            'student_code': self.student.student_id if self.student else None,
            'student_email': self.student.email if self.student else None,
            'class_name': self.class_ref.class_name if self.class_ref else None,
            'subject_name': self.class_ref.subject.subject_name if (self.class_ref and self.class_ref.subject) else None,
            'subject_code': self.class_ref.subject.subject_code if (self.class_ref and self.class_ref.subject) else None
        }
