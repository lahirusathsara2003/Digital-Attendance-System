import random
import string
from models.seat import Seat
from extensions import db

def generate_attendance_code(class_code_prefix="ATT"):
    """Generate attendance session code like DS201-8392."""
    clean_prefix = ''.join(c for c in class_code_prefix if c.isalnum()).upper()[:6] or "ATT"
    random_digits = ''.join(random.choices(string.digits, k=4))
    return f"{clean_prefix}-{random_digits}"

def generate_classroom_seats(classroom):
    """
    Generate seats for a classroom based on rows, left_block_columns, right_block_columns.
    Creates seats with row_number, column_number, block, and seat_number.
    """
    # Delete existing seats first if re-generating
    Seat.query.filter_by(classroom_id=classroom.id).delete()
    
    seat_counter = 1
    new_seats = []
    
    for r in range(1, classroom.rows + 1):
        # Left block columns
        for c in range(1, classroom.left_block_columns + 1):
            seat = Seat(
                classroom_id=classroom.id,
                seat_number=str(seat_counter),
                row_number=r,
                column_number=c,
                block='LEFT',
                status='AVAILABLE'
            )
            new_seats.append(seat)
            seat_counter += 1
            
        # Right block columns
        for c in range(1, classroom.right_block_columns + 1):
            seat = Seat(
                classroom_id=classroom.id,
                seat_number=str(seat_counter),
                row_number=r,
                column_number=c,
                block='RIGHT',
                status='AVAILABLE'
            )
            new_seats.append(seat)
            seat_counter += 1
            
    db.session.bulk_save_objects(new_seats)
    db.session.commit()
    return new_seats
