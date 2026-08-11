from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from database import get_db
import admin_models as models
import integration_schemas as schemas
import os
from typing import Optional
from datetime import date

router = APIRouter(prefix="/api/integration", tags=["Integration API"])

def verify_api_key(x_api_key: str = Header(...)):
    expected_api_key = os.getenv("ADMIN_API_KEY", "ikatu_secret_integration_key_2026")
    if x_api_key != expected_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API Key"
        )
    return x_api_key

@router.get("/tenant/{slug}", response_model=schemas.IntegrationTenantResponse)
def verify_tenant(slug: str, api_key: str = Depends(verify_api_key), db: Session = Depends(get_db)):
    """
    Verify tenant status by slug. 
    Returns basic tenant info, DB schema, and active plan details.
    """
    cliente = db.query(models.MaestroCliente).filter(
        models.MaestroCliente.url_slug == slug.lower()
    ).first()
    
    if not cliente:
        raise HTTPException(status_code=404, detail="Tenant no encontrado")
        
    # Get active subscription plan
    suscripcion = db.query(models.Suscripcion).filter(
        models.Suscripcion.cliente_id == cliente.id,
        models.Suscripcion.esta_activa == True
    ).order_by(models.Suscripcion.fecha_inicio.desc()).first()
    
    plan_data = None
    if suscripcion and suscripcion.plan:
        plan = suscripcion.plan
        plan_data = schemas.IntegrationPlanActivo(
            id=plan.id,
            nombre=plan.nombre,
            limites=None
        )
        
    return schemas.IntegrationTenantResponse(
        id=cliente.id,
        nombre_comercial=cliente.nombre_comercial,
        url_slug=cliente.url_slug,
        db_schema=cliente.db_schema,
        estado=cliente.estado,
        config_json=cliente.config_json,
        plan_activo=plan_data
    )

@router.get("/parametro/{codigo}")
def get_parametro_sistema(
    codigo: str, 
    tenant: str, 
    api_key: str = Depends(verify_api_key), 
    db: Session = Depends(get_db)
):
    """
    Obtiene el valor de un parámetro del sistema.
    Busca primero el parámetro específico del tenant, y si no existe busca el global ('ALL').
    """
    codigo_upper = codigo.upper()
    
    # Buscar primero si existe configuración específica para el tenant
    param = db.query(models.ParametrosSistema).filter(
        models.ParametrosSistema.par_sis_codigo == codigo_upper,
        models.ParametrosSistema.par_sis_tenantid == tenant
    ).first()
    
    # Si no hay específica, buscar la global (ALL)
    if not param:
        param = db.query(models.ParametrosSistema).filter(
            models.ParametrosSistema.par_sis_codigo == codigo_upper,
            models.ParametrosSistema.par_sis_tenantid == 'ALL'
        ).first()
        
    if not param:
        raise HTTPException(status_code=404, detail="Parámetro no encontrado para el tenant")
        
    return {
        "codigo": param.par_sis_codigo,
        "valor": param.par_sis_valor,
        "tenant_aplicado": param.par_sis_tenantid,
        "es_archivo": param.par_sis_adjunta_archivo
    }


@router.get("/restricciones/{tenant}")
def get_restricciones_tenant(
    tenant: str,
    api_key: str = Depends(verify_api_key),
    db: Session = Depends(get_db)
):
    """
    Obtiene todas las restricciones de campos configuradas para un tenant específico.
    Agrupa los resultados por tabla para facilitar el mapeo en el frontend/backend del cliente.
    """
    # Buscamos restricciones para el tenant en la tabla central
    restricciones = db.query(models.RestriccionCampo).filter(
        models.RestriccionCampo.tenant == tenant.lower()
    ).all()
    
    # Estructuramos la respuesta como un diccionario:
    # {
    #   "tabla": {
    #     "columna": { "oculto": bool, "editable": bool }
    #   }
    # }
    result = {}
    for r in restricciones:
        tabla_key = r.tabla.lower()
        col_key = r.columna.lower()
        if tabla_key not in result:
            result[tabla_key] = {}
        result[tabla_key][col_key] = {
            "oculto": r.oculto or False,
            "editable": r.editable if r.editable is not None else True
        }
        
    return result


@router.get("/restricciones/{tenant}/{tabla}")
def get_restricciones_tabla(
    tenant: str,
    tabla: str,
    api_key: str = Depends(verify_api_key),
    db: Session = Depends(get_db)
):
    """
    Obtiene las restricciones de campos configuradas para un tenant y una tabla específica.
    """
    restricciones = db.query(models.RestriccionCampo).filter(
        models.RestriccionCampo.tenant == tenant.lower(),
        models.RestriccionCampo.tabla == tabla.lower()
    ).all()
    
    result = {}
    for r in restricciones:
        col_key = r.columna.lower()
        result[col_key] = {
            "oculto": r.oculto or False,
            "editable": r.editable if r.editable is not None else True
        }
        
    return result

