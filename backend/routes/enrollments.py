from flask import Blueprint, request, jsonify
from extensions import db
from models.enrollment import Enrollment
from middleware.auth_middleware import role_required

bp = Blueprint('enrollments', __name__, url_prefix='/api/enrollments')

@bp.route('', methods=['GET'])
@role_required('ADMINISTRATOR')
def get_enrollments():
    class_id = request.args.get('class_id', type=int)
    student_id = request.args.get('student_id', type=int)

    query = Enrollment.query
    if class_id:
        query = query.filter_by(class_id=class_id)
    if student_id:
        query = query.filter_by(student_id=student_id)

    enrollments = query.all()
    return jsonify([e.to_dict() for e in enrollments]), 200

@bp.route('', methods=['POST'])
@role_required('ADMINISTRATOR')
def create_enrollment():
    data = request.get_json() or {}
    student_id = data.get('student_id')
    class_id = data.get('class_id')

    if not student_id or not class_id:
        return jsonify({'error': 'Bad Request', 'message': 'student_id and class_id are required'}), 400

    existing = Enrollment.query.filter_by(student_id=student_id, class_id=class_id).first()
    if existing:
        return jsonify({'error': 'Conflict', 'message': 'Student already enrolled in this class'}), 409

    enrollment = Enrollment(student_id=student_id, class_id=class_id)
    db.session.add(enrollment)
    db.session.commit()
    return jsonify({'message': 'Enrolled successfully', 'enrollment': enrollment.to_dict()}), 201

@bp.route('/<int:enrollment_id>', methods=['DELETE'])
@role_required('ADMINISTRATOR')
def delete_enrollment(enrollment_id):
    enrollment = Enrollment.query.get_or_404(enrollment_id)
    db.session.delete(enrollment)
    db.session.commit()
    return jsonify({'message': 'Enrollment deleted successfully'}), 200
