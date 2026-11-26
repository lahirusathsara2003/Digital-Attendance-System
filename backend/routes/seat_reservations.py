from flask import Blueprint, request, jsonify
from extensions import db
from models.seat_reservation import SeatReservation
from middleware.auth_middleware import role_required, get_authenticated_user
from services.reservation_service import reserve_seat_and_mark_attendance

bp = Blueprint('seat_reservations', __name__, url_prefix='/api/seat-reservations')

@bp.route('', methods=['POST'])
@role_required('STUDENT')
def create_reservation():
    user = get_authenticated_user()
    if not user or not user.student_profile:
        return jsonify({'error': 'Unauthorized', 'message': 'Student profile required'}), 403

    data = request.get_json() or {}
    session_id = data.get('session_id')
    seat_id = data.get('seat_id')
    confirmed_student_id = data.get('confirmed_student_id')
    confirmed_name = data.get('confirmed_name')

    if not session_id or not seat_id:
        return jsonify({'error': 'Bad Request', 'message': 'session_id and seat_id are required'}), 400

    confirmation, error = reserve_seat_and_mark_attendance(
        session_id=session_id,
        student_id=user.student_profile.id,
        seat_id=seat_id,
        confirmed_student_code=confirmed_student_id,
        confirmed_name=confirmed_name
    )

    if error:
        return jsonify({'error': 'Reservation Failed', 'message': error}), 400

    return jsonify({
        'message': 'Attendance Successfully Marked',
        'attendance': confirmation
    }), 201

@bp.route('', methods=['GET'])
@role_required()
def get_reservations():
    session_id = request.args.get('session_id', type=int)
    student_id = request.args.get('student_id', type=int)

    query = SeatReservation.query
    if session_id:
        query = query.filter_by(session_id=session_id)
    if student_id:
        query = query.filter_by(student_id=student_id)

    reservations = query.all()
    return jsonify([r.to_dict() for r in reservations]), 200

@bp.route('/<int:reservation_id>', methods=['DELETE'])
@role_required('ADMINISTRATOR', 'LECTURER')
def cancel_reservation(reservation_id):
    reservation = SeatReservation.query.get_or_404(reservation_id)
    db.session.delete(reservation)
    db.session.commit()
    return jsonify({'message': 'Seat reservation cancelled successfully'}), 200
