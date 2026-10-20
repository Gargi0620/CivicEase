
import os
from app.Database import get_connection

print("Host loaded:", os.getenv("DB_HOST"))
print("Port loaded:", os.getenv("DB_PORT"))
print("Database loaded:", os.getenv("DB_NAME"))
print("Username loaded:", os.getenv("DB_USER"))
print("Password loaded:", bool(os.getenv("DB_PASSWORD")))

try:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT current_database(), current_user;")
            print("Connection successful:", cur.fetchone())
except Exception as error:
    print("Connection failed:", type(error).__name__)
    print(str(error).splitlines()[0])
