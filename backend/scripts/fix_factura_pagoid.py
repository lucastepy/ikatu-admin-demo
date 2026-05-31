import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

sys.path.append(os.path.join(os.getcwd(), 'backend'))

def run_migration():
    load_dotenv('backend/.env')
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL no encontrada en backend/.env")
        return
        
    engine = create_engine(db_url)
    with engine.connect() as conn:
        try:
            print("Alterando tabla facturas para hacer pago_id nullable...")
            conn.execute(text("ALTER TABLE facturas ALTER COLUMN pago_id DROP NOT NULL;"))
            conn.commit()
            print("pago_id modificado exitosamente en facturas.")
        except Exception as e:
            print(f"Error modificando la tabla: {e}")

if __name__ == "__main__":
    run_migration()
