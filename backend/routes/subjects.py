from flask import Blueprint, request, jsonify
from extensions import db
from models.subject import Subject
from middleware.auth_middleware import role_required

bp = Blueprint('subjects', __name__, url_prefix='/api/subjects')

@bp.route('', methods=['GET'])
@role_required()
def get_subjects():
    subjects = Subject.query.order_by(Subject.subject_code).all()
    return jsonify([s.to_dict() for s in subjects]), 200

@bp.route('/<int:subject_id>', methods=['GET'])
@role_required()
def get_subject(subject_id):
    subject = Subject.query.get_or_404(subject_id)
    return jsonify(subject.to_dict()), 200

@bp.route('', methods=['POST'])
@role_required('ADMINISTRATOR')
def create_subject():
    data = request.get_json() or {}
    code = data.get('subject_code', '').strip().upper()
    name = data.get('subject_name', '').strip()
    desc = data.get('description', '').strip()

    if not code or not name:
        return jsonify({'error': 'Bad Request', 'message': 'Subject code and name are required'}), 400

    if Subject.query.filter_by(subject_code=code).first():
        return jsonify({'error': 'Conflict', 'message': f"Subject code '{code}' already exists"}), 409

    sub = Subject(subject_code=code, subject_name=name, description=desc)
    db.session.add(sub)
    db.session.commit()
    return jsonify({'message': 'Subject created successfully', 'subject': sub.to_dict()}), 201

@bp.route('/<int:subject_id>', methods=['PUT'])
@role_required('ADMINISTRATOR')
def update_subject(subject_id):
    subject = Subject.query.get_or_404(subject_id)
    data = request.get_json() or {}

    if 'subject_name' in data:
        subject.subject_name = data['subject_name'].strip()
    if 'description' in data:
        subject.description = data['description'].strip()
    if 'subject_code' in data:
        new_code = data['subject_code'].strip().upper()
        if new_code != subject.subject_code:
            if Subject.query.filter_by(subject_code=new_code).first():
                return jsonify({'error': 'Conflict', 'message': f"Subject code '{new_code}' already exists"}), 409
            subject.subject_code = new_code

    db.session.commit()
    return jsonify({'message': 'Subject updated successfully', 'subject': subject.to_dict()}), 200

@bp.route('/<int:subject_id>', methods=['DELETE'])
@role_required('ADMINISTRATOR')
def delete_subject(subject_id):
    subject = Subject.query.get_or_404(subject_id)
    db.session.delete(subject)
    db.session.commit()
    return jsonify({'message': 'Subject deleted successfully'}), 200
