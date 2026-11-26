import os
from flask import Flask, jsonify
from extensions import db, jwt, cors
from config import Config
from routes import (
    auth_bp, students_bp, lecturers_bp, administrators_bp,
    subjects_bp, classes_bp, enrollments_bp, classrooms_bp,
    seats_bp, attendance_sessions_bp, seat_reservations_bp,
    attendance_bp, reports_bp
)
from utils.seed_data import seed_database

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(students_bp)
    app.register_blueprint(lecturers_bp)
    app.register_blueprint(administrators_bp)
    app.register_blueprint(subjects_bp)
    app.register_blueprint(classes_bp)
    app.register_blueprint(enrollments_bp)
    app.register_blueprint(classrooms_bp)
    app.register_blueprint(seats_bp)
    app.register_blueprint(attendance_sessions_bp)
    app.register_blueprint(seat_reservations_bp)
    app.register_blueprint(attendance_bp)
    app.register_blueprint(reports_bp)

    @app.route('/')
    def root():
        return jsonify({
            'name': 'Digital Attendance System API',
            'version': '1.0.0',
            'status': 'ONLINE'
        }), 200

    @app.route('/api/health')
    def health():
        return jsonify({'status': 'healthy'}), 200

    # Create tables and seed data
    with app.app_context():
        db.create_all()
        # Automatically ensure new columns exist in attendance_sessions table
        try:
            from sqlalchemy import text
            with db.engine.connect() as conn:
                columns = [row[1] for row in conn.execute(text("PRAGMA table_info(attendance_sessions)")).fetchall()]
                if 'start_student_id' not in columns:
                    conn.execute(text("ALTER TABLE attendance_sessions ADD COLUMN start_student_id VARCHAR(50)"))
                    conn.commit()
                if 'end_student_id' not in columns:
                    conn.execute(text("ALTER TABLE attendance_sessions ADD COLUMN end_student_id VARCHAR(50)"))
                    conn.commit()
        except Exception as e:
            app.logger.warning(f"Column migration notice: {e}")
        seed_database()

    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
