import mysql.connector
from mysql.connector import Error
from contextlib import contextmanager
from dotenv import load_dotenv
import os

# .env 파일 로드
load_dotenv()

# 환경 변수에서 데이터베이스 연결 정보 가져오기
DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")
DB_PORT = os.getenv("DB_PORT")

# 데이터베이스 연결 설정
def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            port=DB_PORT
        )
        if connection.is_connected():
            return connection
    except Error as e:
        print(f"Error connecting to MySQL platform: {e}")
        return None

# 커서와 연결을 함께 반환
@contextmanager
def get_db_cursor():
    connection = get_db_connection()
    if connection:
        cursor = connection.cursor(dictionary=True)
        try:
            yield cursor, connection
        finally:
            cursor.close()
            connection.close()
    else:
        raise Exception("Database connection failed")



# 연결 확인용 간단한 코드
def test_db_connection():
    try:
        # 연결 시도
        connection = get_db_connection()
        
        if connection:
            # 연결이 성공하면 간단한 쿼리 실행
            cursor = connection.cursor()
            cursor.execute("SELECT 1")
            result = cursor.fetchone()  # 결과 확인
            if result:
                print("Database connection successful!")
            else:
                print("Database query failed.")
            cursor.close()
            connection.close()  # 연결 종료
        else:
            print("Failed to connect to the database.")
    except Exception as e:
        print(f"Error: {e}")

# 테스트 실행
test_db_connection()
