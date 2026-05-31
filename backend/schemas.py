from typing import List, Optional, Union, Any, Dict
from pydantic import BaseModel, field_validator
from datetime import date, datetime
from decimal import Decimal


# --- Base Schemas ---
class UnidadMedidaRead(BaseModel):
    uni_med_cod: int
    uni_med_dsc: str
    class Config:
        from_attributes = True

class CategoriaBase(BaseModel):
    cat_nombre: str
    cat_prefijo: Optional[str] = None
    cat_numerador: Optional[int] = 0
    cat_tenantId: int = 1

class CategoriaCreate(CategoriaBase):
    pass

class CategoriaUpdate(BaseModel):
    cat_nombre: Optional[str] = None
    cat_prefijo: Optional[str] = None
    cat_numerador: Optional[int] = None

class CategoriaRead(CategoriaBase):
    cat_id: int
    class Config:
        from_attributes = True

class MarcaBase(BaseModel):
    marca_nombre: str
    marca_tenantId: int = 1

class MarcaCreate(MarcaBase):
    pass

class MarcaUpdate(BaseModel):
    marca_nombre: Optional[str] = None

class MarcaRead(MarcaBase):
    marca_id: int
    class Config:
        from_attributes = True

class ProductoBase(BaseModel):
    prod_codigo: str
    prod_nombre: str
    prod_marca_id: Optional[int] = None
    prod_categoria_id: Optional[int] = None
    prod_precio_costo: Optional[float] = 0
    prod_precio_contado: Optional[float] = 0
    # prod_precio_lista: Optional[float] = 0 # REMOVED
    prod_stock_actual: Optional[int] = 0
    prod_imagen_url: Optional[str] = None
    prod_uni_med: Optional[int] = None
    prod_peso_kg: Optional[float] = 0
    prod_tenantId: int = 1

class ProductoCreate(ProductoBase):
    pass

class ProductoUpdate(BaseModel):
    prod_codigo: Optional[str] = None
    prod_nombre: Optional[str] = None
    prod_precio_costo: Optional[float] = None
    prod_precio_contado: Optional[float] = None
    prod_stock_actual: Optional[int] = None
    prod_peso_kg: Optional[float] = None
    prod_imagen_url: Optional[str] = None
    prod_categoria_id: Optional[int] = None
    prod_marca_id: Optional[int] = None
    prod_uni_med: Optional[int] = None

class ProductoRead(ProductoBase):
    prod_id: int
    categoria: Optional[CategoriaRead] = None
    marca: Optional[MarcaRead] = None
    uni_medida: Optional[UnidadMedidaRead] = None
    
    class Config:
        from_attributes = True

# --- Tipo Proveedor ---
class TipoProveedorBase(BaseModel):
    tipo_prov_nombre: str

class TipoProveedorCreate(TipoProveedorBase):
    tipo_prov_usr_usuario_alta: str

class TipoProveedorUpdate(BaseModel):
    tipo_prov_nombre: Optional[str] = None
    tipo_prov_usr_usuario_mod: Optional[str] = None

class TipoProveedorRead(TipoProveedorBase):
    tipo_prov_id: int
    tipo_prov_usr_usuario_alta: Optional[str] = None
    tipo_prov_usr_fecha_alta: Optional[datetime] = None
    tipo_prov_usr_usuario_mod: Optional[str] = None
    tipo_prov_usr_fecha_mod: Optional[datetime] = None
    class Config:
        from_attributes = True

# --- Tipo Gasto ---
class TipoGastoBase(BaseModel):
    tip_gas_dsc: str

class TipoGastoCreate(TipoGastoBase):
    tip_gas_usuario_alta: str

class TipoGastoUpdate(BaseModel):
    tip_gas_dsc: Optional[str] = None
    tip_gas_usuario_mod: Optional[str] = None

class TipoGastoRead(TipoGastoBase):
    tip_gas_id: int
    tip_gas_usuario_alta: str
    tip_gas_fecha_alta: Optional[datetime] = None
    tip_gas_usuario_mod: Optional[str] = None
    tip_gas_fecha_mod: Optional[datetime] = None
    class Config:
        from_attributes = True

# --- Gasto por Periodo ---
class GastoPorPeriodoBase(BaseModel):
    gas_per_anio: int
    gas_per_mes: int
    gas_per_tip_gas_id: int
    gas_per_monto: float

class GastoPorPeriodoCreate(GastoPorPeriodoBase):
    gas_per_usuario_alta: str

class GastoPorPeriodoUpdate(BaseModel):
    gas_per_monto: float
    gas_per_usuario_mod: Optional[str] = None

class GastoPorPeriodoRead(GastoPorPeriodoBase):
    gas_per_usuario_alta: str
    gas_per_fecha_alta: Optional[datetime] = None
    gas_per_usuario_mod: Optional[str] = None
    gas_per_fecha_mod: Optional[datetime] = None
    tipo_gasto: Optional[TipoGastoRead] = None
    class Config:
        from_attributes = True

# --- Suppliers ---
class ProveedorBase(BaseModel):
    prov_nombre: str
    prov_ruc: Optional[str] = None
    prov_razon_social: Optional[str] = None
    prov_direccion: Optional[str] = None
    prov_dep: Optional[int] = None
    prov_dis: Optional[int] = None
    prov_ciu: Optional[int] = None
    prov_telefono: Optional[str] = None
    prov_email: Optional[str] = None
    prov_contacto: Optional[str] = None
    prov_estado: Optional[str] = 'A'
    prov_tenantId: int = 1
    prov_tipo_prov_id: Optional[int] = None

class ProveedorCreate(ProveedorBase):
    pass

class ProveedorUpdate(BaseModel):
    prov_nombre: Optional[str] = None
    prov_ruc: Optional[str] = None
    prov_razon_social: Optional[str] = None
    prov_direccion: Optional[str] = None
    prov_dep: Optional[int] = None
    prov_dis: Optional[int] = None
    prov_ciu: Optional[int] = None
    prov_telefono: Optional[str] = None
    prov_email: Optional[str] = None
    prov_contacto: Optional[str] = None
    prov_estado: Optional[str] = None
    prov_tipo_prov_id: Optional[int] = None

class ProveedorRead(ProveedorBase):
    prov_id: int
    tipo_proveedor: Optional[TipoProveedorRead] = None
    class Config:
        from_attributes = True


# --- Purchases & Stock Movements ---
class CompraDetalleBase(BaseModel):
    cdet_prod_id: int
    cdet_cantidad: int
    cdet_precio_unitario: float
    cdet_subtotal: float
    cdet_lote: Optional[str] = None
    cdet_vto: Optional[date] = None
    cdet_re: Optional[str] = None
    cdet_rspa: Optional[str] = None
    cdet_integridad: Optional[str] = 'OP'
    cdet_envase: Optional[str] = 'OP'
    cdet_usu_res: Optional[str] = None

class CompraDetalleCreate(CompraDetalleBase):
    pass

class CompraDetalleRead(CompraDetalleBase):
    cdet_id: int
    cdet_comp_id: int
    prod_nombre: Optional[str] = None
    prod_codigo: Optional[str] = None
    class Config:
        from_attributes = True

class CompraBase(BaseModel):
    comp_prov_id: int
    comp_nro_factura: Optional[str] = None
    comp_fecha: Optional[datetime] = None
    comp_total: float
    comp_estado: Optional[str] = 'A'
    comp_tip_fac: Optional[str] = 'CO'

class CompraCreate(CompraBase):
    detalles: List[CompraDetalleCreate]

class CompraRead(CompraBase):
    comp_id: int
    detalles: List[CompraDetalleRead]
    comp_usuario_alta: Optional[str] = None
    prov_nombre: Optional[str] = None
    class Config:
        from_attributes = True

class MovimientoStockBase(BaseModel):
    mov_prod_id: int
    mov_prov_id: Optional[int] = None
    mov_tipo: str # E, S, A
    mov_cantidad: int
    mov_referencia: Optional[str] = None
    mov_stock_anterior: int
    mov_stock_actual: int
    mov_fecha: Optional[datetime] = None

class MovimientoStockRead(MovimientoStockBase):
    mov_id: int
    # Helpers
    prod_nombre: Optional[str] = None
    prod_codigo: Optional[str] = None
    prov_nombre: Optional[str] = None
    
    class Config:
        from_attributes = True

# --- Debt/Cuotas ---
class CuotaRead(BaseModel):
    cuota_id: int
    cuota_numero: int
    cuota_vencimiento: date
    cuota_monto_total: float
    cuota_saldo: float
    cuota_estado: str
    cuota_dias_atraso_calculado: Optional[int] = 0
    cuota_recargo_mora: Optional[float] = 0
    cuota_ventaId: int
    
    # Virtual fields for frontend convenience
    cuota_total_cuotas: Optional[int] = 0
    sucursal_nombre: Optional[str] = None
    venta_fecha: Optional[datetime] = None
    venta_condicion: Optional[str] = None
    
    class Config:
        from_attributes = True

# --- Clients ---
class ClienteBase(BaseModel):
    cli_documento: str
    cli_nombre: str
    cli_ruc: Optional[str] = None
    cli_razon_social: Optional[str] = None
    cli_telefono: Optional[str] = None
    cli_email: Optional[str] = None
    cli_direccion: Optional[str] = None
    cli_dep: Optional[Union[int, str]] = None
    cli_dis: Optional[Union[int, str]] = None
    cli_ciu: Optional[Union[int, str]] = None
    cli_bar: Optional[Union[int, str]] = None
    cli_tipo: Optional[str] = 'F'
    cli_nro_casa: Optional[Union[int, str]] = None
    cli_geo: Optional[str] = None
    cli_tenantId: int = 1

class ClienteCreate(ClienteBase):
    pass

class ClienteUpdate(BaseModel):
    cli_nombre: Optional[str] = None
    cli_ruc: Optional[str] = None
    cli_razon_social: Optional[str] = None
    cli_telefono: Optional[str] = None
    cli_email: Optional[str] = None
    cli_direccion: Optional[str] = None
    cli_dep: Optional[Union[int, str]] = None
    cli_dis: Optional[Union[int, str]] = None
    cli_ciu: Optional[Union[int, str]] = None
    cli_bar: Optional[Union[int, str]] = None
    cli_tipo: Optional[str] = None
    cli_nro_casa: Optional[Union[int, str]] = None
    cli_geo: Optional[str] = None

class ClienteRead(ClienteBase):
    cli_fecha_creacion: Optional[datetime] = None
    class Config:
        from_attributes = True

# --- Sales Schemas ---
class PagoMetodoCreate(BaseModel):
    met_tipo: str
    met_monto: float
    met_entidadId: Optional[int] = None
    met_referencia: Optional[str] = None

class VentaDetalleCreate(BaseModel):
    det_prodId: int
    det_cantidad: int
    det_precio_unitario: float
    det_subtotal: float

class VentaCreate(BaseModel):
    venta_clienteDoc: Optional[str] = None
    venta_condicion: str
    venta_total: float
    venta_entrega_inicial: float = 0
    venta_saldo_financiar: float = 0
    venta_vendedorId: int = 1
    venta_redondeo: float = 0
    venta_descuento: float = 0
    
    detalles: List[VentaDetalleCreate]
    detalle_cuotas: Optional[List[dict]] = None # For creating installments
    metodos: Optional[List[PagoMetodoCreate]] = None
    pago_sesionId: Optional[int] = None
    venta_requiere_factura: bool = True
    venta_solicita_ticket: bool = False

class VentaDetalleRead(BaseModel):
    det_id: int
    det_cantidad: int
    det_precio_unitario: float
    det_subtotal: float
    producto: ProductoRead
    class Config:
        from_attributes = True

class VentaUpdate(BaseModel):
    venta_estado: Optional[str] = None
    return_stock: bool = False

class VentaRead(BaseModel):
    venta_id: int
    venta_fecha: datetime
    venta_clienteDoc: Optional[str]
    venta_condicion: Optional[str] = None
    venta_total: float
    venta_entrega_inicial: float = 0
    venta_saldo_financiar: float = 0
    venta_redondeo: float = 0
    venta_descuento: float = 0
    venta_estado: str
    venta_numero_oficial: Optional[str] = None
    venta_cdc: Optional[str] = None
    venta_requiere_factura: bool = True
    venta_solicita_ticket: bool = False
    detalles: List[VentaDetalleRead] = []
    cuotas: List[CuotaRead] = []
    cliente: Optional[ClienteRead] = None
    class Config:
        from_attributes = True

# --- Initial Balance (Migración) ---
class InitialBalanceCuota(BaseModel):
    number: int
    amount: float
    due_date: date

class InitialBalanceCreate(BaseModel):
    client_doc: str
    total_amount: float
    cuotas: List[InitialBalanceCuota]
    observation: Optional[str] = "SALDO INICIAL - MIGRACIÓN"

class ClienteMobileRead(BaseModel):
    nro_documento: str
    nombre: str
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    ruc: Optional[str] = None
    razon_social: Optional[str] = None
    departamento: Optional[Union[int, str]] = None
    distrito: Optional[Union[int, str]] = None
    ciudad: Optional[Union[int, str]] = None
    barrio: Optional[Union[int, str]] = None
    nro_casa: Optional[Union[int, str]] = None
    geo: Optional[str] = None

    class Config:
        from_attributes = True

# --- Holidays ---
class FeriadoBase(BaseModel):
    feriado_anho: int
    feriado_fecha: date
    feriado_dsc: Optional[str] = None
    feriado_estado: str = 'A'
    feriado_tenantId: int = 1

class FeriadoCreate(FeriadoBase):
    pass

class FeriadoUpdate(BaseModel):
    feriado_dsc: Optional[str] = None
    feriado_estado: Optional[str] = None

class FeriadoRead(FeriadoBase):
    class Config:
        from_attributes = True

# --- Parameters ---
class ParametroBase(BaseModel):
    par_codigo: str
    par_descripcion: str
    par_valor: str
    par_tenantId: int = 1

class ParametroCreate(ParametroBase):
    pass

class ParametroUpdate(BaseModel):
    par_descripcion: Optional[str] = None
    par_valor: Optional[str] = None

class ParametroRead(ParametroBase):
    par_id: int
    class Config:
        from_attributes = True

# --- Financial Config ---
class PoliticaCreditoBase(BaseModel):
    pol_tasa_moratoria_diaria: float
    pol_tasa_punitoria_diaria: float
    pol_dias_gracia: int
    pol_iva_intereses: float
    pol_interes_mensual_tasa: float

class PoliticaCreditoUpdate(BaseModel):
    pol_tasa_moratoria_diaria: Optional[float] = None
    pol_tasa_punitoria_diaria: Optional[float] = None
    pol_dias_gracia: Optional[int] = None
    pol_iva_intereses: Optional[float] = None
    pol_interes_mensual_tasa: Optional[float] = None

class PoliticaCreditoRead(PoliticaCreditoBase):
    pol_id: int
    class Config:
        from_attributes = True

# --- Payments ---


class PagoCreate(BaseModel):
    pago_clienteDoc: str
    pago_monto_total: float
    pago_sesionId: int = 1 # Mock session
    pago_observacion: str = ""
    pago_requiere_factura: bool = False
    pago_solicita_ticket: bool = False
    pago_afectar_siguiente: bool = False
    pago_cuotas_seleccionadas: Optional[List[int]] = None
    pago_es_cancelacion_anticipada: bool = False
    pago_descuento_anticipado: float = 0
    metodos: List[PagoMetodoCreate]

class EntidadFinancieraBase(BaseModel):
    ent_nombre: str
    ent_tipo: Optional[str] = None
    ent_activo: Optional[bool] = True

class EntidadFinancieraCreate(EntidadFinancieraBase):
    pass

class EntidadFinancieraRead(EntidadFinancieraBase):
    ent_id: int
    class Config:
        from_attributes = True

class CuentaBancariaBase(BaseModel):
    cuentas_bancarias_ent_id: int
    cuentas_bancarias_nro_cuenta: str

class CuentaBancariaCreate(CuentaBancariaBase):
    pass

class CuentaBancariaRead(CuentaBancariaBase):
    usuario_alta: Optional[str] = None
    fecha_alta: Optional[datetime] = None
    usuario_mod: Optional[str] = None
    fecha_mod: Optional[datetime] = None
    tenant_id: Optional[int] = None
    entidad: Optional[EntidadFinancieraRead] = None
    class Config:
        from_attributes = True

class PagoImputacionRead(BaseModel):
    imp_id: int
    imp_monto_capital: float
    imp_monto_interes: float
    imp_monto_mora: float
    cuota: Optional[CuotaRead] = None

    class Config:
        from_attributes = True

class PagoRead(BaseModel):
    pago_id: int
    pago_nro_recibo: str
    pago_monto_total: float
    pago_fecha: datetime
    facturas: List['FacturaRead'] = []
    imputaciones: List[PagoImputacionRead] = []
    class Config:
        from_attributes = True

# --- Cash Registers (Cajas) ---
class CajaBase(BaseModel):
    caja_dsc: str
    caja_estado: str = 'A'
    caja_sucursal: int = 1
    caja_tenantId: int = 1

class CajaCreate(CajaBase):
    pass

class CajaUpdate(BaseModel):
    caja_dsc: Optional[str] = None
    caja_estado: Optional[str] = None
    caja_sucursal: Optional[int] = None

class CajaRead(CajaBase):
    caja_cod: int
    caja_fecha_creacion: Optional[datetime] = None
    caja_usuario_creacion: Optional[str] = None
    caja_fecha_modificacion: Optional[datetime] = None
    caja_usuario_modificacion: Optional[str] = None
    
    class Config:
        from_attributes = True

# --- Cash Register Session Schemas ---
class CajaSesionBase(BaseModel):
    sesion_monto_inicial: float
    sesion_observaciones: Optional[str] = None
    sesion_tenantId: int = 1
    sesion_cajaId: Optional[int] = None
    sesion_sucursal: Optional[int] = 1 # Added branch context

class CajaSesionCreate(CajaSesionBase):
    pass

class CajaSesionClose(BaseModel):
    sesion_monto_final: float
    sesion_observaciones: Optional[str] = None

class CajaSesionRead(BaseModel):
    sesion_id: int
    sesion_usuario_email: str
    sesion_usuario_nombre: Optional[str] = None
    sesion_usuario_cierre_nombre: Optional[str] = None
    sesion_cajaId: Optional[int] = None
    sesion_sucursal: Optional[int] = None
    sesion_fecha_apertura: datetime
    sesion_fecha_cierre: Optional[datetime] = None
    sesion_monto_inicial: float
    sesion_monto_final: Optional[float] = None
    sesion_estado: str
    
    # Audit & Totals
    sesion_usuario_cierre: Optional[str] = None
    sesion_total_efectivo: Optional[float] = 0
    sesion_cnt_efectivo: Optional[int] = 0
    sesion_total_tarjeta: Optional[float] = 0
    sesion_cnt_tarjeta: Optional[int] = 0
    sesion_total_transferencia: Optional[float] = 0
    sesion_cnt_transferencia: Optional[int] = 0
    sesion_total_otros: Optional[float] = 0
    sesion_cnt_otros: Optional[int] = 0
    
    caja: Optional[CajaRead] = None

    class Config:
        from_attributes = True

# --- AUTH SCHEMAS ---
class LoginRequest(BaseModel):
    email: str
    password: str

class ChangePasswordRequest(BaseModel):
    email: str
    currentPassword: Optional[str] = None
    newPassword: str

class MenuDetalleRead(BaseModel):
    menu_det_cod: int
    menu_det_nombre: str
    menu_det_url: Optional[str] = None
    menu_det_icono: Optional[str] = None
    menu_det_cod_padre: Optional[int] = None
    menu_det_det_orden: Optional[int] = 0
    menu_det_estado: str = 'A'
    class Config:
        from_attributes = True

class MenuRead(BaseModel):
    menu_cod: int
    menu_nombre: str
    detalles: List[MenuDetalleRead] = []
    class Config:
        from_attributes = True

class MenuCreate(BaseModel):
    menu_nombre: str

class MenuUpdate(BaseModel):
    menu_nombre: str

class MenuDetalleCreate(BaseModel):
    menu_cod: int # Parent Menu ID
    menu_det_nombre: str
    menu_det_url: Optional[str] = None
    menu_det_icono: Optional[str] = None
    menu_det_cod_padre: Optional[int] = None
    menu_det_det_orden: int = 0
    menu_det_estado: str = 'A'

class MenuDetalleUpdate(BaseModel):
    menu_det_nombre: Optional[str] = None
    menu_det_url: Optional[str] = None
    menu_det_icono: Optional[str] = None
    menu_det_cod_padre: Optional[int] = None
    menu_det_det_orden: Optional[int] = None
    menu_det_estado: Optional[str] = None
    menu_cod: Optional[int] = None



class PerfilBase(BaseModel):
    perfil_cod: int
    perfil_nombre: str
    menu: Optional[MenuRead]
    class Config:
        from_attributes = True

class PerfilRead(BaseModel):
    perfil_cod: int
    perfil_nombre: str
    menu: Optional[MenuRead]
    class Config:
        from_attributes = True

class PerfilCreate(BaseModel):
    perfil_nombre: str
    menu_cod: int

class PerfilUpdate(BaseModel):
    perfil_nombre: Optional[str] = None
    menu_cod: Optional[int] = None

class UserRead(BaseModel):
    usuario_email: str
    usuario_nombre: str
    usuario_estado: str
    usuario_sucursal: int
    usuario_tenantId: int
    usuario_primer_ingreso: bool
    
    perfil: Optional[PerfilRead]
    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    usuario_email: str
    usuario_nombre: str
    usuario_password: Optional[str] = None
    perfil_cod: int
    usuario_sucursal: int = 1
    usuario_estado: str = 'A'
    usuario_tenantId: int = 1
    usuario_imagen_url: Optional[str] = None

class UserUpdate(BaseModel):
    usuario_nombre: Optional[str] = None
    usuario_password: Optional[str] = None
    perfil_cod: Optional[int] = None
    usuario_sucursal: Optional[int] = None

    usuario_estado: Optional[str] = None
    usuario_imagen_url: Optional[str] = None

class LoginResponse(BaseModel):
    user: UserRead
    token: str
    requirePasswordChange: bool
    usuario_primer_ingreso: bool

class ResetPasswordRequest(BaseModel):
    email: str
    new_password: str

class MessageResponse(BaseModel):
    message: str

class MenuItem(BaseModel):
    cod_detalle: int
    nombre: str
    url: Optional[str] = None
    icono: Optional[str] = None
    children: List['MenuItem'] = [] # Forward Ref
    
    class Config:
        from_attributes = True

MenuItem.model_rebuild() # Pydantic v2 uses model_rebuild() instead of update_forward_refs()

# --- Sucursal Schemas ---
class SucursalBase(BaseModel):
    suc_nombre: str
    suc_direccion: Optional[str] = None
    suc_telefono: Optional[str] = None
    suc_estado: str = 'A'
    suc_tenantId: int = 1

class SucursalCreate(SucursalBase):
    pass

class SucursalUpdate(BaseModel):
    suc_nombre: Optional[str] = None
    suc_direccion: Optional[str] = None
    suc_telefono: Optional[str] = None
    suc_estado: Optional[str] = None

class SucursalRead(SucursalBase):
    suc_id: int
    class Config:
        from_attributes = True

# --- Email Log Schemas ---
class EmailLogBase(BaseModel):
    log_destinatario: str
    log_asunto: str
    log_cuerpo: Optional[str] = None
    log_estado: str = 'PENDIENTE'
    log_error: Optional[str] = None
    log_tenantId: int = 1

class EmailLogCreate(EmailLogBase):
    pass

class EmailLogRead(EmailLogBase):
    log_id: int
    log_fecha: datetime
    class Config:
        from_attributes = True

# --- Empresa Schemas ---
class EmpresaBase(BaseModel):
    empresa_nom: Optional[str] = None
    empresa_ruc: Optional[str] = None
    empresa_estado: Optional[str] = 'A'
    empresa_act_eco: Optional[int] = None
    empresa_dep: Optional[int] = None
    empresa_dis: Optional[int] = None
    empresa_ciu: Optional[int] = None
    empresa_bar: Optional[int] = None
    empresa_nom_fan: Optional[str] = None
    empresa_mail: Optional[str] = None
    empresa_dir: Optional[str] = None
    empresa_tel: Optional[str] = None
    empresa_propietario: Optional[str] = None

class EmpresaUpdate(EmpresaBase):
    pass

class EmpresaRead(EmpresaBase):
    empresa_cod: int
    class Config:
        from_attributes = True

# --- INVOICING / BILLING SCHEMAS ---

# Establecimiento
class EstablecimientoBase(BaseModel):
    estab_nombre: str
    estab_direccion: Optional[str] = None
    
class EstablecimientoCreate(EstablecimientoBase):
    estab_codigo: int # Often manually assigned or fetched sequentially
    pass

class EstablecimientoRead(EstablecimientoBase):
    estab_codigo: int
    estab_fecha_alta: Optional[datetime] = None
    class Config:
        from_attributes = True


class EstablecimientoUpdate(BaseModel):
    estab_nombre: Optional[str] = None
    estab_direccion: Optional[str] = None

# Punto Expedicion
class PuntoExpedicionBase(BaseModel):
    punto_descripcion: Optional[str] = None

class PuntoExpedicionCreate(PuntoExpedicionBase):
    estab_codigo: int
    punto_codigo: int
    pass

class PuntoExpedicionUpdate(BaseModel):
    punto_descripcion: Optional[str] = None

class PuntoExpedicionRead(PuntoExpedicionBase):
    estab_codigo: int
    punto_codigo: int
    estab_nombre: Optional[str] = None # Optional enrichment
    
    class Config:
        from_attributes = True

# Timbrado
class TimbradoBase(BaseModel):
    timbrado_numero: int
    timbrado_nro_desde: str
    timbrado_nro_hasta: str
    timbrado_nro_actual: str
    timbrado_fecha_vencimiento: date
    timbrado_estado: str = 'A'

class TimbradoCreate(TimbradoBase):
    pass

class TimbradoUpdate(BaseModel):
    timbrado_fecha_vencimiento: Optional[date] = None
    timbrado_nro_actual: Optional[str] = None
    timbrado_estado: Optional[str] = None

class TimbradoRead(TimbradoBase):
    timbrado_fecha_alta: Optional[datetime] = None
    class Config:
        from_attributes = True

# Factura Detalle
class FacturaDetalleBase(BaseModel):
    facdet_concepto: str
    facdet_cantidad: int = 1
    facdet_precio_unitario: float
    facdet_subtotal: float
    facdet_iva: float
    facdet_total: float

class FacturaDetalleCreate(FacturaDetalleBase):
    facdet_linea: int # Line number

class FacturaDetalleRead(FacturaDetalleBase):
    estab_codigo: int
    punto_codigo: int
    factura_numero: str
    facdet_linea: int
    class Config:
        from_attributes = True

# Factura
class FacturaBase(BaseModel):
    factura_ruc_receptor: Optional[str] = None
    factura_nombre_receptor: Optional[str] = None
    factura_total: float
    factura_total_letras: Optional[str] = None
    factura_estado: str = 'emitida'

class FacturaCreate(FacturaBase):
    estab_codigo: int
    punto_codigo: int
    factura_numero: str # "001-001-0000123" format usually split or as whole? Model splits it in composite keys? 
                        # In Model: `factura_numero` is implicitly the sequence number (7 chars).
    timbrado_numero: int
    pago_id: Optional[int] = None
    detalles: List[FacturaDetalleCreate]

class FacturaRead(FacturaBase):
    estab_codigo: int
    punto_codigo: int
    factura_numero: str
    timbrado_numero: int
    factura_fecha_emision: date
    detalles: List[FacturaDetalleRead] = []
    class Config:
        from_attributes = True

# Ticket
class TicketDetalleBase(BaseModel):
    ticket_concepto: str
    ticket_cantidad: int = 1
    ticket_precio_unitario: float
    ticket_subtotal: float
    ticket_total: float

class TicketDetalleCreate(TicketDetalleBase):
    ticket_linea: int

class TicketDetalleRead(TicketDetalleBase):
    ticket_numero: str
    ticket_linea: int
    class Config:
        from_attributes = True

class TicketBase(BaseModel):
    ticket_nombre_receptor: Optional[str] = None
    ticket_total: float
    ticket_estado: str = 'emitido'

class TicketCreate(TicketBase):
    ticket_numero: str # Generated
    pago_id: Optional[int] = None
    detalles: List[TicketDetalleCreate]

class TicketRead(TicketBase):
    ticket_numero: str
    ticket_fecha_emision: datetime
    pago_id: Optional[int] = None
    detalles: List[TicketDetalleRead] = []
    class Config:
        from_attributes = True


# --- New Tables (2025-02-05) ---

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
        from_attributes = True

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
        from_attributes = True

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
        from_attributes = True


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
        from_attributes = True

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
        from_attributes = True

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
        from_attributes = True

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
        from_attributes = True

# --- Centros de Entrega ---
class CentroEntregaBase(BaseModel):
    centro_nombre: str
    centro_tipo: Optional[str] = None
    centro_direccion: Optional[str] = None
    centro_referencia: Optional[str] = None
    centro_geo: Optional[str] = None
    centro_dep: Optional[int] = None
    centro_dis: Optional[int] = None
    centro_ciu: Optional[int] = None
    centro_telefono: Optional[str] = None
    centro_contacto_email: Optional[str] = None
    centro_horario_recepcion: Optional[str] = None
    centro_cant_beneficiarios: Optional[int] = None
    centro_estado: Optional[str] = 'A'
    centro_tipo_comida: Optional[str] = None
    centro_tenantId: int = 1

class CentroEntregaCreate(CentroEntregaBase):
    pass

class CentroEntregaUpdate(BaseModel):
    centro_nombre: Optional[str] = None
    centro_tipo: Optional[str] = None
    centro_tipo_comida: Optional[str] = None
    centro_direccion: Optional[str] = None
    centro_referencia: Optional[str] = None
    centro_geo: Optional[str] = None
    centro_dep: Optional[int] = None
    centro_dis: Optional[int] = None
    centro_ciu: Optional[int] = None
    centro_telefono: Optional[str] = None
    centro_contacto_email: Optional[str] = None
    centro_horario_recepcion: Optional[str] = None
    centro_cant_beneficiarios: Optional[int] = None
    centro_estado: Optional[str] = None

class CentroEntregaRead(CentroEntregaBase):
    centro_id: int
    contacto_nombre: Optional[str] = None  # enriched: usuario_contacto.usuario_nombre
    contacto_email: Optional[str] = None   # enriched alias
    departamento_nombre: Optional[str] = None
    distrito_nombre: Optional[str] = None

    centro_usuario_alta: Optional[str] = None
    centro_fecha_alta: Optional[datetime] = None
    centro_usuario_mod: Optional[str] = None
    centro_fecha_mod: Optional[datetime] = None

    class Config:
        from_attributes = True
        
# --- Inventario Centros de Entrega ---
class CentroEntregaInventarioBase(BaseModel):
    inv_centro_id: int
    inv_prod_id: int
    inv_stock_actual: float = 0
    inv_stock_minimo: float = 0
    inv_tenantId: int = 1

class CentroEntregaInventarioCreate(CentroEntregaInventarioBase):
    pass

class CentroEntregaInventarioUpdate(BaseModel):
    inv_stock_actual: Optional[float] = None
    inv_stock_minimo: Optional[float] = None

class CentroEntregaInventarioRead(CentroEntregaInventarioBase):
    inv_id: int
    prod_nombre: Optional[str] = None
    prod_codigo: Optional[str] = None
    producto: Optional[ProductoRead] = None
    inv_fecha_mod: Optional[datetime] = None
    
    class Config:
        from_attributes = True



# --- Cuotas Habilitadas ---
class CuotaHabilitadaBase(BaseModel):
    cuo_hab_cuo: int
    cuo_hab_por_recargo: Optional[float] = 0
    cuo_hab_tenantid: int = 1

class CuotaHabilitadaCreate(CuotaHabilitadaBase):
    pass

class CuotaHabilitadaUpdate(BaseModel):
    cuo_hab_cuo: Optional[int] = None
    cuo_hab_por_recargo: Optional[float] = None

class CuotaHabilitadaRead(CuotaHabilitadaBase):
    cuo_hab_cod: int
    cuo_hab_usuario_alta: str
    cuo_hab_fecha_alta: datetime
    cuo_hab_usuario_mod: Optional[str] = None
    cuo_hab_fecha_mod: Optional[datetime] = None

    class Config:
        from_attributes = True

CuotaHabilitadaRead.model_rebuild()
PagoRead.model_rebuild()

# --- Personal de Entrega ---
class PersonalEntregaBase(BaseModel):
    personal_documento: str
    personal_nombre: str
    personal_rol: int = 1               # 1=Chofer, 2=Acompañante
    personal_licencia: Optional[str] = None
    personal_cat_licencia: Optional[str] = None
    personal_vto_licencia: Optional[date] = None
    personal_telefono: Optional[str] = None
    personal_direccion: Optional[str] = None
    personal_estado: Optional[str] = 'A'
    personal_tenantId: int = 1

    @field_validator('personal_vto_licencia', mode='before')
    @classmethod
    def empty_string_to_none(cls, v):
        if v == "":
            return None
        return v

class PersonalEntregaCreate(PersonalEntregaBase):
    pass

class PersonalEntregaUpdate(BaseModel):
    personal_nombre: Optional[str] = None
    personal_rol: Optional[int] = None
    personal_licencia: Optional[str] = None
    personal_cat_licencia: Optional[str] = None
    personal_vto_licencia: Optional[date] = None
    personal_telefono: Optional[str] = None
    personal_direccion: Optional[str] = None
    personal_estado: Optional[str] = None

    @field_validator('personal_vto_licencia', mode='before')
    @classmethod
    def empty_string_to_none(cls, v):
        if v == "":
            return None
        return v

class PersonalEntregaRead(PersonalEntregaBase):
    personal_usuario_alta: Optional[str] = None
    personal_fecha_alta: Optional[datetime] = None
    personal_usuario_mod: Optional[str] = None
    personal_fecha_mod: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Marcas de Móvil ---
class MarcaMovilBase(BaseModel):
    marca_nombre: str
    marca_estado: Optional[str] = 'A'

class MarcaMovilCreate(MarcaMovilBase):
    pass

class MarcaMovilUpdate(BaseModel):
    marca_nombre: Optional[str] = None
    marca_estado: Optional[str] = None

class MarcaMovilRead(MarcaMovilBase):
    marca_id: int
    marca_tenantId: int = 1
    marca_usuario_alta: Optional[str] = None
    marca_fecha_alta: Optional[datetime] = None
    marca_usuario_mod: Optional[str] = None
    marca_fecha_mod: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Modelos de Móvil ---
class ModeloMovilBase(BaseModel):
    modelo_nombre: str
    modelo_marca_id: int
    modelo_estado: Optional[str] = 'A'

class ModeloMovilCreate(ModeloMovilBase):
    pass

class ModeloMovilUpdate(BaseModel):
    modelo_nombre: Optional[str] = None
    modelo_estado: Optional[str] = None

class ModeloMovilRead(ModeloMovilBase):
    modelo_id: int
    modelo_tenantId: int = 1
    marca_nombre: Optional[str] = None   # enriched
    modelo_usuario_alta: Optional[str] = None
    modelo_fecha_alta: Optional[datetime] = None
    modelo_usuario_mod: Optional[str] = None
    modelo_fecha_mod: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Móviles ---
class MovilBase(BaseModel):
    movil_chapa: str
    movil_marca_id: int
    movil_modelo_id: int
    movil_anho: Optional[int] = None
    movil_tipo: Optional[str] = 'CAMIONETA'
    movil_capacidad_kg: Optional[float] = None
    movil_km_actual: Optional[int] = 0
    movil_vto_seguro: Optional[date] = None
    movil_vto_habilitacion: Optional[date] = None
    movil_chofer_doc: Optional[str] = None
    movil_acomp_doc: Optional[str] = None
    movil_estado: Optional[str] = 'A'
    movil_tenantId: int = 1

    @field_validator('movil_vto_seguro', 'movil_vto_habilitacion', 'movil_chofer_doc', 'movil_acomp_doc', mode='before')
    @classmethod
    def empty_string_to_none(cls, v):
        if v == "":
            return None
        return v

class MovilCreate(MovilBase):
    pass

class MovilUpdate(BaseModel):
    movil_chapa: Optional[str] = None
    movil_marca_id: Optional[int] = None
    movil_modelo_id: Optional[int] = None
    movil_anho: Optional[int] = None
    movil_tipo: Optional[str] = None
    movil_capacidad_kg: Optional[float] = None
    movil_km_actual: Optional[int] = None
    movil_vto_seguro: Optional[date] = None
    movil_vto_habilitacion: Optional[date] = None
    movil_chofer_doc: Optional[str] = None
    movil_acomp_doc: Optional[str] = None
    movil_estado: Optional[str] = 'A'

    @field_validator('movil_vto_seguro', 'movil_vto_habilitacion', 'movil_chofer_doc', 'movil_acomp_doc', mode='before')
    @classmethod
    def empty_string_to_none(cls, v):
        if v == "":
            return None
        return v

class MovilRead(MovilBase):
    movil_id: int
    # Enriched fields for display
    marca_nombre: Optional[str] = None
    modelo_nombre: Optional[str] = None
    chofer_nombre: Optional[str] = None
    acomp_nombre: Optional[str] = None
    movil_usuario_alta: Optional[str] = None
    movil_fecha_alta: Optional[datetime] = None
    movil_usuario_mod: Optional[str] = None
    movil_fecha_mod: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Recetas / Producción ---
class RecetaDetalleBase(BaseModel):
    rd_prod_id: int
    rd_cantidad: float
    rd_tenantId: int = 1

class RecetaDetalleCreate(RecetaDetalleBase):
    pass

class RecetaDetalleRead(RecetaDetalleBase):
    rd_id: int
    rd_receta_id: int
    producto: Optional[ProductoRead] = None
    class Config:
        from_attributes = True

class RecetaBase(BaseModel):
    rec_nombre: str
    rec_descripcion: Optional[str] = None
    rec_estado: str = 'A'
    rec_tenantId: int = 1

class RecetaCreate(RecetaBase):
    ingredientes: List[RecetaDetalleCreate]

class RecetaUpdate(BaseModel):
    rec_nombre: Optional[str] = None
    rec_descripcion: Optional[str] = None
    rec_estado: Optional[str] = None
    ingredientes: Optional[List[RecetaDetalleCreate]] = None

class RecetaRead(RecetaBase):
    rec_id: int
    ingredientes: List[RecetaDetalleRead] = []
    
    rec_usuario_alta: Optional[str] = None
    rec_fecha_alta: Optional[datetime] = None
    rec_usuario_mod: Optional[str] = None
    rec_fecha_mod: Optional[datetime] = None
    class Config:
        from_attributes = True

# ─── Solicitudes de Mercadería ────────────────────────────────────────────────

class SolicitudDetBase(BaseModel):
    sdet_prod_id:    int
    sdet_cantidad:   float = 1
    sdet_unidad:     Optional[str] = None
    sdet_observacion: Optional[str] = None
    sdet_cant_dev:   Optional[float] = 0

class SolicitudDetCreate(SolicitudDetBase):
    pass

class SolicitudDetRead(SolicitudDetBase):
    sdet_id:     int
    sdet_sol_id: int
    prod_nombre: Optional[str] = None
    prod_codigo: Optional[str] = None
    sdet_cant_recibida: Optional[float] = 0
    class Config:
        from_attributes = True

class SolicitudTrazabilidadRead(BaseModel):
    traz_id: int
    traz_sol_id: int
    traz_estado: str
    traz_usuario: str
    traz_fecha: datetime
    usuario_nombre: Optional[str] = None
    
    class Config:
        from_attributes = True


class SolicitudBase(BaseModel):
    sol_centro_id:      int
    sol_fecha:          Optional[date] = None
    sol_fecha_requerida: Optional[date] = None
    sol_estado:         Optional[str] = 'PENDIENTE'
    sol_observaciones:  Optional[str] = None

    @field_validator('sol_fecha', 'sol_fecha_requerida', mode='before')
    @classmethod
    def empty_string_to_none(cls, v):
        if v == "":
            return None
        return v

class SolicitudCreate(SolicitudBase):
    detalles: List[SolicitudDetCreate] = []

class SolicitudUpdate(BaseModel):
    sol_fecha_requerida: Optional[date] = None
    sol_estado:          Optional[str] = None
    sol_observaciones:   Optional[str] = None
    detalles:            Optional[List[SolicitudDetCreate]] = None

    @field_validator('sol_fecha_requerida', mode='before')
    @classmethod
    def empty_string_to_none(cls, v):
        if v == "":
            return None
        return v

class SolicitudRead(SolicitudBase):
    sol_id:          int
    sol_usuario_alta: Optional[str] = None
    sol_fecha_alta:  Optional[datetime] = None
    centro_nombre:   Optional[str] = None
    centro_dep:      Optional[int] = None
    centro_dis:      Optional[int] = None
    centro_ciu:      Optional[int] = None
    detalles:        List[SolicitudDetRead] = []
    trazabilidad:    List[SolicitudTrazabilidadRead] = []
    class Config:
        from_attributes = True

class PlanificacionMensualBase(BaseModel):
    plan_receta_id: int
    plan_fecha: date
    plan_tipo_comida: str # DE, AL, ME, PO, CE



class PlanificacionMensualCreate(PlanificacionMensualBase):
    pass

class PlanificacionMensualUpdate(BaseModel):
    plan_receta_id: Optional[int] = None
    plan_fecha: Optional[date] = None
    plan_tipo_comida: Optional[str] = None

class PlanificacionMensualRead(PlanificacionMensualBase):
    plan_id: int
    plan_tenantId: int = 1
    plan_usuario_alta: Optional[str] = None
    plan_fecha_alta: Optional[datetime] = None
    receta: Optional[RecetaRead] = None
    class Config:
        from_attributes = True

# --- AI Integration ---
class AIParseRequest(BaseModel):
    prompt: str
    centro_id: Optional[int] = None

class AIProductMatch(BaseModel):
    nombre_detectado: str
    prod_id: Optional[int] = None
    prod_nombre: Optional[str] = None
    prod_codigo: Optional[str] = None
    cantidad: float
    unidad: Optional[str] = None
    confianza: float = 1.0

class AIParseResponse(BaseModel):
    items: List[AIProductMatch]
    observaciones: Optional[str] = None
    prompt_original: str
    centro_id: Optional[int] = None

class AIChatRequest(BaseModel):
    message: str

class AIChatResponse(BaseModel):
    response: str
    action: Optional[str] = None
    action_data: Optional[dict] = None

class ConsolidatedReportItem(BaseModel):
    prod_nombre: str
    cantidad: float
    unidad: Optional[str] = None

class ConsolidatedReportRequest(BaseModel):
    items: List[ConsolidatedReportItem]
    label: str
class PagoFacturaPagoBase(BaseModel):
    pago_facturas_forma_pago: Optional[int] = None
    pago_facturas_pagos_banco: Optional[int] = None
    pago_facturas_pagos_nro_comprobante: Optional[str] = None
    pago_facturas_pagos_cuenta_nro: Optional[str] = None
    pago_facturas_pagos_fecha: Optional[date] = None
    pago_facturas_pagos_importe: Optional[float] = None
    pago_facturas_pago_estado: Optional[str] = 'PR'

class PagoFacturaPagoCreate(PagoFacturaPagoBase):
    pago_factura_id: int

class PagoFacturaPagoUpdate(BaseModel):
    pago_facturas_forma_pago: Optional[int] = None
    pago_facturas_pagos_banco: Optional[int] = None
    pago_facturas_pagos_nro_comprobante: Optional[str] = None
    pago_facturas_pagos_cuenta_nro: Optional[str] = None
    pago_facturas_pagos_fecha: Optional[date] = None
    pago_facturas_pagos_importe: Optional[float] = None
    pago_facturas_pago_estado: Optional[str] = None


class PagoFacturaShortRead(BaseModel):
    pago_factura_id: Optional[int] = None
    pago_factura_nro_factura: Optional[str] = None
    pago_factura_fecha: Optional[date] = None
    pago_factura_total: Optional[float] = None
    pago_factura_estado: Optional[str] = None
    proveedor: Optional[ProveedorRead] = None
    class Config:
        from_attributes = True

class PagoFacturaPagoRead(PagoFacturaPagoBase):
    pago_factura_pago_id: int
    pago_factura_id: Optional[int] = None
    usuario_alta: Optional[str] = None
    fecha_alta: Optional[datetime] = None
    usuario_mod: Optional[str] = None
    fecha_mod: Optional[datetime] = None
    tenant_id: Optional[int] = None
    forma_pago: Optional[FormaPagoRead] = None
    banco: Optional[EntidadFinancieraRead] = None
    cuenta: Optional[CuentaBancariaRead] = None
    pago_factura: Optional[PagoFacturaShortRead] = None
    class Config:
        from_attributes = True

class PagoFacturaBase(BaseModel):
    pago_factura_nro_factura: str

    @field_validator('pago_factura_nro_factura', mode='before')
    @classmethod
    def validate_nro_factura(cls, v: Any) -> str:
        if v is None: return ""
        # Si es un número (como en la BD actual que es Numeric), quitar el .0 si es entero
        from decimal import Decimal
        if isinstance(v, (int, float, Decimal)):
            if float(v) == int(float(v)):
                return str(int(float(v)))
            return str(v)
        return str(v)

    pago_factura_fecha: date

    pago_factura_proveedor: int
    pago_factura_total: float
    pago_factura_estado: Optional[str] = 'PENDIENTE'
    pago_factura_tipo: Optional[str] = None

class PagoFacturaCreate(PagoFacturaBase):
    pass

class PagoFacturaRead(PagoFacturaBase):
    pago_factura_id: int
    usuario_alta: Optional[str] = None
    fecha_alta: Optional[datetime] = None
    usuario_mod: Optional[str] = None
    fecha_mod: Optional[datetime] = None
    tenant_id: int
    proveedor: Optional[ProveedorRead] = None
    pagos: List[PagoFacturaPagoRead] = []
    class Config:
        from_attributes = True

# --- Historial Consolidados ---
class HistorialSolicitudDetRead(BaseModel):
    hspd_id: int
    hspd_prod_id: Optional[int] = None
    hspd_prod_nombre: str
    hspd_cantidad: float
    hspd_unidad: Optional[str] = None
    class Config:
        from_attributes = True

class HistorialSolicitudRead(BaseModel):
    hsp_id: int
    hsp_fecha: datetime
    hsp_usuario: str
    hsp_label: Optional[str] = None
    hsp_tenantId: int
    detalles: List[HistorialSolicitudDetRead] = []
    class Config:
        from_attributes = True

class HistorialSolicitudCreate(BaseModel):
    label: str
    items: List[ConsolidatedReportItem]

# --- n8n / Integration Schemas ---
class N8NPaymentSync(BaseModel):
    proveedor_id: Optional[int] = None # ID numérico del proveedor (preferido)
    proveedor_identificador: Union[int, str, None] = None # RUC o Nombre (fallback)
    fecha_pago: date
    importe: float
    nro_comprobante: Optional[str] = None
    forma_pago_id: Optional[int] = 5 # 5=Transferencia Bancaria (según usuario), 1=Efectivo, etc.

class InitialDataResponse(BaseModel):
    company: Optional[Any] = None
    sucursales: List[Any] = []
    proveedores: List[Any] = []
    formas_pago: List[Any] = []
    entidades: List[Any] = []
    parametros: Dict[str, Any] = {}
    feriados: List[Any] = []
    politicas: Optional[Any] = None
    cuotas_habilitadas: List[Any] = []
    config_financiera: Optional[Any] = None



# --- Notifications Categories ---
class CategoriaNotificacionBase(BaseModel):
    cat_not_dsc: str

class CategoriaNotificacionCreate(CategoriaNotificacionBase):
    pass

class CategoriaNotificacionUpdate(BaseModel):
    cat_not_dsc: Optional[str] = None

class CategoriaNotificacionRead(CategoriaNotificacionBase):
    cat_not_id: int
    cat_not_tenantId: int
    usuario_alta: Optional[str] = None
    fecha_alta: Optional[datetime] = None
    class Config:
        from_attributes = True

# --- Email Notification Lists ---
class ListaCorreoBase(BaseModel):
    lis_cor_mail: str
    lis_cor_cat_id: int

class ListaCorreoCreate(ListaCorreoBase):
    pass

class ListaCorreoUpdate(BaseModel):
    lis_cor_mail: Optional[str] = None
    lis_cor_cat_id: Optional[int] = None

class ListaCorreoRead(ListaCorreoBase):
    lis_cor_id: int
    lis_cor_tenantId: int
    usuario_alta: Optional[str] = None
    fecha_alta: Optional[datetime] = None
    categoria: Optional[CategoriaNotificacionRead] = None
    class Config:
        from_attributes = True



# --- Carga de Móviles (Logística) ---
class CargaMovilDetalleBase(BaseModel):
    cdet_sol_id: int
    prod_peso_kg: Optional[float] = 0

class CargaMovilDetalleCreate(CargaMovilDetalleBase):
    pass

class CargaMovilDetalleRead(CargaMovilDetalleBase):
    cdet_id: int
    cdet_carga_id: int
    solicitud: Optional[SolicitudRead] = None
    class Config:
        from_attributes = True

class CargaMovilBase(BaseModel):
    carga_movil_id: int
    carga_fecha: date
    carga_estado: str = 'EN_PROCESO'
    carga_chofer_doc: Optional[str] = None
    carga_acomp_doc: Optional[str] = None
    carga_viatico: float = 0
    carga_tot_ren: float = 0 # sumatoria de rendiciones
    carga_estado_ren: str = "ER" # ER: En Rendición, RC: Rendición Cerrada
    carga_observacion: Optional[str] = None
    carga_total_kg: Optional[float] = 0

class CargaMovilCreate(CargaMovilBase):
    detalles: List[CargaMovilDetalleCreate]

class CargaMovilUpdate(BaseModel):
    carga_movil_id: Optional[int] = None
    carga_fecha: Optional[date] = None
    carga_estado: Optional[str] = None
    carga_chofer_doc: Optional[str] = None
    carga_acomp_doc: Optional[str] = None
    carga_viatico: Optional[float] = None
    carga_tot_ren: Optional[float] = None
    carga_estado_ren: Optional[str] = None
    carga_observacion: Optional[str] = None
    carga_total_kg: Optional[float] = None
    detalles: Optional[List[CargaMovilDetalleCreate]] = None

class CargaMovilRead(CargaMovilBase):
    carga_id: int
    carga_tenantid: int
    movil: Optional[MovilRead] = None
    chofer: Optional[PersonalEntregaRead] = None
    acompanante: Optional[PersonalEntregaRead] = None
    detalles: List[CargaMovilDetalleRead] = []
    rendiciones: List["RendicionMovilRead"] = []
    
    class Config:
        from_attributes = True

# --- Rendicion de Movil ---
class RendicionMovilBase(BaseModel):
    ren_mov_dsc: str
    ren_mov_tot: float

class RendicionMovilCreate(RendicionMovilBase):
    carga_id: int

class RendicionMovilRead(RendicionMovilBase):
    ren_mov_id: int
    carga_id: int
    usuario_alta: Optional[str] = None
    fecha_alta: Optional[datetime] = None
    class Config:
        from_attributes = True

CargaMovilRead.model_rebuild()

# --- Procesos Agendados ---
class ProcesoAgendadoBase(BaseModel):
    proc_nombre: str
    proc_descripcion: Optional[str] = None
    proc_frecuencia: Optional[str] = None
    proc_hora: Optional[str] = None
    proc_dias_semana: Optional[str] = None
    proc_dia_mes: Optional[int] = None
    proc_accion: str
    proc_proxima_ejecucion: Optional[datetime] = None
    proc_activo: bool = True
    proc_tenantId: int = 1

class ProcesoAgendadoCreate(ProcesoAgendadoBase):
    pass

class ProcesoAgendadoUpdate(BaseModel):
    proc_nombre: Optional[str] = None
    proc_descripcion: Optional[str] = None
    proc_frecuencia: Optional[str] = None
    proc_hora: Optional[str] = None
    proc_dias_semana: Optional[str] = None
    proc_dia_mes: Optional[int] = None
    proc_activo: Optional[bool] = None
    proc_estado_ejecucion: Optional[str] = None
    proc_ultimo_resultado: Optional[str] = None
    proc_proxima_ejecucion: Optional[datetime] = None

class ProcesoAgendadoRead(ProcesoAgendadoBase):
    proc_id: int
    proc_ultima_ejecucion: Optional[datetime] = None
    proc_ultimo_resultado: Optional[str] = None
    proc_estado_ejecucion: str
    proc_usuario_mod: Optional[str] = None
    proc_fecha_mod: Optional[datetime] = None
    class Config:
        from_attributes = True

class HstConsumoRead(BaseModel):
    hcce_id: int
    hcce_fecha_plan: date
    hcce_centro_id: int
    hcce_receta_id: int
    hcce_prod_id: int
    hcce_cantidad: float
    hcce_beneficiarios: int
    hcce_estado: str
    hcce_tenantid: int
    hcce_fecha_ejecucion: Optional[datetime] = None
    hcce_usuario_ejecucion: Optional[str] = None
    
    # Extra fields for UI
    producto_nombre: Optional[str] = None
    centro_nombre: Optional[str] = None
    receta_nombre: Optional[str] = None

    class Config:
        from_attributes = True


# --- Recepciones de Mercadería ---
class RecepcionDetalleBase(BaseModel):
    rd_prod_id: int
    rd_cant_solicitada: float
    rd_cant_recibida: float

class RecepcionDetalleCreate(RecepcionDetalleBase):
    pass

class RecepcionDetalleRead(RecepcionDetalleBase):
    rd_id: int
    rd_recepcion_id: int
    producto: Optional[ProductoRead] = None
    class Config:
        from_attributes = True

class RecepcionBase(BaseModel):
    rec_solicitud_id: int
    rec_centro_id: int
    rec_comentario: Optional[str] = None

class RecepcionCreate(RecepcionBase):
    detalles: List[RecepcionDetalleCreate]

class RecepcionRead(RecepcionBase):
    rec_id: int
    rec_usuario_alta: str
    rec_fecha_alta: datetime
    rec_usuario_mod: Optional[str] = None
    rec_fecha_mod: Optional[datetime] = None
    detalles: List[RecepcionDetalleRead] = []
    class Config:
        from_attributes = True



# --- Caja (Ingresos y Egresos) Schemas ---

class ConceptoIngEgrBase(BaseModel):
    con_ing_egr_dsc: str
    con_ing_egr_tipo: str # 'I' o 'E'

class ConceptoIngEgrCreate(ConceptoIngEgrBase):
    pass

class ConceptoIngEgrUpdate(BaseModel):
    con_ing_egr_dsc: Optional[str] = None
    con_ing_egr_tipo: Optional[str] = None

class ConceptoIngEgrRead(ConceptoIngEgrBase):
    con_ing_egr_cod: int
    con_ing_egr_usuario_alta: Optional[str] = None
    con_ing_egr_fecha_alta: Optional[datetime] = None
    con_ing_egr_usuario_mod: Optional[str] = None
    con_ing_egr_fecha_mod: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class CajaIngEgrBase(BaseModel):
    caja_ie_concepto_cod: int
    caja_ie_monto: float
    caja_ie_cliente_doc: Optional[str] = None
    caja_ie_observacion: Optional[str] = None
    caja_ie_sesion_id: Optional[int] = None
    caja_ie_tenantId: int = 1

class CajaIngEgrCreate(CajaIngEgrBase):
    # El tipo se autocompleta backend-side
    pass

class CajaIngEgrRead(CajaIngEgrBase):
    caja_ie_id: int
    caja_ie_fecha: datetime
    caja_ie_tipo: str
    caja_ie_usuario_alta: str
    
    concepto: Optional[ConceptoIngEgrRead] = None
    cliente: Optional[ClienteRead] = None
    
    class Config:
        from_attributes = True
