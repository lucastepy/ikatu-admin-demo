from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session, joinedload
from database import get_db
import admin_models as models
import admin_schemas as schemas
from typing import List, Optional
from tenancy import create_tenant_schema, init_tenant_db, seed_tenant_admin, seed_reference_data, validate_source_schema
import uuid
import auth
from datetime import date
from utils.email_utils import send_email

router = APIRouter(prefix="/api/admin", tags=["Admin Master Panel"])

# --- Dependencies ---

def get_current_admin(token: str = Depends(auth.oauth2_scheme), db: Session = Depends(get_db)) -> models.UsuarioAdmin:
    payload = auth.decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token de administrador inválido")
    
    username: str = payload.get("sub")
    role: str = payload.get("role")
    
    if not username or role != "superadmin":
        raise HTTPException(status_code=403, detail="Acceso denegado: Se requiere rol de superadmin")
    
    user = db.query(models.UsuarioAdmin).filter(models.UsuarioAdmin.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuario administrador no encontrado")
    
    # if not user.activo:
    #    raise HTTPException(status_code=403, detail="Cuenta de administrador inactiva")
        
    return user

def log_admin_action(
    db: Session, 
    admin_id: int, 
    accion: str, 
    recurso: str, 
    recurso_id: str = None, 
    detalle: str = None,
    anteriores: any = None,
    nuevos: any = None,
    request: Request = None
):
    ip = request.client.host if request else None
    log = models.AuditoriaAdmin(
        admin_id=admin_id,
        accion=accion,
        recurso=recurso,
        recurso_id=str(recurso_id) if recurso_id else None,
        detalle=detalle,
        valores_anteriores=jsonable_encoder(anteriores) if anteriores else None,
        valores_nuevos=jsonable_encoder(nuevos) if nuevos else None,
        ip_address=ip
    )
    db.add(log)
    db.commit()

# --- Auth SuperAdmin ---

@router.post("/login", response_model=schemas.AdminLoginResponse)
def admin_login(login_data: schemas.AdminLoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.UsuarioAdmin).filter(models.UsuarioAdmin.username == login_data.username).first()
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales de administrador inválidas")
    
    if not auth.verify_password(login_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales de administrador inválidas")
    
    # if not user.activo: # Removed to match user's table structure
    #    raise HTTPException(status_code=403, detail="Cuenta de administrador inactiva")

    access_token = auth.create_access_token(data={"sub": user.username, "role": "superadmin"})
    
    return {
        "token": access_token,
        "user": user
    }

@router.get("/init-root")
def init_root_admin(db: Session = Depends(get_db)):
    """Initialize root system: ensure public tables exist and create default admin"""
    try:
        from database import Base, engine
        import admin_models # Ensure models are loaded
        # Only create tables that explicitly belong to the public schema
        admin_tables = [
            table for table in Base.metadata.sorted_tables 
            if table.schema == "public"
        ]
        Base.metadata.create_all(bind=engine, tables=admin_tables)
        print("INIT: Public tables created/verified successfully.")
        
        # Optional: Verify public schema exists and is searchable
        from sqlalchemy import text
        with engine.connect() as conn:
            result = conn.execute(text("SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'public'")).scalar()
            if not result:
                print("WARNING: 'public' schema not found after creation attempt.")
            else:
                print("INIT: 'public' schema confirmed to exist.")
            conn.commit() # Ensure any DDL is committed if not auto-committed by create_all
            
    except Exception as e:
        print(f"INIT: Error creating tables: {e}")
        # Not raising here to still allow the user creation check below
        
    admin = db.query(models.UsuarioAdmin).filter(models.UsuarioAdmin.username == "admin").first()
    if admin:
        return {"message": "Admin already exists and tables verified", "user": admin.username}
    
    new_admin = models.UsuarioAdmin(
        username="admin",
        password_hash=auth.hash_password("admin123"),
        nombre="Super Administrador"
    )
    db.add(new_admin)
    db.commit()
    return {"message": "Admin created successfully and tables verified", "user": "admin", "pass": "admin123"}

@router.put("/profile", response_model=schemas.AdminUserRead)
def update_admin_profile(
    update_data: schemas.AdminUpdate, 
    request: Request, 
    db: Session = Depends(get_db), 
    current_admin: models.UsuarioAdmin = Depends(get_current_admin)
):
    """Update current admin profile (name and/or password)"""
    if update_data.nombre:
        current_admin.nombre = update_data.nombre
    
    if update_data.password:
        current_admin.password_hash = auth.hash_password(update_data.password)
    
    db.commit()
    db.refresh(current_admin)
    
    log_admin_action(
        db, current_admin.id, "UPDATE_PROFILE", "usuarios_admin", current_admin.id, 
        "Actualizada contraseña o perfil de administrador", request=request
    )
    
    return current_admin

# --- Audit Logs ---

@router.get("/audit-logs")
def get_audit_logs(
    db: Session = Depends(get_db),
    current_admin: models.UsuarioAdmin = Depends(get_current_admin),
    skip: int = 0,
    limit: int = 20,
    fecha_desde: Optional[str] = None,
    fecha_hasta: Optional[str] = None,
    search: Optional[str] = None,
):
    from sqlalchemy import text
    from datetime import datetime, date, timedelta

    query = db.query(models.AuditoriaAdmin).options(joinedload(models.AuditoriaAdmin.admin))

    # Default: only today if no dates provided
    if fecha_desde:
        try:
            dt_desde = datetime.strptime(fecha_desde, "%Y-%m-%d")
            query = query.filter(models.AuditoriaAdmin.fecha >= dt_desde)
        except ValueError:
            pass
    else:
        dt_desde = datetime.combine(date.today(), datetime.min.time())
        query = query.filter(models.AuditoriaAdmin.fecha >= dt_desde)

    if fecha_hasta:
        try:
            dt_hasta = datetime.strptime(fecha_hasta, "%Y-%m-%d") + timedelta(days=1)
            query = query.filter(models.AuditoriaAdmin.fecha < dt_hasta)
        except ValueError:
            pass
    else:
        dt_hasta = datetime.combine(date.today(), datetime.min.time()) + timedelta(days=1)
        query = query.filter(models.AuditoriaAdmin.fecha < dt_hasta)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            models.AuditoriaAdmin.detalle.ilike(search_term) |
            models.AuditoriaAdmin.accion.ilike(search_term) |
            models.AuditoriaAdmin.recurso.ilike(search_term)
        )

    total = query.count()
    items = query.order_by(models.AuditoriaAdmin.fecha.desc()).offset(skip).limit(limit).all()

    return {"total": total, "items": items}


@router.get("/db-schemas", response_model=List[str])
def list_db_schemas(db: Session = Depends(get_db), current_admin: models.UsuarioAdmin = Depends(get_current_admin)):
    """
    Lists all available database schemas, excluding system presets.
    """
    from sqlalchemy import text
    result = db.execute(text("""
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast', 'public')
        AND schema_name NOT LIKE 'pg_temp_%'
        AND schema_name NOT LIKE 'pg_toast_temp_%'
        ORDER BY schema_name ASC
    """))
    return [row[0] for row in result]

# --- CRUD Planes ---

@router.get("/planes", response_model=List[schemas.PlanRead])
def get_planes(db: Session = Depends(get_db), current_admin: models.UsuarioAdmin = Depends(get_current_admin)):
    return db.query(models.Plan).options(
        joinedload(models.Plan.cobros).joinedload(models.PlanCobro.tramos)
    ).all()

@router.post("/planes", response_model=schemas.PlanRead)
def create_plan(plan: schemas.PlanCreate, request: Request, db: Session = Depends(get_db), current_admin: models.UsuarioAdmin = Depends(get_current_admin)):
    db_plan = models.Plan(**plan.model_dump())
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    
    log_admin_action(
        db, current_admin.id, "CREATE", "planes", db_plan.id, 
        f"Creado plan {db_plan.nombre}", nuevos=plan.model_dump(), request=request
    )
    
    return db_plan

@router.put("/planes/{plan_id}", response_model=schemas.PlanRead)
def update_plan(plan_id: int, plan: schemas.PlanUpdate, request: Request, db: Session = Depends(get_db), current_admin: models.UsuarioAdmin = Depends(get_current_admin)):
    db_plan = db.query(models.Plan).filter(models.Plan.id == plan_id).first()
    if not db_plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado")
    old_data = { "nombre": db_plan.nombre }
    update_data = plan.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_plan, key, value)
    
    db.commit()
    db.refresh(db_plan)
    
    log_admin_action(
        db, current_admin.id, "UPDATE", "planes", plan_id, 
        f"Actualizado plan {db_plan.nombre}", anteriores=old_data, nuevos=update_data, request=request
    )
    
    return db_plan

@router.delete("/planes/{plan_id}")
def delete_plan(plan_id: int, request: Request, db: Session = Depends(get_db), current_admin: models.UsuarioAdmin = Depends(get_current_admin)):
    db_plan = db.query(models.Plan).filter(models.Plan.id == plan_id).first()
    if not db_plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado")
    
    plan_name = db_plan.nombre
    db.delete(db_plan)
    db.commit()
    
    log_admin_action(
        db, current_admin.id, "DELETE", "planes", plan_id, 
        f"Eliminado plan {plan_name}", request=request
    )
    
# --- Tarifas (Cobros y Tramos) ---

@router.post("/planes/{plan_id}/cobros", response_model=schemas.PlanCobroRead)
def create_plan_cobro(plan_id: int, cobro: schemas.PlanCobroCreate, request: Request, db: Session = Depends(get_db), current_admin: models.UsuarioAdmin = Depends(get_current_admin)):
    db_plan = db.query(models.Plan).filter(models.Plan.id == plan_id).first()
    if not db_plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado")
    
    db_cobro = models.PlanCobro(
        plan_id=plan_id,
        plan_cob_tipo_cobro=cobro.plan_cob_tipo_cobro,
        plan_cob_monto_base=cobro.plan_cob_monto_base,
        plan_cob_activo=cobro.plan_cob_activo,
        plan_cob_usr_usuario_alta=current_admin.username
    )
    db.add(db_cobro)
    db.commit()
    db.refresh(db_cobro)
    
    log_admin_action(
        db, current_admin.id, "CREATE", "plan_cobros", db_cobro.plan_cob_id, 
        f"Creado cobro {db_cobro.plan_cob_tipo_cobro} para plan {plan_id}", nuevos=cobro.model_dump(), request=request
    )
    
    return db_cobro

@router.put("/planes/cobros/{cobro_id}", response_model=schemas.PlanCobroRead)
def update_plan_cobro(cobro_id: int, cobro: schemas.PlanCobroUpdate, request: Request, db: Session = Depends(get_db), current_admin: models.UsuarioAdmin = Depends(get_current_admin)):
    db_cobro = db.query(models.PlanCobro).filter(models.PlanCobro.plan_cob_id == cobro_id).first()
    if not db_cobro:
        raise HTTPException(status_code=404, detail="Cobro no encontrado")
    
    update_data = cobro.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_cobro, key, value)
    
    db.commit()
    db.refresh(db_cobro)
    
    log_admin_action(
        db, current_admin.id, "UPDATE", "plan_cobros", cobro_id, 
        f"Actualizado cobro", nuevos=update_data, request=request
    )
    
    return db_cobro

@router.delete("/planes/cobros/{cobro_id}")
def delete_plan_cobro(cobro_id: int, request: Request, db: Session = Depends(get_db), current_admin: models.UsuarioAdmin = Depends(get_current_admin)):
    db_cobro = db.query(models.PlanCobro).filter(models.PlanCobro.plan_cob_id == cobro_id).first()
    if not db_cobro:
        raise HTTPException(status_code=404, detail="Cobro no encontrado")
    
    tipo = db_cobro.plan_cob_tipo_cobro
    db.delete(db_cobro)
    db.commit()
    
    log_admin_action(
        db, current_admin.id, "DELETE", "plan_cobros", cobro_id, 
        f"Eliminado cobro {tipo}", request=request
    )
    
    return {"message": "Cobro eliminado"}

@router.post("/planes/cobros/{cobro_id}/tramos", response_model=schemas.PlanCobroTramoRead)
def create_plan_cobro_tramo(cobro_id: int, tramo: schemas.PlanCobroTramoCreate, request: Request, db: Session = Depends(get_db), current_admin: models.UsuarioAdmin = Depends(get_current_admin)):
    db_cobro = db.query(models.PlanCobro).filter(models.PlanCobro.plan_cob_id == cobro_id).first()
    if not db_cobro:
        raise HTTPException(status_code=404, detail="Cobro no encontrado")
    
    db_tramo = models.PlanCobroTramo(
        plan_cob_id=cobro_id,
        plan_cob_tra_rango_desde=tramo.plan_cob_tra_rango_desde,
        plan_cob_tra_rango_hasta=tramo.plan_cob_tra_rango_hasta,
        plan_cob_tra_monto_por_tramo=tramo.plan_cob_tra_monto_por_tramo,
        plan_cob_tra_usr_usuario_alta=current_admin.username
    )
    db.add(db_tramo)
    db.commit()
    db.refresh(db_tramo)
    
    log_admin_action(
        db, current_admin.id, "CREATE", "plan_cobros_tramos", db_tramo.plan_cob_tra_id, 
        f"Creado tramo {db_tramo.plan_cob_tra_rango_desde} - {db_tramo.plan_cob_tra_rango_hasta}", nuevos=tramo.model_dump(), request=request
    )
    
    return db_tramo

@router.put("/planes/tramos/{tramo_id}", response_model=schemas.PlanCobroTramoRead)
def update_plan_cobro_tramo(tramo_id: int, tramo: schemas.PlanCobroTramoUpdate, request: Request, db: Session = Depends(get_db), current_admin: models.UsuarioAdmin = Depends(get_current_admin)):
    db_tramo = db.query(models.PlanCobroTramo).filter(models.PlanCobroTramo.plan_cob_tra_id == tramo_id).first()
    if not db_tramo:
        raise HTTPException(status_code=404, detail="Tramo no encontrado")
    
    update_data = tramo.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_tramo, key, value)
    
    db.commit()
    db.refresh(db_tramo)
    
    log_admin_action(
        db, current_admin.id, "UPDATE", "plan_cobros_tramos", tramo_id, 
        f"Actualizado tramo", nuevos=update_data, request=request
    )
    
    return db_tramo

@router.delete("/planes/tramos/{tramo_id}")
def delete_plan_cobro_tramo(tramo_id: int, request: Request, db: Session = Depends(get_db), current_admin: models.UsuarioAdmin = Depends(get_current_admin)):
    db_tramo = db.query(models.PlanCobroTramo).filter(models.PlanCobroTramo.plan_cob_tra_id == tramo_id).first()
    if not db_tramo:
        raise HTTPException(status_code=404, detail="Tramo no encontrado")
    
    db.delete(db_tramo)
    db.commit()
    
    log_admin_action(
        db, current_admin.id, "DELETE", "plan_cobros_tramos", tramo_id, 
        f"Eliminado tramo", request=request
    )
    
    return {"message": "Tramo eliminado"}

# --- CRUD Sistemas ---

@router.get("/sistemas", response_model=List[schemas.SistemaRead])
def get_sistemas(db: Session = Depends(get_db)):
    return db.query(models.Sistema).all()

@router.post("/sistemas", response_model=schemas.SistemaRead)
def create_sistema(sistema: schemas.SistemaCreate, request: Request, db: Session = Depends(get_db), current_admin: models.UsuarioAdmin = Depends(get_current_admin)):
    db_sis = models.Sistema(**sistema.model_dump())
    db.add(db_sis)
    db.commit()
    db.refresh(db_sis)
    
    log_admin_action(
        db, current_admin.id, "CREATE", "sistemas", db_sis.id, 
        f"Creado sistema {db_sis.nombre}", nuevos=sistema.model_dump(), request=request
    )
    return db_sis

@router.put("/sistemas/{sis_id}", response_model=schemas.SistemaRead)
def update_sistema(sis_id: int, sistema: schemas.SistemaCreate, request: Request, db: Session = Depends(get_db), current_admin: models.UsuarioAdmin = Depends(get_current_admin)):
    db_sis = db.query(models.Sistema).filter(models.Sistema.id == sis_id).first()
    if not db_sis:
        raise HTTPException(status_code=404, detail="Sistema no encontrado")
    
    old_data = {"nombre": db_sis.nombre, "descripcion": db_sis.descripcion}
    update_data = sistema.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_sis, key, value)
        
    db.commit()
    db.refresh(db_sis)
    
    log_admin_action(
        db, current_admin.id, "UPDATE", "sistemas", sis_id, 
        f"Actualizado sistema {db_sis.nombre}", anteriores=old_data, nuevos=update_data, request=request
    )
    return db_sis

@router.delete("/sistemas/{sis_id}")
def delete_sistema(sis_id: int, request: Request, db: Session = Depends(get_db), current_admin: models.UsuarioAdmin = Depends(get_current_admin)):
    db_sis = db.query(models.Sistema).filter(models.Sistema.id == sis_id).first()
    if not db_sis:
        raise HTTPException(status_code=404, detail="Sistema no encontrado")
        
    # Validar integridad referencial
    clients_count = db.query(models.MaestroCliente).filter(models.MaestroCliente.sistema_id == sis_id).count()
    if clients_count > 0:
        raise HTTPException(status_code=400, detail=f"No se puede eliminar. Hay {clients_count} empresa(s) utilizando este sistema.")
        
    sis_nombre = db_sis.nombre
    db.delete(db_sis)
    db.commit()
    
    log_admin_action(
        db, current_admin.id, "DELETE", "sistemas", sis_id, 
        f"Eliminado sistema {sis_nombre}", request=request
    )
    return {"message": "Sistema eliminado correctamente"}

# --- CRUD Maestro Clientes ---

@router.get("/maestro-clientes", response_model=List[schemas.MaestroClienteRead])
def get_maestro_clientes(db: Session = Depends(get_db), current_admin: models.UsuarioAdmin = Depends(get_current_admin)):
    return db.query(models.MaestroCliente).options(
        joinedload(models.MaestroCliente.sistema)
    ).all()

@router.get("/maestro-clientes/slug/{slug}", response_model=schemas.MaestroClienteRead)
def get_maestro_cliente_by_slug(slug: str, db: Session = Depends(get_db)):
    """
    Public endpoint to get company branding (name, logo) by URL slug.
    Required for the dynamic login page.
    """
    cliente = db.query(models.MaestroCliente).filter(
        models.MaestroCliente.url_slug == slug.lower()
    ).options(
        joinedload(models.MaestroCliente.sistema)
    ).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    return cliente

@router.post("/maestro-clientes", response_model=schemas.MaestroClienteRead)
def create_maestro_cliente(cliente: schemas.MaestroClienteCreate, request: Request, db: Session = Depends(get_db), current_admin: models.UsuarioAdmin = Depends(get_current_admin)):
    slug = cliente.url_slug.lower().strip().replace(" ", "-")
    db_schema = cliente.db_schema.lower().strip()
    
    existing_cliente = db.query(models.MaestroCliente).filter(models.MaestroCliente.url_slug == slug).first()
    
    if existing_cliente:
        if not cliente.initialize_db:
            return existing_cliente
        else:
            raise HTTPException(status_code=400, detail=f"El slug '{slug}' ya está en uso.")
    
    if db.query(models.MaestroCliente).filter(models.MaestroCliente.db_schema == db_schema).first():
        raise HTTPException(status_code=400, detail=f"El esquema '{db_schema}' ya está en uso.")

    # Validate source schema before proceeding, only if initialization is requested
    if cliente.initialize_db:
        try:
            validate_source_schema(db, cliente.source_schema)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    data = cliente.model_dump(exclude={"initialize_db", "url_slug", "db_schema", "source_schema"})
    db_cliente = models.MaestroCliente(**data, url_slug=slug, db_schema=db_schema)
    db.add(db_cliente)
    db.commit()
    db.refresh(db_cliente)
    
    db.commit() # Final commit of the master record before starting heavy provision
    
    if cliente.initialize_db:
        print(f"[AUTH] Starting provision for tenant {db_cliente.db_schema}...")
        try:
            # 1. New schema
            create_tenant_schema(db, db_cliente.db_schema)
            # 2. Base tables
            init_tenant_db(db_cliente.db_schema)
            
            # 3. Seed reference data (Profiles, Menu, Geo)
            seed_reference_data(db, db_cliente.db_schema, source_schema=cliente.source_schema)
            
            # 4. Local admin user
            success = seed_tenant_admin(
                db, 
                db_cliente.db_schema, 
                db_cliente.email_contacto or f"admin@{db_cliente.url_slug}.com",
                f"Administrador {db_cliente.nombre_comercial}"
            )
            if not success:
                raise ValueError("Error al crear el usuario administrador inicial.")

            db.commit()
            print(f"[AUTH] Provision for {db_cliente.db_schema} completed successfully.")
        except ValueError as v:
            db.rollback()
            raise HTTPException(status_code=400, detail=str(v))
        except Exception as e:
            db.rollback()
            print(f"[AUTH] CRITICAL ERROR provisioning {db_cliente.db_schema}: {e}")
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Error al inicializar la base de datos: {str(e)}")
    
    # --- Enviar Correo de Bienvenida ---
    try:
        subject = f"¡Bienvenido a Ikatu Soft! - {db_cliente.nombre_comercial}"
        body = f"""
        Hola {db_cliente.nombre_comercial},
        
        Tu empresa ha sido dada de alta exitosamente en nuestro sistema.
        
        Detalles de acceso:
        - URL: {request.base_url}{db_cliente.url_slug}/login
        - Email: {db_cliente.email_contacto}
        - Contraseña inicial: admin123 (Se te pedirá cambiarla al ingresar).
        
        Ya puedes ingresar y comenzar a configurar tu negocio.
        
        Atentamente,
        El equipo de Ikatu Soft.
        """
        html = f"""
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <h2 style="color: #4f46e5;">¡Bienvenido a Ikatu Soft!</h2>
            <p>Hola <strong>{db_cliente.nombre_comercial}</strong>,</p>
            <p>Tu empresa ha sido dada de alta exitosamente en nuestro sistema de Gestión de Ventas y Logística.</p>
            
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>URL de acceso:</strong> <a href="{request.base_url}{db_cliente.url_slug}/login" style="color: #4f46e5;">{request.base_url}{db_cliente.url_slug}/login</a></p>
                <p style="margin: 5px 0;"><strong>Usuario:</strong> {db_cliente.email_contacto}</p>
                <p style="margin: 5px 0;"><strong>Contraseña inicial:</strong> <code>admin123</code></p>
                <p style="font-size: 0.85em; color: #6b7280; margin-top: 10px;">* Se te pedirá cambiar tu contraseña en el primer inicio de sesión.</p>
            </div>
            
            <p>Ya puedes ingresar y comenzar a operar con tu nueva plataforma.</p>
            
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 0.8em; color: #666;">Este es un mensaje automático, por favor no respondas a este correo.</p>
        </div>
        """
        send_email(
            db, 
            to_email=db_cliente.email_contacto,
            subject=subject,
            body=body,
            html_body=html,
            tenant_id=db_cliente.id,
            logo_url=db_cliente.logo_url
        )
    except Exception as email_err:
        print(f"Error al enviar correo de bienvenida: {email_err}")
    
    log_admin_action(
        db, current_admin.id, "CREATE", "maestro_clientes", db_cliente.id, 
        f"Creada empresa {db_cliente.nombre_comercial} (slug: {slug})", nuevos=cliente.model_dump(), request=request
    )
    
    return db_cliente

@router.get("/maestro-clientes/{cliente_id}", response_model=schemas.MaestroClienteRead)
def get_maestro_cliente(cliente_id: uuid.UUID, db: Session = Depends(get_db), current_admin: models.UsuarioAdmin = Depends(get_current_admin)):
    db_cliente = db.query(models.MaestroCliente).filter(models.MaestroCliente.id == cliente_id).first()
    if not db_cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return db_cliente

@router.get("/maestro-clientes/slug/{slug}", response_model=schemas.MaestroClienteRead)
def get_maestro_cliente_by_slug(slug: str, db: Session = Depends(get_db)):
    # This one remains public for the login page branding
    db_cliente = db.query(models.MaestroCliente).filter(models.MaestroCliente.url_slug == slug.lower()).first()
    if not db_cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return db_cliente

@router.put("/maestro-clientes/{cliente_id}", response_model=schemas.MaestroClienteRead)
def update_maestro_cliente(cliente_id: uuid.UUID, cliente: schemas.MaestroClienteUpdate, request: Request, db: Session = Depends(get_db), current_admin: models.UsuarioAdmin = Depends(get_current_admin)):
    db_cliente = db.query(models.MaestroCliente).filter(models.MaestroCliente.id == cliente_id).first()
    if not db_cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    old_values = { "nombre": db_cliente.nombre_comercial, "estado": db_cliente.estado }
    update_data = cliente.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_cliente, key, value)
    
    db.commit()
    db.refresh(db_cliente)

    log_admin_action(
        db, current_admin.id, "UPDATE", "maestro_clientes", cliente_id, 
        f"Actualizada empresa {db_cliente.nombre_comercial}", anteriores=old_values, nuevos=update_data, request=request
    )
    
    return db_cliente

@router.delete("/maestro-clientes/{cliente_id}")
def delete_maestro_cliente(cliente_id: uuid.UUID, request: Request, db: Session = Depends(get_db), current_admin: models.UsuarioAdmin = Depends(get_current_admin)):
    db_cliente = db.query(models.MaestroCliente).filter(models.MaestroCliente.id == cliente_id).first()
    if not db_cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    client_name = db_cliente.nombre_comercial
    db.delete(db_cliente)
    db.commit()

    log_admin_action(
        db, current_admin.id, "DELETE", "maestro_clientes", cliente_id, 
        f"Eliminada empresa {client_name}", request=request
    )
    
    return {"message": "Cliente maestro eliminado"}

# --- Suscripciones / Monitoreo ---

@router.get("/suscripciones", response_model=List[schemas.SuscripcionRead])
def get_suscripciones(db: Session = Depends(get_db), current_admin: models.UsuarioAdmin = Depends(get_current_admin)):
    return db.query(models.Suscripcion).options(
        joinedload(models.Suscripcion.maestro_cliente),
        joinedload(models.Suscripcion.plan)
    ).all()

@router.post("/suscripciones", response_model=schemas.SuscripcionRead)
def create_suscripcion(susc: schemas.SuscripcionCreate, request: Request, db: Session = Depends(get_db), current_admin: models.UsuarioAdmin = Depends(get_current_admin)):
    db_susc = models.Suscripcion(**susc.model_dump())
    db.add(db_susc)
    db.commit()
    db.refresh(db_susc)

    cliente = db.query(models.MaestroCliente).filter(models.MaestroCliente.id == db_susc.cliente_id).first()
    plan = db.query(models.Plan).filter(models.Plan.id == db_susc.plan_id).first()
    nombre_cliente = cliente.nombre_comercial if cliente else db_susc.cliente_id
    nombre_plan = plan.nombre if plan else str(db_susc.plan_id)

    log_admin_action(
        db, current_admin.id, "CREATE", "suscripciones", db_susc.id, 
        f"Creada suscripción al plan '{nombre_plan}' para cliente '{nombre_cliente}'", nuevos=susc.model_dump(), request=request
    )

    return db_susc

@router.put("/suscripciones/{susc_id}", response_model=schemas.SuscripcionRead)
def update_suscripcion(susc_id: int, susc: schemas.SuscripcionUpdate, request: Request, db: Session = Depends(get_db), current_admin: models.UsuarioAdmin = Depends(get_current_admin)):
    db_susc = db.query(models.Suscripcion).filter(models.Suscripcion.id == susc_id).first()
    if not db_susc:
        raise HTTPException(status_code=404, detail="Suscripción no encontrada")
    
    old_data = {
        "plan_id": db_susc.plan_id,
        "esta_activa": db_susc.esta_activa,
        "fecha_inicio": db_susc.fecha_inicio.isoformat() if db_susc.fecha_inicio else None
    }
    
    update_data = susc.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_susc, key, value)
    
    db.commit()
    db.refresh(db_susc)

    cliente = db.query(models.MaestroCliente).filter(models.MaestroCliente.id == db_susc.cliente_id).first()
    plan = db.query(models.Plan).filter(models.Plan.id == db_susc.plan_id).first()
    nombre_cliente = cliente.nombre_comercial if cliente else db_susc.cliente_id
    nombre_plan = plan.nombre if plan else str(db_susc.plan_id)

    log_admin_action(
        db, current_admin.id, "UPDATE", "suscripciones", susc_id, 
        f"Actualizada suscripción al plan '{nombre_plan}' para cliente '{nombre_cliente}'", anteriores=old_data, nuevos=susc.model_dump(), request=request
    )

    return db_susc

@router.delete("/suscripciones/{susc_id}")
def delete_suscripcion(susc_id: int, request: Request, db: Session = Depends(get_db), current_admin: models.UsuarioAdmin = Depends(get_current_admin)):
    db_susc = db.query(models.Suscripcion).filter(models.Suscripcion.id == susc_id).first()
    if not db_susc:
        raise HTTPException(status_code=404, detail="Suscripción no encontrada")
    
    db.delete(db_susc)
    db.commit()

    cliente = db.query(models.MaestroCliente).filter(models.MaestroCliente.id == db_susc.cliente_id).first()
    plan = db.query(models.Plan).filter(models.Plan.id == db_susc.plan_id).first()
    nombre_cliente = cliente.nombre_comercial if cliente else db_susc.cliente_id
    nombre_plan = plan.nombre if plan else str(db_susc.plan_id)

    log_admin_action(
        db, current_admin.id, "DELETE", "suscripciones", susc_id, 
        f"Eliminada suscripción al plan '{nombre_plan}' para cliente '{nombre_cliente}'", request=request
    )

    return {"message": "Suscripción eliminada"}

# --- Parámetros del Sistema ---

@router.get("/parametros-sistema", response_model=schemas.PaginatedParametrosSistema)
def get_parametros_sistema(
    skip: int = 0,
    limit: int = 10,
    search: str = None,
    tenant: str = None,
    db: Session = Depends(get_db),
    current_admin: models.UsuarioAdmin = Depends(get_current_admin)
):
    query = db.query(models.ParametrosSistema)
    if search:
        query = query.filter(
            (models.ParametrosSistema.par_sis_codigo.ilike(f"%{search}%")) |
            (models.ParametrosSistema.par_sis_descripcion.ilike(f"%{search}%"))
        )
    if tenant:
        query = query.filter(models.ParametrosSistema.par_sis_tenantid == tenant)
    
    total = query.count()
    items = query.order_by(models.ParametrosSistema.par_sis_codigo.asc()).offset(skip).limit(limit).all()
    
    return {"total": total, "items": items}

@router.post("/parametros-sistema", response_model=schemas.ParametrosSistemaResponse)
def create_parametro_sistema(
    request: Request,
    param: schemas.ParametrosSistemaCreate,
    db: Session = Depends(get_db),
    current_admin: models.UsuarioAdmin = Depends(get_current_admin)
):
    codigo_upper = param.par_sis_codigo.upper()
    existing = db.query(models.ParametrosSistema).filter(models.ParametrosSistema.par_sis_codigo == codigo_upper).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un parámetro con este código")
    
    new_param = models.ParametrosSistema(
        par_sis_codigo=codigo_upper,
        par_sis_descripcion=param.par_sis_descripcion,
        par_sis_valor=param.par_sis_valor,
        par_sis_tenantid=param.par_sis_tenantid,
        par_sis_adjunta_archivo=param.par_sis_adjunta_archivo,
        par_sis_usuario_alta=current_admin.username
    )
    db.add(new_param)
    db.commit()
    db.refresh(new_param)

    log_admin_action(
        db, current_admin.id, "CREATE", "parametros_sistema", str(new_param.par_sis_id), 
        f"Creado parámetro de sistema '{new_param.par_sis_codigo}'", request=request
    )

    return new_param

@router.put("/parametros-sistema/{par_id}", response_model=schemas.ParametrosSistemaResponse)
def update_parametro_sistema(
    request: Request,
    par_id: int,
    param: schemas.ParametrosSistemaUpdate,
    db: Session = Depends(get_db),
    current_admin: models.UsuarioAdmin = Depends(get_current_admin)
):
    db_param = db.query(models.ParametrosSistema).filter(models.ParametrosSistema.par_sis_id == par_id).first()
    if not db_param:
        raise HTTPException(status_code=404, detail="Parámetro no encontrado")
    
    if param.par_sis_codigo:
        param.par_sis_codigo = param.par_sis_codigo.upper()
        if param.par_sis_codigo != db_param.par_sis_codigo:
            existing = db.query(models.ParametrosSistema).filter(models.ParametrosSistema.par_sis_codigo == param.par_sis_codigo).first()
            if existing:
                raise HTTPException(status_code=400, detail="El código de parámetro ya está en uso")
    
    old_data = {
        "codigo": db_param.par_sis_codigo,
        "descripcion": db_param.par_sis_descripcion,
        "valor": db_param.par_sis_valor,
        "tenantid": db_param.par_sis_tenantid,
        "adjunta_archivo": db_param.par_sis_adjunta_archivo
    }

    update_data = param.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_param, key, value)
    
    db_param.par_sis_usuario_mod = current_admin.username
    db.commit()
    db.refresh(db_param)

    new_data = {
        "codigo": db_param.par_sis_codigo,
        "descripcion": db_param.par_sis_descripcion,
        "valor": db_param.par_sis_valor,
        "tenantid": db_param.par_sis_tenantid,
        "adjunta_archivo": db_param.par_sis_adjunta_archivo
    }

    log_admin_action(
        db, current_admin.id, "UPDATE", "parametros_sistema", str(db_param.par_sis_id), 
        f"Actualizado parámetro '{db_param.par_sis_codigo}'", anteriores=old_data, nuevos=new_data, request=request
    )

    return db_param

@router.delete("/parametros-sistema/{par_id}")
def delete_parametro_sistema(
    request: Request,
    par_id: int,
    db: Session = Depends(get_db),
    current_admin: models.UsuarioAdmin = Depends(get_current_admin)
):
    db_param = db.query(models.ParametrosSistema).filter(models.ParametrosSistema.par_sis_id == par_id).first()
    if not db_param:
        raise HTTPException(status_code=404, detail="Parámetro no encontrado")
    
    nombre_param = db_param.par_sis_codigo
    db.delete(db_param)
    db.commit()

    log_admin_action(
        db, current_admin.id, "DELETE", "parametros_sistema", str(par_id), 
        f"Eliminado parámetro '{nombre_param}'", request=request
    )

    return {"message": "Parámetro eliminado"}


# --- Restricciones de Campos ---

@router.get("/restricciones-campos", response_model=schemas.PaginatedRestriccionesCampos)
def get_restricciones_campos(
    skip: int = 0,
    limit: int = 10,
    search: str = "",
    tenant: Optional[str] = None,
    db: Session = Depends(get_db),
    current_admin: models.UsuarioAdmin = Depends(get_current_admin)
):
    query = db.query(models.RestriccionCampo)
    if tenant:
        query = query.filter(models.RestriccionCampo.tenant == tenant)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (models.RestriccionCampo.tabla.ilike(search_filter)) |
            (models.RestriccionCampo.columna.ilike(search_filter))
        )
    total = query.count()
    items = query.order_by(models.RestriccionCampo.id.desc()).offset(skip).limit(limit).all()
    return {"total": total, "items": items}

@router.get("/restricciones-campos/tenants")
def get_restricciones_tenants(
    db: Session = Depends(get_db),
    current_admin: models.UsuarioAdmin = Depends(get_current_admin)
):
    from sqlalchemy import text
    try:
        # Get schemas
        schemas_query = db.execute(text("""
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name NOT IN ('public', 'information_schema') 
              AND schema_name NOT LIKE 'pg_%'
        """)).fetchall()
        active_schemas = [r[0] for r in schemas_query]
        
        # Mapeo de maestro_clientes
        mc_query = db.execute(text("""
            SELECT url_slug, db_schema, nombre_comercial 
            FROM public.maestro_clientes 
            WHERE estado = true
        """)).fetchall()
        mc_map = {r[1]: (r[0], r[2]) for r in mc_query}
        
        tenants_info = []
        for schema in active_schemas:
            if schema in mc_map:
                slug, nombre = mc_map[schema]
                tenants_info.append({
                    "schema": schema,
                    "slug": slug,
                    "nombre": nombre or slug
                })
            else:
                tenants_info.append({
                    "schema": schema,
                    "slug": schema,
                    "nombre": schema
                })
        return tenants_info
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener tenants: {str(e)}")

@router.get("/restricciones-campos/tables")
def get_restricciones_tables(
    schema: str,
    db: Session = Depends(get_db),
    current_admin: models.UsuarioAdmin = Depends(get_current_admin)
):
    from sqlalchemy import text
    try:
        # Validate schema to prevent SQL Injection
        schemas_query = db.execute(text("""
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name NOT IN ('public', 'information_schema') 
              AND schema_name NOT LIKE 'pg_%'
        """)).fetchall()
        active_schemas = [r[0] for r in schemas_query]
        
        if schema not in active_schemas and schema != "public":
            raise HTTPException(status_code=400, detail="Esquema inválido")
            
        res = db.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = :schema AND table_type = 'BASE TABLE'
            ORDER BY table_name
        """), {"schema": schema}).fetchall()
        return [r[0] for r in res]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error al obtener tablas: {str(e)}")

@router.get("/restricciones-campos/columns")
def get_restricciones_columns(
    schema: str,
    table: str,
    db: Session = Depends(get_db),
    current_admin: models.UsuarioAdmin = Depends(get_current_admin)
):
    from sqlalchemy import text
    try:
        # Validate schema to prevent SQL Injection
        schemas_query = db.execute(text("""
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name NOT IN ('public', 'information_schema') 
              AND schema_name NOT LIKE 'pg_%'
        """)).fetchall()
        active_schemas = [r[0] for r in schemas_query]
        
        if schema not in active_schemas and schema != "public":
            raise HTTPException(status_code=400, detail="Esquema inválido")
            
        res = db.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = :schema AND table_name = :table
            ORDER BY ordinal_position
        """), {"schema": schema, "table": table}).fetchall()
        return [r[0] for r in res]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error al obtener columnas: {str(e)}")

@router.post("/restricciones-campos", response_model=schemas.RestriccionCampoRead)
def create_restriccion_campo(
    request: Request,
    restriccion: schemas.RestriccionCampoCreate,
    db: Session = Depends(get_db),
    current_admin: models.UsuarioAdmin = Depends(get_current_admin)
):
    existing = db.query(models.RestriccionCampo).filter(
        models.RestriccionCampo.tenant == restriccion.tenant,
        models.RestriccionCampo.tabla == restriccion.tabla,
        models.RestriccionCampo.columna == restriccion.columna
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe una restricción para este campo en este tenant")
        
    db_restriccion = models.RestriccionCampo(**restriccion.model_dump())
    db.add(db_restriccion)
    db.commit()
    db.refresh(db_restriccion)
    
    log_admin_action(
        db, current_admin.id, "CREATE", "restricciones_campos", str(db_restriccion.id),
        f"Creada restricción en tabla '{restriccion.tabla}', columna '{restriccion.columna}' para tenant '{restriccion.tenant}'",
        nuevos=restriccion.model_dump(), request=request
    )
    return db_restriccion

@router.put("/restricciones-campos/{id}", response_model=schemas.RestriccionCampoRead)
def update_restriccion_campo(
    request: Request,
    id: int,
    restriccion: schemas.RestriccionCampoUpdate,
    db: Session = Depends(get_db),
    current_admin: models.UsuarioAdmin = Depends(get_current_admin)
):
    db_restriccion = db.query(models.RestriccionCampo).filter(models.RestriccionCampo.id == id).first()
    if not db_restriccion:
        raise HTTPException(status_code=404, detail="Restricción no encontrada")
        
    old_data = {
        "oculto": db_restriccion.oculto,
        "editable": db_restriccion.editable,
        "tenant": db_restriccion.tenant,
        "tabla": db_restriccion.tabla,
        "columna": db_restriccion.columna
    }
    
    update_data = restriccion.model_dump(exclude_unset=True)
    
    # Check duplicate
    tenant_val = update_data.get("tenant", db_restriccion.tenant)
    tabla_val = update_data.get("tabla", db_restriccion.tabla)
    columna_val = update_data.get("columna", db_restriccion.columna)
    
    existing = db.query(models.RestriccionCampo).filter(
        models.RestriccionCampo.tenant == tenant_val,
        models.RestriccionCampo.tabla == tabla_val,
        models.RestriccionCampo.columna == columna_val,
        models.RestriccionCampo.id != id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe otra restricción para este campo en este tenant")
        
    for key, value in update_data.items():
        setattr(db_restriccion, key, value)
        
    db.commit()
    db.refresh(db_restriccion)
    
    log_admin_action(
        db, current_admin.id, "UPDATE", "restricciones_campos", str(id),
        f"Actualizada restricción en tabla '{db_restriccion.tabla}', columna '{db_restriccion.columna}' para tenant '{db_restriccion.tenant}'",
        anteriores=old_data, nuevos=update_data, request=request
    )
    return db_restriccion

@router.delete("/restricciones-campos/{id}")
def delete_restriccion_campo(
    request: Request,
    id: int,
    db: Session = Depends(get_db),
    current_admin: models.UsuarioAdmin = Depends(get_current_admin)
):
    db_restriccion = db.query(models.RestriccionCampo).filter(models.RestriccionCampo.id == id).first()
    if not db_restriccion:
        raise HTTPException(status_code=404, detail="Restricción no encontrada")
        
    db.delete(db_restriccion)
    db.commit()
    
    log_admin_action(
        db, current_admin.id, "DELETE", "restricciones_campos", str(id),
        f"Eliminada restricción en tabla '{db_restriccion.tabla}', columna '{db_restriccion.columna}' para tenant '{db_restriccion.tenant}'",
        request=request
    )
    return {"status": "success"}

