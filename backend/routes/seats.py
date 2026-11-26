from flask import Blueprint, request, jsonify
from extensions import db
from models.seat import Seat
from middleware.auth_middleware import role_required
from services.admin_service import update_seat_status

bp = Blueprint('seats', __name__, url_prefix='/api/seats')

@bp.route('/<int:seat_id>', methods=['PUT'])
@role_required('ADMINISTRATOR')
def update_seat(seat_id):
    data = request.get_json() or {}
    status = data.get('status')
    seat_number = data.get('seat_number')

    updated_seat, error = update_seat_status(seat_id, status, seat_number)
    if error:
        return jsonify({'error': 'Bad Request', 'message': error}), 400

    return jsonify({'message': 'Seat updated successfully', 'seat': updated_seat}), 200

@bp.route('/batch-status', methods=['POST'])
@role_required('ADMINISTRATOR')
def batch_update_seats():
    data = request.get_json() or {}
    seat_ids = data.get('seat_ids', [])
    status = data.get('status', 'AVAILABLE')  # 'AVAILABLE' or 'UNAVAILABLE'

    if not seat_ids or status not in ('AVAILABLE', 'UNAVAILABLE'):
        return jsonify({'error': 'Bad Request', 'message': 'Invalid seat_ids or status'}), 400

    Seat.query.filter(Seat.id.in_(seat_ids)).update({'status': status}, synchronize_session=False)
    db.session.commit()

    return jsonify({'message': f"Updated {len(seat_ids)} seats to status '{status}'"}), 200
