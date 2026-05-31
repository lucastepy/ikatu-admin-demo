from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

# --- Actividad Economica ---
class ActividadEconomicaBase(BaseModel):
    act_eco_cod: int
    act_eco_dsc: str

class ActividadEconomicaCreate(ActividadEconomicaBase):
    pass

class ActividadEconomicaUpdate(BaseModel):
    act_eco_cod: Optional[int] = None
    act_eco_dsc: Optional[str] = None

class ActividadEconomicaRead(ActividadEconomicaBase):
    act_eco_usuario_alta: Optional[str] = None
    act_eco_fecha_alta: Optional[datetime] = None
    
    class Config:
        orm_mode = True

# --- Unidad de Medida ---
class UnidadMedidaBase(BaseModel):
    uni_med_cod: int
    uni_med_dsc: str

class UnidadMedidaCreate(UnidadMedidaBase):
    pass

class UnidadMedidaUpdate(BaseModel):
    uni_med_cod: Optional[int] = None
    uni_med_dsc: Optional[str] = None

class UnidadMedidaRead(UnidadMedidaBase):
    uni_med_usuario_alta: Optional[str] = None
    uni_med_fecha_alta: Optional[datetime] = None
    
    class Config:
        orm_mode = True

# --- Forma de Pago ---
class FormaPagoBase(BaseModel):
    forma_pago_id: int
    forma_pago_dsc: str

class FormaPagoCreate(FormaPagoBase):
    pass

class FormaPagoUpdate(BaseModel):
    forma_pago_id: Optional[int] = None
    forma_pago_dsc: Optional[str] = None

class FormaPagoRead(FormaPagoBase):
    forma_pago_usuario_alta: Optional[str] = None
    forma_pago_fecha_alta: Optional[datetime] = None
    
    class Config:
        orm_mode = True


# --- Ubicaciones (Geografia) ---

# Departamentos
class DepartamentoBase(BaseModel):
    dep_cod: int
    dep_dsc: str

class DepartamentoCreate(DepartamentoBase):
    pass

class DepartamentoUpdate(BaseModel):
     dep_dsc: Optional[str] = None

class DepartamentoRead(DepartamentoBase):
    class Config:
        orm_mode = True

# Distritos
class DistritoBase(BaseModel):
    dis_dep_cod: int
    dis_cod: int
    dis_dsc: str

class DistritoCreate(DistritoBase):
    pass

class DistritoUpdate(BaseModel):
    dis_dsc: Optional[str] = None

class DistritoRead(DistritoBase):
    class Config:
        orm_mode = True

# Ciudades
class CiudadBase(BaseModel):
    ciu_dep_cod: int
    ciu_dis_cod: int
    ciu_cod: int
    ciu_dsc: str

class CiudadCreate(CiudadBase):
    pass

class CiudadUpdate(BaseModel):
    ciu_dsc: Optional[str] = None

class CiudadRead(CiudadBase):
    class Config:
        orm_mode = True

# Barrios
class BarrioBase(BaseModel):
    bar_dep_cod: int
    bar_dis_cod: int
    bar_ciu_cod: int
    bar_cod: int
    bar_dsc: str

class BarrioCreate(BarrioBase):
    pass

class BarrioUpdate(BaseModel):
    bar_dsc: Optional[str] = None

class BarrioRead(BarrioBase):
    class Config:
        orm_mode = True
