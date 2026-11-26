from datetime import date, datetime
from extensions import db
from models import (
    User, Student, Lecturer, Administrator,
    Subject, Class, Enrollment, Classroom, Seat,
    AttendanceSession, SeatReservation, Attendance
)
from utils.code_generator import generate_classroom_seats

def seed_database():
    """Seed initial sample data if tables are empty."""
    # Check if admin already exists
    if User.query.filter_by(username='admin').first():
        print("Database already seeded.")
        return

    print("Seeding initial sample data...")

    # 1. Administrator
    admin_user = User(username='admin', role='ADMINISTRATOR', status='ACTIVE')
    admin_user.set_password('admin123')
    db.session.add(admin_user)
    db.session.flush()

    admin_profile = Administrator(user_id=admin_user.id, name='System Administrator', email='admin@attendance.edu')
    db.session.add(admin_profile)

    # 2. Lecturers
    lecturers_data = [
        {'username': 'lecturer1', 'password': 'password123', 'code': 'L001', 'name': 'Dr. Perera', 'email': 'dr.perera@attendance.edu'},
        {'username': 'lecturer2', 'password': 'password123', 'code': 'L002', 'name': 'Ms. Silva', 'email': 'ms.silva@attendance.edu'},
    ]
    created_lecturers = []
    for l_data in lecturers_data:
        u = User(username=l_data['username'], role='LECTURER', status='ACTIVE')
        u.set_password(l_data['password'])
        db.session.add(u)
        db.session.flush()

        lec = Lecturer(user_id=u.id, lecturer_id=l_data['code'], name=l_data['name'], email=l_data['email'], status='ACTIVE')
        db.session.add(lec)
        created_lecturers.append(lec)

    # 3. Students
    students_data = [
        {'username': 'student1', 'password': 'password123', 'code': 'DS001', 'name': 'Nimal Perera', 'email': 'nimal@student.edu', 'phone': '0771234567'},
        {'username': 'student2', 'password': 'password123', 'code': 'DS002', 'name': 'Kamal Silva', 'email': 'kamal@student.edu', 'phone': '0777654321'},
        {'username': 'student3', 'password': 'password123', 'code': 'DS003', 'name': 'Amal Fernando', 'email': 'amal@student.edu', 'phone': '0712348901'},
    ]
    created_students = []
    for s_data in students_data:
        u = User(username=s_data['username'], role='STUDENT', status='ACTIVE')
        u.set_password(s_data['password'])
        db.session.add(u)
        db.session.flush()

        stud = Student(user_id=u.id, student_id=s_data['code'], name=s_data['name'], email=s_data['email'], phone=s_data['phone'], status='ACTIVE')
        db.session.add(stud)
        created_students.append(stud)

    # 4. Subjects
    subjects_data = [
        {'code': 'DS201', 'name': 'Data Science', 'desc': 'Foundations of Data Science, ML algorithms and analytics.'},
        {'code': 'SE202', 'name': 'Software Engineering', 'desc': 'Modern software engineering principles and architectural patterns.'},
        {'code': 'DB203', 'name': 'Database Systems', 'desc': 'Relational databases, SQL, ACID properties, and ORM mapping.'}
    ]
    created_subjects = []
    for s_info in subjects_data:
        sub = Subject(subject_code=s_info['code'], subject_name=s_info['name'], description=s_info['desc'])
        db.session.add(sub)
        created_subjects.append(sub)

    db.session.flush()

    # 5. Classrooms
    classrooms_data = [
        {'code': 'LH01', 'name': 'Lecture Hall 01', 'rows': 5, 'left': 6, 'right': 7},
        {'code': 'LH02', 'name': 'Lecture Hall 02', 'rows': 4, 'left': 5, 'right': 5},
        {'code': 'LAB01', 'name': 'Computer Lab 01', 'rows': 4, 'left': 4, 'right': 4},
    ]
    created_classrooms = []
    for c_info in classrooms_data:
        crm = Classroom(
            room_code=c_info['code'],
            room_name=c_info['name'],
            rows=c_info['rows'],
            left_block_columns=c_info['left'],
            right_block_columns=c_info['right']
        )
        db.session.add(crm)
        db.session.flush()
        generate_classroom_seats(crm)
        created_classrooms.append(crm)

    # 6. Classes
    c1 = Class(subject_id=created_subjects[0].id, lecturer_id=created_lecturers[0].id, class_name='DS201 - Data Science Batch 2026', semester='Semester 2', academic_year='2026')
    c2 = Class(subject_id=created_subjects[1].id, lecturer_id=created_lecturers[1].id, class_name='SE202 - Software Architecture', semester='Semester 2', academic_year='2026')
    c3 = Class(subject_id=created_subjects[2].id, lecturer_id=created_lecturers[0].id, class_name='DB203 - Advanced Databases', semester='Semester 2', academic_year='2026')
    db.session.add_all([c1, c2, c3])
    db.session.flush()

    # 7. Enrollments
    for stud in created_students:
        db.session.add(Enrollment(student_id=stud.id, class_id=c1.id))
        db.session.add(Enrollment(student_id=stud.id, class_id=c2.id))
        db.session.add(Enrollment(student_id=stud.id, class_id=c3.id))

    db.session.flush()

    # 8. Sample Active Attendance Session
    today = date.today()
    sample_session = AttendanceSession(
        class_id=c1.id,
        classroom_id=created_classrooms[0].id,
        session_date=today,
        start_time='10:30 AM',
        end_time='12:30 PM',
        attendance_code='DS201-8392',
        status='OPEN'
    )
    db.session.add(sample_session)
    db.session.flush()

    # 9. Past sample attendance session with records for history
    past_session = AttendanceSession(
        class_id=c1.id,
        classroom_id=created_classrooms[0].id,
        session_date=today,
        start_time='08:30 AM',
        end_time='10:00 AM',
        attendance_code='DS201-1001',
        status='CLOSED'
    )
    db.session.add(past_session)
    db.session.flush()

    seat_1 = Seat.query.filter_by(classroom_id=created_classrooms[0].id, seat_number='1').first()
    seat_2 = Seat.query.filter_by(classroom_id=created_classrooms[0].id, seat_number='2').first()

    if seat_1 and seat_2:
        # Record 1
        res1 = SeatReservation(session_id=past_session.id, student_id=created_students[0].id, seat_id=seat_1.id)
        att1 = Attendance(session_id=past_session.id, student_id=created_students[0].id, seat_id=seat_1.id, attendance_date=today, attendance_time='08:35 AM', status='PRESENT')
        # Record 2
        res2 = SeatReservation(session_id=past_session.id, student_id=created_students[1].id, seat_id=seat_2.id)
        att2 = Attendance(session_id=past_session.id, student_id=created_students[1].id, seat_id=seat_2.id, attendance_date=today, attendance_time='08:38 AM', status='PRESENT')
        db.session.add_all([res1, att1, res2, att2])

    db.session.commit()
    print("Database successfully seeded with students, lecturers, classrooms, and sessions.")
