from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from models.user import User

def role_required(*allowed_roles):
    """
    Decorator to protect routes by user roles.
    Allowed roles can be 'STUDENT', 'LECTURER', 'ADMINISTRATOR'.
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                verify_jwt_in_request()
            except Exception as e:
                return jsonify({'error': 'Unauthorized', 'message': str(e)}), 401
            
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            if not user or user.status != 'ACTIVE':
                return jsonify({'error': 'Unauthorized', 'message': 'Account is inactive or not found.'}), 401
            
            # If allowed_roles provided, verify user role matches
            if allowed_roles and user.role not in allowed_roles:
                return jsonify({
                    'error': 'Forbidden',
                    'message': f"Access forbidden for role '{user.role}'. Required: {list(allowed_roles)}"
                }), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator

def get_authenticated_user():
    """Retrieve the current authenticated user object."""
    try:
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        return User.query.get(user_id)
    except Exception:
        return None
