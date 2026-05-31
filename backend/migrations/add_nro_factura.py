import sys
import os
from sqlalchemy import text
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import engine

def migrate():
    print("Running migration: adding pago_factura_nro_factura to pago_facturas...")
    try:
        with engine.connect() as conn:
            # Get list of schemas
            schemas_res = conn.execute(text("SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')"))
            all_schemas = [r[0] for r in schemas_res]
            
            for schema in all_schemas:
                # Check if it's a tenant schema or public
                is_tenant = schema.startswith('tenant_') or schema == 'public'
                if not is_tenant:
                    table_exists = conn.execute(text(f"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = '{schema}' AND table_name = 'pago_facturas')")).scalar()
                    is_tenant = table_exists
                
                if is_tenant:
                    # Check if table exists properly
                    table_exists = conn.execute(text(f"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = '{schema}' AND table_name = 'pago_facturas')")).scalar()
                    if not table_exists:
                        print(f"  - Schema {schema}: Table pago_facturas not found, skipping.")
                        continue
                        
                    print(f"  - Processing schema: {schema}")
                    # Check if column already exists
                    col_exists = conn.execute(text(f"SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = '{schema}' AND table_name = 'pago_facturas' AND column_name = 'pago_factura_nro_factura')")).scalar()
                    
                    if not col_exists:
                        print(f"    * Adding column pago_factura_nro_factura to {schema}.pago_facturas")
                        conn.execute(text(f"ALTER TABLE \"{schema}\".pago_facturas ADD COLUMN pago_factura_nro_factura NUMERIC NOT NULL DEFAULT 0"))
                        
                        # Drop old unique and add new one
                        print(f"    * Updating unique constraint in {schema}.pago_facturas")
                        # Drop if exists by searching for constraints
                        constraints = conn.execute(text(f"SELECT constraint_name FROM information_schema.table_constraints WHERE table_schema = '{schema}' AND table_name = 'pago_facturas' AND constraint_type = 'UNIQUE'")).fetchall()
                        for c in constraints:
                            if 'pago_factura_fecha_proveedor' in c[0].lower():
                                conn.execute(text(f"ALTER TABLE \"{schema}\".pago_facturas DROP CONSTRAINT \"{c[0]}\""))
                        
                        conn.execute(text(f"ALTER TABLE \"{schema}\".pago_facturas ADD CONSTRAINT uix_pago_factura_nro_fecha_proveedor UNIQUE (pago_factura_nro_factura, pago_factura_fecha, pago_factura_proveedor)"))
                        conn.commit()
                    else:
                        print(f"    * Column already exists in {schema}")
            
            print("Migration finished.")
    except Exception as e:
        print(f"Migration error: {e}")

if __name__ == "__main__":
    migrate()
