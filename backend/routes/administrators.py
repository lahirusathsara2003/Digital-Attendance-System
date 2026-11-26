from flask import Blueprint, request, jsonify
from extensions import db
from models.user import User
from models.administrator import Administrator
from middleware.auth_middleware import role_required
from services.admin_service import get_admin_dashboard

bp = Blueprint('administrators', __name__, url_prefix='/api/administrators')

@bp.route('/dashboard', methods=['GET'])
@role_required('ADMINISTRATOR')
def admin_dashboard():
    data = get_admin_dashboard()
    return jsonify(data), 200

@bp.route('/users', methods=['GET'])
@role_required('ADMINISTRATOR')
def get_all_users():
    role = request.args.get('role')
    query = User.query
    if role:
        query = query.filter_by(role=role.upper())
    users = query.order_by(User.id.desc()).all()
    return jsonify([u.to_dict() for u in users]), 200

@bp.route('/users/<int:user_id>/status', methods=['PUT'])
@role_required('ADMINISTRATOR')
def toggle_user_status(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}
    new_status = data.get('status')
    if new_status not in ('ACTIVE', 'INACTIVE'):
        return jsonify({'error': 'Bad Request', 'message': 'Invalid status'}), 400

    user.status = new_status
    if user.student_profile:
        user.student_profile.status = new_status
    if user.lecturer_profile:
        user.lecturer_profile.status = new_status

    db.session.commit()
    return jsonify({'message': f"User status changed to {new_status}", 'user': user.to_dict()}), 200

@bp.route('/users/<int:user_id>/reset-password', methods=['POST'])
@role_required('ADMINISTRATOR')
def reset_password(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}
    new_password = data.get('new_password', 'password123')
    
    user.set_password(new_password)
    db.session.commit()
    return jsonify({'message': 'Password has been reset successfully'}), 200
