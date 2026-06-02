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
