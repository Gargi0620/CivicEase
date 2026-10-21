
from app.Database import get_connection

try:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """)

            tables = cur.fetchall()

            print("Database connection: SUCCESS")
            print("\nTables found:")

            for table in tables:
                print("-", table["table_name"])

            cur.execute("""
                SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.tables
                    WHERE table_schema = 'public'
                      AND table_name = 'schemes'
                );
            """)

            schemes_exists = cur.fetchone()["exists"]

            if schemes_exists:
                cur.execute("SELECT COUNT(*) AS total FROM public.schemes;")
                result = cur.fetchone()
                print("\nSchemes table exists.")
                print("Number of schemes in database:", result["total"])
            else:
                print("\nSchemes table does not exist yet.")

except Exception as error:
    print("Error:", type(error).__name__)
    print(str(error).splitlines()[0])
