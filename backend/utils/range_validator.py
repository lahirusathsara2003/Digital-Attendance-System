import re

def is_student_id_in_range(student_id, start_id, end_id):
    """
    Check if student_id falls within [start_id, end_id] range inclusive.
    Supports alphanumeric student IDs like 'DS001'..'DS050' or 'IT21000001'..'IT21000050'.
    Returns True if:
      - Neither start_id nor end_id is set (unrestricted).
      - student_id is >= start_id (if start_id is set).
      - student_id is <= end_id (if end_id is set).
    """
    if not student_id:
        return False

    student_id = str(student_id).strip().upper()
    start_id = str(start_id).strip().upper() if start_id else None
    end_id = str(end_id).strip().upper() if end_id else None

    # If neither boundary is set, no restriction
    if not start_id and not end_id:
        return True

    def parse_id(raw_id):
        # Match optional prefix (letters/dashes) followed by numeric suffix
        m = re.match(r'^([A-Za-z\-_]*?)(\d+)$', raw_id)
        if m:
            return m.group(1).upper(), int(m.group(2))
        return raw_id.upper(), None

    s_prefix, s_num = parse_id(student_id)

    # Check start boundary
    if start_id:
        start_prefix, start_num = parse_id(start_id)
        if s_num is not None and start_num is not None and s_prefix == start_prefix:
            if s_num < start_num:
                return False
        else:
            if student_id < start_id:
                return False

    # Check end boundary
    if end_id:
        end_prefix, end_num = parse_id(end_id)
        if s_num is not None and end_num is not None and s_prefix == end_prefix:
            if s_num > end_num:
                return False
        else:
            if student_id > end_id:
                return False

    return True
