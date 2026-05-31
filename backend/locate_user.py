from database import engine
from sqlalchemy import text
schemas = ['public', 'tenant_fitra', 'tenant_motokeiro']
for s in schemas:
    try:
        with engine.connect() as conn:
            res = conn.execute(text(f"SELECT COUNT(*) FROM {s}.usuarios WHERE usuario_email = 'julianag@ikatu.com.py'"))
            count = res.fetchone()[0]
            print(f"User found in schema {s}: {count}")
    except Exception as e:
        print(f"Could not check schema {s}: {e}")
