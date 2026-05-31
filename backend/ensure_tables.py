from sqlalchemy import text
from database import engine, Base
import models

def ensure_tenant_tables():
    print("Ensuring all business tables exist in all tenant schemas...")
    try:
        with engine.connect() as conn:
            # Get list of schemas (excluding system schemas)
            schemas_res = conn.execute(text("SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')"))
            all_schemas = [r[0] for r in schemas_res]
            
            for schema in all_schemas:
                # We identify if it is a business schema if it has 'categorias' (baseline table)
                # or if its name starts with 'tenant_'
                is_tenant = schema.startswith('tenant_')
                if not is_tenant:
                    table_exists = conn.execute(text(f"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = '{schema}' AND table_name = 'categorias')")).scalar()
                    is_tenant = table_exists
                
                if is_tenant:
                    print(f"  - Processing schema: {schema}")
                    # Set search path to this tenant
                    conn.execute(text(f'SET search_path TO "{schema}", public'))
                    
                    # Create all tables in this schema
                    # Metadata.create_all only creates tables that don't exist
                    # We pass 'bind=conn' so it uses the set search_path
                    
                    # We filter tables that should ONLY be in business schemas (table.schema is None)
                    business_tables = [
                        table for table in Base.metadata.sorted_tables 
                        if table.schema is None
                    ]
                    
                    Base.metadata.create_all(bind=conn, tables=business_tables)
                    conn.commit()
                    print(f"  - Schema {schema}: Checked/Created tables.")
                else:
                    print(f"  - Schema {schema}: Skipping (not a tenant).")
            
            print("Finished checking all schemas.")
    except Exception as e:
        print(f"CRITICAL ERROR Ensuring Tables: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    ensure_tenant_tables()
