from flask import Blueprint, request, jsonify
from extensions import db
from models.classroom import Classroom
from models.seat import Seat
from middleware.auth_middleware import role_required
from utils.code_generator import generate_classroom_seats
from services.admin_service import configure_classroom_layout

bp = Blueprint('classrooms', __name__, url_prefix='/api/classrooms')

@bp.route('', methods=['GET'])
@role_required()
def get_classrooms():
    include_seats = request.args.get('include_seats', 'false').lower() == 'true'
    classrooms = Classroom.query.order_by(Classroom.room_code).all()
    return jsonify([c.to_dict(include_seats=include_seats) for c in classrooms]), 200

@bp.route('/<int:classroom_id>', methods=['GET'])
@role_required()
def get_classroom(classroom_id):
    include_seats = request.args.get('include_seats', 'true').lower() == 'true'
    classroom = Classroom.query.get_or_404(classroom_id)
    return jsonify(classroom.to_dict(include_seats=include_seats)), 200

@bp.route('', methods=['POST'])
@role_required('ADMINISTRATOR')
def create_classroom():
    data = request.get_json() or {}
    room_code = data.get('room_code', '').strip().upper()
    room_name = data.get('room_name', '').strip()
    rows = int(data.get('rows', 5))
    left_block_columns = int(data.get('left_block_columns', 6))
    right_block_columns = int(data.get('right_block_columns', 7))

    if not room_code or not room_name:
        return jsonify({'error': 'Bad Request', 'message': 'room_code and room_name are required'}), 400

    if Classroom.query.filter_by(room_code=room_code).first():
        return jsonify({'error': 'Conflict', 'message': f"Classroom code '{room_code}' already exists"}), 409

    classroom = Classroom(
        room_code=room_code,
        room_name=room_name,
        rows=rows,
        left_block_columns=left_block_columns,
        right_block_columns=right_block_columns
    )
    db.session.add(classroom)
    db.session.commit()

    # Automatically generate seats for left and right blocks
    generate_classroom_seats(classroom)

    return jsonify({'message': 'Classroom created and seats generated successfully', 'classroom': classroom.to_dict(include_seats=True)}), 201

@bp.route('/<int:classroom_id>', methods=['PUT'])
@role_required('ADMINISTRATOR')
def update_classroom(classroom_id):
    data = request.get_json() or {}
    rows = data.get('rows')
    left_cols = data.get('left_block_columns')
    right_cols = data.get('right_block_columns')
    room_name = data.get('room_name')

    classroom = Classroom.query.get_or_404(classroom_id)

    if rows is not None and left_cols is not None and right_cols is not None:
        updated, error = configure_classroom_layout(classroom_id, int(rows), int(left_cols), int(right_cols), room_name)
        if error:
            return jsonify({'error': 'Bad Request', 'message': error}), 400
        return jsonify({'message': 'Classroom layout updated successfully', 'classroom': updated}), 200
    else:
        if room_name:
            classroom.room_name = room_name.strip()
        db.session.commit()
        return jsonify({'message': 'Classroom updated successfully', 'classroom': classroom.to_dict(include_seats=True)}), 200

@bp.route('/<int:classroom_id>', methods=['DELETE'])
@role_required('ADMINISTRATOR')
def delete_classroom(classroom_id):
    classroom = Classroom.query.get_or_404(classroom_id)
    db.session.delete(classroom)
    db.session.commit()
    return jsonify({'message': 'Classroom deleted successfully'}), 200

@bp.route('/<int:classroom_id>/seats', methods=['GET'])
@role_required()
def get_classroom_seats(classroom_id):
    classroom = Classroom.query.get_or_404(classroom_id)
    seats = Seat.query.filter_by(classroom_id=classroom.id).order_by(Seat.row_number, Seat.column_number).all()
    return jsonify([s.to_dict() for s in seats]), 200
