from flask import Blueprint, request, jsonify
from extensions import db
from models.class_model import Class
from models.subject import Subject
from models.lecturer import Lecturer
from models.student import Student
from models.enrollment import Enrollment
from middleware.auth_middleware import role_required, get_authenticated_user

bp = Blueprint('classes', __name__, url_prefix='/api/classes')

@bp.route('', methods=['GET'])
@role_required()
def get_classes():
    lecturer_id = request.args.get('lecturer_id', type=int)
    subject_id = request.args.get('subject_id', type=int)
    
    query = Class.query
    if lecturer_id:
        query = query.filter_by(lecturer_id=lecturer_id)
    if subject_id:
        query = query.filter_by(subject_id=subject_id)

    classes = query.order_by(Class.id.desc()).all()
    return jsonify([c.to_dict() for c in classes]), 200

@bp.route('/<int:class_id>', methods=['GET'])
@role_required()
def get_class(class_id):
    cls = Class.query.get_or_404(class_id)
    return jsonify(cls.to_dict()), 200

@bp.route('', methods=['POST'])
@role_required('ADMINISTRATOR')
def create_class():
    data = request.get_json() or {}
    subject_id = data.get('subject_id')
    lecturer_id = data.get('lecturer_id')
    class_name = data.get('class_name', '').strip()
    semester = data.get('semester', 'Semester 1').strip()
    academic_year = data.get('academic_year', '2026').strip()

    if not subject_id or not class_name:
        return jsonify({'error': 'Bad Request', 'message': 'subject_id and class_name are required'}), 400

    cls = Class(
        subject_id=subject_id,
        lecturer_id=lecturer_id,
        class_name=class_name,
        semester=semester,
        academic_year=academic_year
    )
    db.session.add(cls)
    db.session.commit()
    return jsonify({'message': 'Class created successfully', 'class': cls.to_dict()}), 201

@bp.route('/<int:class_id>', methods=['PUT'])
@role_required('ADMINISTRATOR', 'LECTURER')
def update_class(class_id):
    current_user = get_authenticated_user()
    cls = Class.query.get_or_404(class_id)
    data = request.get_json() or {}

    if current_user.role == 'LECTURER':
        if not current_user.lecturer_profile or cls.lecturer_id != current_user.lecturer_profile.id:
            return jsonify({'error': 'Forbidden', 'message': 'You can only edit your own assigned classes'}), 403

    if current_user.role == 'ADMINISTRATOR':
        if 'subject_id' in data:
            cls.subject_id = data['subject_id']
        if 'lecturer_id' in data:
            cls.lecturer_id = data['lecturer_id']

    if 'class_name' in data:
        cls.class_name = data['class_name'].strip()
    if 'semester' in data:
        cls.semester = data['semester'].strip()
    if 'academic_year' in data:
        cls.academic_year = data['academic_year'].strip()

    db.session.commit()
    return jsonify({'message': 'Class updated successfully', 'class': cls.to_dict()}), 200

@bp.route('/<int:class_id>', methods=['DELETE'])
@role_required('ADMINISTRATOR')
def delete_class(class_id):
    cls = Class.query.get_or_404(class_id)
    db.session.delete(cls)
    db.session.commit()
    return jsonify({'message': 'Class deleted successfully'}), 200

@bp.route('/<int:class_id>/students', methods=['GET'])
@role_required('ADMINISTRATOR', 'LECTURER')
def get_class_students(class_id):
    cls = Class.query.get_or_404(class_id)
    enrollments = Enrollment.query.filter_by(class_id=cls.id).all()
    students_data = []
    for e in enrollments:
        if e.student:
            s_dict = e.student.to_dict()
            s_dict['enrollment_id'] = e.id
            s_dict['enrolled_at'] = e.enrolled_at.isoformat() if e.enrolled_at else None
            students_data.append(s_dict)
    return jsonify(students_data), 200

@bp.route('/<int:class_id>/enroll', methods=['POST'])
@role_required('ADMINISTRATOR')
def enroll_student_to_class(class_id):
    cls = Class.query.get_or_404(class_id)
    data = request.get_json() or {}
    student_id = data.get('student_id')

    if not student_id:
        return jsonify({'error': 'Bad Request', 'message': 'student_id is required'}), 400

    existing = Enrollment.query.filter_by(student_id=student_id, class_id=cls.id).first()
    if existing:
        return jsonify({'error': 'Conflict', 'message': 'Student is already enrolled in this class'}), 409

    enrollment = Enrollment(student_id=student_id, class_id=cls.id)
    db.session.add(enrollment)
    db.session.commit()
    return jsonify({'message': 'Student enrolled successfully', 'enrollment': enrollment.to_dict()}), 201

@bp.route('/<int:class_id>/enroll/<int:student_id>', methods=['DELETE'])
@role_required('ADMINISTRATOR')
def unenroll_student_from_class(class_id, student_id):
    enrollment = Enrollment.query.filter_by(student_id=student_id, class_id=class_id).first_or_404()
    db.session.delete(enrollment)
    db.session.commit()
    return jsonify({'message': 'Student unenrolled successfully'}), 200
