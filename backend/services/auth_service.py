from extensions import db
from models.user import User
from models.student import Student
from models.lecturer import Lecturer
from models.administrator import Administrator
from flask_jwt_extended import create_access_token

def login_user(username, password):
    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return None, "Invalid username or password"
    
    if user.status != 'ACTIVE':
        return None, "Your account has been deactivated. Please contact an administrator."

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={
            'role': user.role,
            'username': user.username
        }
    )

    return {
        'access_token': access_token,
        'user': user.to_dict()
    }, None

def register_user(username, password, role, profile_data):
    if User.query.filter_by(username=username).first():
        return None, "Username already exists"

    if role == 'STUDENT':
        student_id = profile_data.get('student_id')
        if not student_id:
            return None, "Student ID is required"
        if Student.query.filter_by(student_id=student_id).first():
            return None, f"Student ID '{student_id}' already exists"
        if not profile_data.get('name'):
            return None, "Full name is required"
        if not profile_data.get('email'):
            return None, "Email is required"

    elif role == 'LECTURER':
        lecturer_id = profile_data.get('lecturer_id')
        if not lecturer_id:
            return None, "Lecturer ID is required"
        if Lecturer.query.filter_by(lecturer_id=lecturer_id).first():
            return None, f"Lecturer ID '{lecturer_id}' already exists"
        if not profile_data.get('name'):
            return None, "Full name is required"
        if not profile_data.get('email'):
            return None, "Email is required"

    elif role == 'ADMINISTRATOR':
        if not profile_data.get('name'):
            return None, "Full name is required"
        if not profile_data.get('email'):
            return None, "Email is required"

    try:
        user = User(username=username, role=role, status='ACTIVE')
        user.set_password(password)
        db.session.add(user)
        db.session.flush()

        if role == 'STUDENT':
            student = Student(
                user_id=user.id,
                student_id=profile_data.get('student_id'),
                name=profile_data.get('name'),
                email=profile_data.get('email'),
                phone=profile_data.get('phone', '')
            )
            db.session.add(student)
        elif role == 'LECTURER':
            lecturer = Lecturer(
                user_id=user.id,
                lecturer_id=profile_data.get('lecturer_id'),
                name=profile_data.get('name'),
                email=profile_data.get('email')
            )
            db.session.add(lecturer)
        elif role == 'ADMINISTRATOR':
            admin = Administrator(
                user_id=user.id,
                name=profile_data.get('name'),
                email=profile_data.get('email')
            )
            db.session.add(admin)

        db.session.commit()
        return user.to_dict(), None
    except Exception as e:
        db.session.rollback()
        return None, f"Registration failed: {str(e)}"
