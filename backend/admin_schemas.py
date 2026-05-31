from pydantic import BaseModel, ConfigDict, field_validator
from datetime import datetime, date
from uuid import UUID
from typing import List, Optional, Any

class PlanBase(BaseModel):
    nombre: str

class PlanCreate(PlanBase):
    pass

class PlanUpdate(BaseModel):
    nombre: Optional[str] = None

class PlanCobroTramoCreate(BaseModel):
    plan_cob_tra_rango_desde: int
    plan_cob_tra_rango_hasta: Optional[int] = None
    plan_cob_tra_monto_por_tramo: float

class PlanCobroTramoUpdate(BaseModel):
    plan_cob_tra_rango_desde: Optional[int] = None
    plan_cob_tra_rango_hasta: Optional[int] = None
    plan_cob_tra_monto_por_tramo: Optional[float] = None

class PlanCobroTramoRead(BaseModel):
    plan_cob_tra_id: int
    plan_cob_tra_rango_desde: int
    plan_cob_tra_rango_hasta: Optional[int]
    plan_cob_tra_monto_por_tramo: float
    model_config = ConfigDict(from_attributes=True)

class PlanCobroCreate(BaseModel):
    plan_cob_tipo_cobro: str
    plan_cob_monto_base: float = 0.00
    plan_cob_activo: bool = True

class PlanCobroUpdate(BaseModel):
    plan_cob_monto_base: Optional[float] = None
    plan_cob_activo: Optional[bool] = None

class PlanCobroRead(BaseModel):
    plan_cob_id: int
    plan_cob_tipo_cobro: str
    plan_cob_monto_base: float
    plan_cob_activo: bool
    tramos: List[PlanCobroTramoRead] = []
    model_config = ConfigDict(from_attributes=True)

class PlanRead(PlanBase):
    id: int
    creado_en: datetime
    cobros: List[PlanCobroRead] = []
    model_config = ConfigDict(from_attributes=True)

# --- Sistemas ---
class SistemaBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None

class SistemaCreate(SistemaBase):
    pass

class SistemaRead(SistemaBase):
    id: int
    creado_en: datetime
    model_config = ConfigDict(from_attributes=True)

class MaestroClienteBase(BaseModel):
    nombre_comercial: str
    ruc: Optional[str] = None
    url_slug: str
    db_schema: str
    email_contacto: str
    estado: bool = True
    sistema_id: Optional[int] = None
    logo_url: Optional[str] = None
    config_json: Optional[Any] = None

class MaestroClienteCreate(MaestroClienteBase):
    # Field to initializae basic tables
    initialize_db: bool = True
    source_schema: str = "public"

class MaestroClienteUpdate(BaseModel):
    nombre_comercial: Optional[str] = None
    ruc: Optional[str] = None
    email_contacto: Optional[str] = None
    estado: Optional[bool] = None
    sistema_id: Optional[int] = None
    logo_url: Optional[str] = None
    config_json: Optional[Any] = None

class MaestroClienteRead(MaestroClienteBase):
    id: UUID
    creado_en: datetime
    sistema: Optional[SistemaRead] = None
    model_config = ConfigDict(from_attributes=True)

class SuscripcionBase(BaseModel):
    cliente_id: UUID
    plan_id: int
    fecha_inicio: date
    esta_activa: bool = True

    @field_validator('fecha_inicio', mode='before')
    @classmethod
    def empty_string_to_none(cls, v):
        if v == "":
            return None
        return v

class SuscripcionCreate(SuscripcionBase):
    pass

class SuscripcionUpdate(BaseModel):
    plan_id: Optional[int] = None
    fecha_inicio: Optional[date] = None
    esta_activa: Optional[bool] = None

    @field_validator('fecha_inicio', mode='before')
    @classmethod
    def empty_string_to_none(cls, v):
        if v == "":
            return None
        return v

class SuscripcionRead(SuscripcionBase):
    id: int
    maestro_cliente: Optional[MaestroClienteRead] = None
    plan: Optional[PlanRead] = None
    model_config = ConfigDict(from_attributes=True)

class AdminLoginRequest(BaseModel):
    username: str
    password: str

class AdminUserRead(BaseModel):
    id: int
    username: str
    nombre: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class AdminLoginResponse(BaseModel):
    token: str
    user: AdminUserRead

class AdminUpdate(BaseModel):
    nombre: Optional[str] = None
    password: Optional[str] = None

class AuditoriaAdminRead(BaseModel):
    id: int
    admin_id: int
    accion: str
    recurso: str
    recurso_id: Optional[str]
    detalle: Optional[str]
    valores_anteriores: Optional[Any]
    valores_nuevos: Optional[Any]
    ip_address: Optional[str]
    fecha: datetime
    admin: Optional[AdminUserRead] = None
    model_config = ConfigDict(from_attributes=True)

# --- Restricciones de Campos ---
class RestriccionCampoBase(BaseModel):
    tabla: str
    columna: str
    oculto: bool = False
    editable: bool = True

class RestriccionCampoCreate(RestriccionCampoBase):
    pass

class RestriccionCampoUpdate(BaseModel):
    oculto: Optional[bool] = None
    editable: Optional[bool] = None

class RestriccionCampoRead(RestriccionCampoBase):
    id: int
    creado_en: datetime
    descripcion_columna: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class TableMetadata(BaseModel):
    name: str

class ColumnMetadata(BaseModel):
    name: str
    description: Optional[str] = None
