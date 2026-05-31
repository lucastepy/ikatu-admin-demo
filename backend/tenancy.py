from sqlalchemy import text
from sqlalchemy.schema import CreateSchema
from database import engine, Base
import models # Ensure models are loaded

def create_tenant_schema(db, schema_name: str):
    """
    Creates a new PostgreSQL schema for a tenant using explicit SQL.
    """
    try:
        # Use explicit SQL as requested
        db.execute(text(f"CREATE SCHEMA IF NOT EXISTS {schema_name}"))
        db.commit()
        print(f"SQL Execution: CREATE SCHEMA {schema_name} SUCCESS")
        return True
    except Exception as e:
        db.rollback()
        print(f"SQL Execution: CREATE SCHEMA {schema_name} FAILED: {e}")
        raise e

def init_tenant_db(schema_name: str):
    """
    Initializes the tenant's schema with all baseline tables.
    Matches the user requirement: "crear las tablas de ventas y clientes finales".
    Excludes admin/root tables.
    """
    print(f"Provisioning infrastructure for {schema_name}...")
    try:
        with engine.connect() as conn:
            # Set search path so create_all targets the tenant schema
            conn.execute(text(f"SET search_path TO {schema_name}, public"))
            
            # Identify business tables (those without an explicit schema, belonging to models.py)
            # Admin tables are explicitly marked with schema="public" in admin_models.py
            business_tables = [
                table for table in Base.metadata.sorted_tables 
                if table.schema is None
            ]
            
            # Robust manual creation for 'proveedores' just prior to create_all
            conn.execute(text(f"""
                CREATE TABLE IF NOT EXISTS {schema_name}.proveedores (
                    prov_id SERIAL PRIMARY KEY,
                    prov_nombre VARCHAR(150) NOT NULL,
                    prov_ruc VARCHAR(20),
                    prov_razon_social VARCHAR(150),
                    prov_direccion VARCHAR(200),
                    prov_dep INTEGER,
                    prov_dis INTEGER,
                    prov_ciu INTEGER,
                    prov_telefono VARCHAR(50),
                    prov_email VARCHAR(100),
                    prov_contacto VARCHAR(100),
                    prov_estado VARCHAR(1) DEFAULT 'A',
                    prov_tenantid INTEGER NOT NULL
                )
            """))
            
            # This creates ONLY the selected tables within the tenant schema.
            Base.metadata.create_all(bind=conn, tables=business_tables)
            
            conn.commit()
            print(f"READY: Tables for sales, inventory, and clients created in schema {schema_name}.")
            return True
    except Exception as e:
        print(f"PROVISIONING ERROR on {schema_name}: {e}")
        raise e

def set_tenant_schema(db, schema_name: str):
    """
    Sets the search_path for the current session.
    """
    db.execute(text(f"SET search_path TO {schema_name}, public"))

def validate_source_schema(db, source_schema: str):
    """
    Validates that all required reference tables exist in the source schema.
    Raises ValueError if any are missing.
    """
    tables = [
        "actividad_economica", "departamentos", "distritos", "ciudades", 
        "barrios", "cuotas_habilitadas", "entidades_financieras", 
        "forma_pago", "menu", "menu_det", "parametros", "perfiles", 
        "unidad_medida"
    ]
    missing_tables = []
    for table in tables:
        check_sql = text("SELECT 1 FROM information_schema.tables WHERE table_schema=:src AND table_name=:tbl")
        exists = db.execute(check_sql, {"src": source_schema, "tbl": table}).fetchone()
        if not exists:
            missing_tables.append(table)
    
    if missing_tables:
        error_msg = f"El esquema origen '{source_schema}' no contiene las tablas requeridas: {', '.join(missing_tables)}"
        raise ValueError(error_msg)
    return True

def seed_reference_data(db, schema_name: str, source_schema: str = "public"):
    """
    Copies reference data and initial setup from a source schema to the new tenant schema.
    """
    print(f"[SEED] Starting migration for {schema_name} using source {source_schema}...")
    
    tables = [
        "actividad_economica", "departamentos", "distritos", "ciudades", 
        "barrios", "cuotas_habilitadas", "entidades_financieras", 
        "forma_pago", "menu", "menu_det", "parametros", "perfiles", 
        "unidad_medida"
    ]
    
    try:
        # 1. Validation 
        validate_source_schema(db, source_schema)

        # 2. Create default Sucursal Casa Central
        # Sucursales has suc_tenantid, we set it to 1 by default for the tenant
        print(f"[SEED] Creating Casa Central in {schema_name}.sucursales...")
        db.execute(text(f"INSERT INTO {schema_name}.sucursales (suc_id, suc_nombre, suc_estado, suc_tenantid) VALUES (1, 'CASA CENTRAL', 'A', 1) ON CONFLICT (suc_id) DO NOTHING"))
        db.commit()

        # 3. Copy each table from the source_schema
        for table in tables:
            print(f"[SEED] Processing table: {table}...")
            count_res = db.execute(text(f"SELECT COUNT(*) FROM {source_schema}.{table}"))
            count = count_res.scalar()
            
            if count > 0:
                # Get columns for the TARGET table to ensure exact match
                col_query = text(f"SELECT column_name FROM information_schema.columns WHERE table_schema=:schema AND table_name=:table ORDER BY ordinal_position")
                columns = [row[0] for row in db.execute(col_query, {"schema": schema_name, "table": table})]
                
                if not columns:
                    print(f"  - Table {table}: WARNING (No columns found in target). Skipping.")
                    continue
                
                col_list = ", ".join(columns)
                print(f"[SEED] Copying {count} rows from {source_schema}.{table} to {schema_name}.{table} (Columns: {len(columns)})...")
                
                # Using explicit column names to avoid "more expressions than target columns" error
                copy_query = text(f"INSERT INTO {schema_name}.{table} ({col_list}) SELECT {col_list} FROM {source_schema}.{table} ON CONFLICT DO NOTHING")
                db.execute(copy_query)
                db.commit() 
                print(f"  - Table {table}: SUCCESS.")
            else:
                print(f"  - Table {table}: SKIP (Source is empty).")
        
        # 4. Synchronize sequences for the new tenant to avoid UniqueViolation
        print(f"[SEED] Synchronizing sequences for {schema_name}...")
        for table in tables:
            try:
                # Find PK column
                pk_query = text(f"""
                    SELECT a.attname
                    FROM   pg_index i
                    JOIN   pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
                    WHERE  i.indrelid = '"{schema_name}"."{table}"'::regclass
                    AND    i.indisprimary;
                """)
                pk_col = db.execute(pk_query).scalar()
                if pk_col:
                    seq_query = text(f"SELECT pg_get_serial_sequence('\"{schema_name}\".\"{table}\"', '{pk_col}')")
                    seq_name = db.execute(seq_query).scalar()
                    if seq_name:
                        db.execute(text(f"SELECT setval('{seq_name}', COALESCE((SELECT MAX({pk_col}) FROM \"{schema_name}\".\"{table}\"), 0) + 1, false)"))
            except Exception as e:
                print(f"  - Warning syncing sequence for {table}: {e}")
        db.commit()

        print(f"[SEED] Finished reference data migration for {schema_name}.")
        return True
    except Exception as e:
        db.rollback()
        print(f"[SEED] CRITICAL ERROR on {schema_name}: {e}")
        import traceback
        traceback.print_exc()
        raise e

def seed_tenant_admin(db, schema_name: str, admin_email: str, admin_name: str):
    """
    Seeds the tenant's database with an administrator user.
    Note: Profiles and menus are now mostly handled by seed_reference_data.
    """
    import auth 
    print(f"Seeding tenant admin for {schema_name} ({admin_email})...")
    try:
        # We use explicit schema prefixes for safety
        
        # 1. Menus
        menu_query = text(f"SELECT menu_cod FROM {schema_name}.menu WHERE UPPER(menu_nombre) LIKE '%ADMINISTRADOR%' OR menu_cod = 1 LIMIT 1")
        menu_res = db.execute(menu_query).fetchone()
        
        if not menu_res:
            db.execute(text(f"INSERT INTO {schema_name}.menu (menu_cod, menu_nombre) VALUES (1, 'Administrador')"))
            menu_id = 1
        else:
            menu_id = menu_res[0]

        # 2. Perfiles
        profile_query = text(f"SELECT perfil_cod FROM {schema_name}.perfiles WHERE UPPER(perfil_nombre) LIKE '%ADMIN%' OR perfil_cod = 1 LIMIT 1")
        profile_res = db.execute(profile_query).fetchone()
        
        if not profile_res:
            db.execute(text(f"INSERT INTO {schema_name}.perfiles (perfil_cod, perfil_nombre, menu_cod) VALUES (1, 'Administrador', :m_id)"), {"m_id": menu_id})
            profile_id = 1
        else:
            profile_id = profile_res[0]
        
        # 3. Usuario Administrador
        user_query = text(f"SELECT 1 FROM {schema_name}.usuarios WHERE usuario_email = :email")
        user_exists = db.execute(user_query, {"email": admin_email}).fetchone()
        
        if not user_exists:
            hashed_pw = auth.hash_password("admin123") 
            print(f"[SEED] Inserting admin user: {admin_email} with profile {profile_id}...")
            db.execute(text(f"""
                INSERT INTO {schema_name}.usuarios (usuario_email, usuario_nombre, usuario_password, perfil_cod, usuario_estado, usuario_primer_ingreso, usuario_sucursal, usuario_tenantid)
                VALUES (:email, :name, :pw, :p_id, 'A', True, 1, 1)
            """), {"email": admin_email, "name": admin_name, "pw": hashed_pw, "p_id": profile_id})
            print(f"[SEED] Admin user {admin_email} inserted.")
        else:
            print(f"[SEED] Admin user {admin_email} already exists in {schema_name}.")
        
        db.commit()
        print(f"SUCCESS: Tenant {schema_name} seeded with admin {admin_email} (Profile ID: {profile_id})")
        return True
    except Exception as e:
        db.rollback()
        import traceback
        error_detail = traceback.format_exc()
        print(f"[SEED ERROR] Failed to seed admin for {schema_name}: {e}")
        print(f"Detail: {error_detail}")
        return False
