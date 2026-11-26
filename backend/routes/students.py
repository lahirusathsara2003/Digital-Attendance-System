from flask import Blueprint, request, jsonify
from extensions import db
from models.student import Student
from models.user import User
from middleware.auth_middleware import role_required, get_authenticated_user
from services.student_service import get_student_dashboard, get_student_attendance_history
from services.auth_service import register_user

bp = Blueprint('students', __name__, url_prefix='/api/students')

@bp.route('/dashboard', methods=['GET'])
@role_required('STUDENT')
def student_dashboard():
    user = get_authenticated_user()
    if not user or not user.student_profile:
        return jsonify({'error': 'Not Found', 'message': 'Student profile not linked'}), 404

    data, error = get_student_dashboard(user.student_profile.id)
    if error:
        return jsonify({'error': 'Bad Request', 'message': error}), 400

    return jsonify(data), 200

@bp.route('/history', methods=['GET'])
@role_required('STUDENT')
def student_history():
    user = get_authenticated_user()
    if not user or not user.student_profile:
        return jsonify({'error': 'Not Found', 'message': 'Student profile not linked'}), 404

    subject_id = request.args.get('subject_id', type=int)
    class_id = request.args.get('class_id', type=int)

    records, error = get_student_attendance_history(user.student_profile.id, subject_id, class_id)
    if error:
        return jsonify({'error': 'Bad Request', 'message': error}), 400

    return jsonify(records), 200

@bp.route('', methods=['GET'])
@role_required('ADMINISTRATOR', 'LECTURER')
def get_all_students():
    search = request.args.get('search', '').strip()
    query = Student.query
    if search:
        s_term = f"%{search}%"
        query = query.filter(db.or_(Student.name.ilike(s_term), Student.student_id.ilike(s_term), Student.email.ilike(s_term)))
    
    students = query.order_by(Student.student_id).all()
    return jsonify([s.to_dict() for s in students]), 200

@bp.route('/<int:student_id>', methods=['GET'])
@role_required('ADMINISTRATOR', 'LECTURER', 'STUDENT')
def get_student(student_id):
    student = Student.query.get_or_404(student_id)
    return jsonify(student.to_dict()), 200

@bp.route('', methods=['POST'])
@role_required('ADMINISTRATOR')
def create_student():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip() or 'password123'
    student_id = data.get('student_id', '').strip()
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    phone = data.get('phone', '').strip()

    if not student_id or not name or not email:
        return jsonify({'error': 'Bad Request', 'message': 'student_id, name, and email are required'}), 400

    if not username:
        username = student_id.lower()

    if Student.query.filter_by(student_id=student_id).first():
        return jsonify({'error': 'Conflict', 'message': f"Student ID '{student_id}' already exists."}), 409

    user_dict, error = register_user(
        username=username,
        password=password,
        role='STUDENT',
        profile_data={'student_id': student_id, 'name': name, 'email': email, 'phone': phone}
    )
    if error:
        return jsonify({'error': 'Conflict', 'message': error}), 409

    return jsonify({'message': 'Student created successfully', 'user': user_dict}), 201

@bp.route('/<int:student_id>', methods=['PUT'])
@role_required('ADMINISTRATOR')
def update_student(student_id):
    student = Student.query.get_or_404(student_id)
    data = request.get_json() or {}

    if 'name' in data:
        student.name = data['name'].strip()
    if 'email' in data:
        student.email = data['email'].strip()
    if 'phone' in data:
        student.phone = data['phone'].strip()
    if 'status' in data and data['status'] in ('ACTIVE', 'INACTIVE'):
        student.status = data['status']
        if student.user:
            student.user.status = data['status']

    db.session.commit()
    return jsonify({'message': 'Student updated successfully', 'student': student.to_dict()}), 200

@bp.route('/<int:student_id>', methods=['DELETE'])
@role_required('ADMINISTRATOR')
def delete_student(student_id):
    student = Student.query.get_or_404(student_id)
    user = student.user
    if user:
        db.session.delete(user)
    else:
        db.session.delete(student)
    db.session.commit()
    return jsonify({'message': 'Student deleted successfully'}), 200
