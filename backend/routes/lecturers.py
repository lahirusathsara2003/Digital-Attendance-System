from flask import Blueprint, request, jsonify
from extensions import db
from models.lecturer import Lecturer
from models.class_model import Class
from middleware.auth_middleware import role_required, get_authenticated_user
from services.lecturer_service import get_lecturer_dashboard
from services.auth_service import register_user

bp = Blueprint('lecturers', __name__, url_prefix='/api/lecturers')

@bp.route('/dashboard', methods=['GET'])
@role_required('LECTURER')
def lecturer_dashboard():
    user = get_authenticated_user()
    if not user or not user.lecturer_profile:
        return jsonify({'error': 'Not Found', 'message': 'Lecturer profile not linked'}), 404

    data, error = get_lecturer_dashboard(user.lecturer_profile.id)
    if error:
        return jsonify({'error': 'Bad Request', 'message': error}), 400

    return jsonify(data), 200

@bp.route('/my-classes', methods=['GET'])
@role_required('LECTURER')
def lecturer_classes():
    user = get_authenticated_user()
    if not user or not user.lecturer_profile:
        return jsonify({'error': 'Not Found', 'message': 'Lecturer profile not linked'}), 404

    classes = Class.query.filter_by(lecturer_id=user.lecturer_profile.id).all()
    return jsonify([c.to_dict() for c in classes]), 200

@bp.route('', methods=['GET'])
@role_required('ADMINISTRATOR')
def get_all_lecturers():
    search = request.args.get('search', '').strip()
    query = Lecturer.query
    if search:
        s_term = f"%{search}%"
        query = query.filter(db.or_(Lecturer.name.ilike(s_term), Lecturer.lecturer_id.ilike(s_term), Lecturer.email.ilike(s_term)))
    
    lecturers = query.order_by(Lecturer.lecturer_id).all()
    return jsonify([l.to_dict() for l in lecturers]), 200

@bp.route('/<int:lecturer_id>', methods=['GET'])
@role_required('ADMINISTRATOR', 'LECTURER')
def get_lecturer(lecturer_id):
    lecturer = Lecturer.query.get_or_404(lecturer_id)
    return jsonify(lecturer.to_dict()), 200

@bp.route('', methods=['POST'])
@role_required('ADMINISTRATOR')
def create_lecturer():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip() or 'password123'
    lecturer_id = data.get('lecturer_id', '').strip()
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()

    if not lecturer_id or not name or not email:
        return jsonify({'error': 'Bad Request', 'message': 'lecturer_id, name, and email are required'}), 400

    if not username:
        username = lecturer_id.lower()

    if Lecturer.query.filter_by(lecturer_id=lecturer_id).first():
        return jsonify({'error': 'Conflict', 'message': f"Lecturer ID '{lecturer_id}' already exists."}), 409

    user_dict, error = register_user(
        username=username,
        password=password,
        role='LECTURER',
        profile_data={'lecturer_id': lecturer_id, 'name': name, 'email': email}
    )
    if error:
        return jsonify({'error': 'Conflict', 'message': error}), 409

    return jsonify({'message': 'Lecturer created successfully', 'user': user_dict}), 201

@bp.route('/<int:lecturer_id>', methods=['PUT'])
@role_required('ADMINISTRATOR')
def update_lecturer(lecturer_id):
    lecturer = Lecturer.query.get_or_404(lecturer_id)
    data = request.get_json() or {}

    if 'name' in data:
        lecturer.name = data['name'].strip()
    if 'email' in data:
        lecturer.email = data['email'].strip()
    if 'status' in data and data['status'] in ('ACTIVE', 'INACTIVE'):
        lecturer.status = data['status']
        if lecturer.user:
            lecturer.user.status = data['status']

    db.session.commit()
    return jsonify({'message': 'Lecturer updated successfully', 'lecturer': lecturer.to_dict()}), 200

@bp.route('/<int:lecturer_id>', methods=['DELETE'])
@role_required('ADMINISTRATOR')
def delete_lecturer(lecturer_id):
    lecturer = Lecturer.query.get_or_404(lecturer_id)
    user = lecturer.user
    if user:
        db.session.delete(user)
    else:
        db.session.delete(lecturer)
    db.session.commit()
    return jsonify({'message': 'Lecturer deleted successfully'}), 200
