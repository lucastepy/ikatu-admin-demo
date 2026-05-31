from sqlalchemy import create_engine, text
from fastapi import HTTPException
print("DB: importing declarative_base...")
from sqlalchemy.ext.declarative import declarative_base
print("DB: importing sessionmaker...")
from sqlalchemy.orm import sessionmaker
print("DB: importing os...")
import os
from context import tenant_schema
print("DB: importing load_dotenv...")
from dotenv import load_dotenv
print("DB: imports done.")

print("DB: loading dotenv...")
# Force reload environment variables from file, overriding any stale shell variables
load_dotenv(override=True)
print("DB: dotenv loaded.")

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
if SQLALCHEMY_DATABASE_URL and SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Remove channel_binding which can cause SSL reset on some poolers 
# and only force SSL for known cloud providers
if SQLALCHEMY_DATABASE_URL and any(p in SQLALCHEMY_DATABASE_URL for p in ["neon.tech", "supabase", "railway"]):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.split("?")[0] + "?sslmode=require"
elif SQLALCHEMY_DATABASE_URL and "?" not in SQLALCHEMY_DATABASE_URL and ("localhost" in SQLALCHEMY_DATABASE_URL or "127.0.0.1" in SQLALCHEMY_DATABASE_URL):
    # For local, ensure we don't accidentally inherit SSL requirements from previous runs if pooled
    pass


print(f"DB: URL found: {SQLALCHEMY_DATABASE_URL[:25] if SQLALCHEMY_DATABASE_URL else 'None'}...")

print("DB: creating engine...")
if not SQLALCHEMY_DATABASE_URL:
    print("DB: No DATABASE_URL set. Using in-memory SQLite for safety/startup check.")
    SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

try:
    _is_sqlite = not SQLALCHEMY_DATABASE_URL or "sqlite" in SQLALCHEMY_DATABASE_URL
    _needs_ssl = not _is_sqlite and SQLALCHEMY_DATABASE_URL and (
        "supabase" in SQLALCHEMY_DATABASE_URL
        or "neon.tech" in SQLALCHEMY_DATABASE_URL
        or "railway" in SQLALCHEMY_DATABASE_URL
    )
    _engine_kwargs = {
        "pool_pre_ping": True,
        "pool_size": 10,       # Keep 10 active connections ready
        "max_overflow": 20,    # Allow 20 more during peak loads
        "pool_recycle": 600,   # Recycle connections every 10 mins 
        "pool_timeout": 30
    }
    if not _is_sqlite:
        _engine_kwargs["connect_args"] = _engine_kwargs.get("connect_args", {})
        _engine_kwargs["connect_args"]["options"] = "-c client_encoding=utf8"
        if _needs_ssl:
            _engine_kwargs["connect_args"].update({
                "sslmode": "require",
                "connect_timeout": 30,
                "keepalives": 1,
                "keepalives_idle": 30,
                "keepalives_interval": 10,
                "keepalives_count": 5
            })

    engine = create_engine(SQLALCHEMY_DATABASE_URL, **_engine_kwargs)
    print("DB: engine created.")
except Exception as e:
    print(f"DB: Engine creation failed: {repr(e)}")
    # Do NOT re-raise: let the app start and fail per-request with a clear DB error
    # instead of crashing the entire serverless function at import time.
    engine = create_engine("sqlite:///:memory:")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

from sqlalchemy import event
from sqlalchemy import event, text

def set_search_path_logic(conn, target=None):
    if target is None:
        try:
            from context import tenant_schema
            target = tenant_schema.get()
        except:
            target = "public"
    
    if target:
        # PostgreSQL identifiers are case-insensitive unless quoted.
        # We ensure quotes for safety with schema names like 'tenant_xyz'.
        conn.execute(text(f'SET search_path TO "{target}", public'))

@event.listens_for(engine, "connect")
def set_search_path_on_connect(dbapi_connection, connection_record):
    """Sets search_path on new database connections."""
    cursor = dbapi_connection.cursor()
    try:
        from context import tenant_schema
        target = tenant_schema.get() or "public"
        cursor.execute(f'SET search_path TO "{target}", public')
    except:
        cursor.execute('SET search_path TO public')
    finally:
        cursor.close()

@event.listens_for(engine, "begin")
def set_search_path_on_begin(conn):
    """Reinforces search_path on every transaction start."""
    set_search_path_logic(conn)

def get_db():
    db = SessionLocal()
    try:
        target = tenant_schema.get()
        print(f"DEBUG GET_DB: Setting search_path to [{target}]")
        try:
            # Force schema context for the session
            db.execute(text(f'SET search_path TO "{target}", public'))
        except Exception as e:
            print(f"CRITICAL DB ERROR: Failed to set search_path to {target}: {repr(e)}")
            raise HTTPException(status_code=500, detail=f"Database schema isolation error for {target}")
        
        yield db
    finally:
        db.close()

def run_migrations():
    """
    Idempotent migration to add missing columns to the production database.
    Useful for Vercel deployments where direct database access might be limited.
    """
    print("DB: Running auto-migrations...")
    try:
        with engine.connect() as connection:
            columns = [
                ("cli_dep", "INTEGER"),
                ("cli_dis", "INTEGER"),
                ("cli_ciu", "INTEGER"),
                ("cli_bar", "INTEGER"),
                ("cli_tipo", "VARCHAR(1) DEFAULT 'F'"),
                ("cli_nro_casa", "VARCHAR(50)"),
                ("cli_geo", "VARCHAR(100)")
            ]
            for col_name, col_type in columns:
                # print(f"DB: Ensuring column {col_name} exists...")
                connection.execute(text(f"ALTER TABLE clientes ADD COLUMN IF NOT EXISTS {col_name} {col_type};"))
            
            connection.commit()
            print("DB: Auto-migrations completed.")
    except Exception as e:
        print(f"DB: Auto-migration failed: {e}")
