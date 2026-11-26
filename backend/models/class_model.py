from extensions import db

class Class(db.Model):
    __tablename__ = 'classes'

    id = db.Column(db.Integer, primary_key=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id', ondelete='CASCADE'), nullable=False)
    lecturer_id = db.Column(db.Integer, db.ForeignKey('lecturers.id', ondelete='SET NULL'), nullable=True)
    class_name = db.Column(db.String(100), nullable=False)
    semester = db.Column(db.String(30), nullable=False)
    academic_year = db.Column(db.String(30), nullable=False)

    # Relationships
    subject = db.relationship('Subject', back_populates='classes')
    lecturer = db.relationship('Lecturer', back_populates='classes')
    enrollments = db.relationship('Enrollment', back_populates='class_ref', cascade="all, delete-orphan")
    sessions = db.relationship('AttendanceSession', back_populates='class_ref', cascade="all, delete-orphan")

    def to_dict(self, include_relations=True):
        data = {
            'id': self.id,
            'subject_id': self.subject_id,
            'lecturer_id': self.lecturer_id,
            'class_name': self.class_name,
            'semester': self.semester,
            'academic_year': self.academic_year,
            'enrolled_students_count': len(self.enrollments) if self.enrollments else 0,
            'sessions_count': len(self.sessions) if self.sessions else 0
        }
        if include_relations:
            if self.subject:
                data['subject_name'] = self.subject.subject_name
                data['subject_code'] = self.subject.subject_code
            if self.lecturer:
                data['lecturer_name'] = self.lecturer.name
                data['lecturer_code'] = self.lecturer.lecturer_id
        return data
