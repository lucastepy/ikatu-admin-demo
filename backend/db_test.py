print("DB: starting imports...")
print("DB: importing create_engine...")
from sqlalchemy import create_engine
print("DB: importing declarative_base...")
from sqlalchemy.ext.declarative import declarative_base
print("DB: importing sessionmaker...")
from sqlalchemy.orm import sessionmaker
print("DB: importing os...")
import os
print("DB: importing load_dotenv...")
from dotenv import load_dotenv
print("DB: imports done.")

print("DB: loading dotenv...")
load_dotenv()
print("DB: dotenv loaded.")

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
print(f"DB: URL found: {SQLALCHEMY_DATABASE_URL[:20]}...")

print("DB: creating engine...")
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    connect_args={"sslmode": "require"} if SQLALCHEMY_DATABASE_URL and ("supabase" in SQLALCHEMY_DATABASE_URL or "neon.tech" in SQLALCHEMY_DATABASE_URL) else {}
)
print("DB: engine created.")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
