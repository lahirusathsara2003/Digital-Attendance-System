import os
from datetime import timedelta
import sqlalchemy
from dotenv import load_dotenv

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(BASE_DIR, '.env'))

def get_database_uri():
    mysql_url = os.getenv('DATABASE_URL', 'mysql+pymysql://root:Lahiru2003#@localhost:3306/classroom_attendance_db')
    sqlite_fallback = f"sqlite:///{os.path.join(BASE_DIR, 'classroom_attendance.db')}"
    
    # Try connecting to MySQL if requested
    if mysql_url.startswith('mysql'):
        try:
            engine = sqlalchemy.create_engine(mysql_url, connect_args={'connect_timeout': 2})
            with engine.connect() as conn:
                pass
            print(f"[Database] Connected successfully to MySQL: {mysql_url.split('@')[-1]}")
            return mysql_url
        except Exception as e:
            print(f"[Database] MySQL connection attempt failed ({e}). Using SQLite fallback: {sqlite_fallback}")
            return sqlite_fallback
    return mysql_url or sqlite_fallback

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'classroom-secret-key-2026-ndt')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-super-secret-key-ndt-2026')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=int(os.getenv('JWT_EXPIRES_HOURS', '12')))
    
    SQLALCHEMY_DATABASE_URI = get_database_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
