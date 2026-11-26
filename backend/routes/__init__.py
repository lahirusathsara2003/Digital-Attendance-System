from .auth import bp as auth_bp
from .students import bp as students_bp
from .lecturers import bp as lecturers_bp
from .administrators import bp as administrators_bp
from .subjects import bp as subjects_bp
from .classes import bp as classes_bp
from .enrollments import bp as enrollments_bp
from .classrooms import bp as classrooms_bp
from .seats import bp as seats_bp
from .attendance_sessions import bp as attendance_sessions_bp
from .seat_reservations import bp as seat_reservations_bp
from .attendance import bp as attendance_bp
from .reports import bp as reports_bp

__all__ = [
    'auth_bp',
    'students_bp',
    'lecturers_bp',
    'administrators_bp',
    'subjects_bp',
    'classes_bp',
    'enrollments_bp',
    'classrooms_bp',
    'seats_bp',
    'attendance_sessions_bp',
    'seat_reservations_bp',
    'attendance_bp',
    'reports_bp'
]
