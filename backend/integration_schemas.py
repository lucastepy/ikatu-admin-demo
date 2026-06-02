from pydantic import BaseModel
from typing import Optional
import uuid

class IntegrationPlanActivo(BaseModel):
    id: int
    nombre: str
    limites: Optional[dict] = None

class IntegrationTenantResponse(BaseModel):
    id: uuid.UUID
    nombre_comercial: str
    url_slug: str
    db_schema: str
    estado: bool
    config_json: Optional[dict] = None
    plan_activo: Optional[IntegrationPlanActivo] = None
