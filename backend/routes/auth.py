from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from services.auth_service import login_user, register_user
from middleware.auth_middleware import get_authenticated_user, role_required

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    if not username or not password:
        return jsonify({'error': 'Bad Request', 'message': 'Username and password are required'}), 400

    result, error = login_user(username, password)
    if error:
        return jsonify({'error': 'Unauthorized', 'message': error}), 401

    return jsonify(result), 200

@bp.route('/me', methods=['GET'])
@role_required()
def me():
    user = get_authenticated_user()
    if not user:
        return jsonify({'error': 'Unauthorized', 'message': 'User not found'}), 401
    return jsonify(user.to_dict()), 200

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    role = data.get('role', 'STUDENT').strip().upper()
    profile_data = data.get('profile', {})

    if not username or not password or not role:
        return jsonify({'error': 'Bad Request', 'message': 'Username, password, and role are required'}), 400

    if role not in ('STUDENT', 'LECTURER', 'ADMINISTRATOR'):
        return jsonify({'error': 'Bad Request', 'message': 'Invalid role specified'}), 400

    if role == 'ADMINISTRATOR':
        current_user = get_authenticated_user()
        if not current_user or current_user.role != 'ADMINISTRATOR':
            return jsonify({'error': 'Forbidden', 'message': 'Administrator privileges required to register administrator accounts'}), 403

    user_dict, error = register_user(username, password, role, profile_data)
    if error:
        return jsonify({'error': 'Conflict', 'message': error}), 409

    # Generate access token for the registered user so frontend can log in directly
    access_token = create_access_token(
        identity=str(user_dict['id']),
        additional_claims={
            'role': user_dict['role'],
            'username': user_dict['username']
        }
    )

    return jsonify({
        'message': 'User registered successfully',
        'user': user_dict,
        'access_token': access_token
    }), 201

