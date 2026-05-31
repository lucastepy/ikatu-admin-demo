from sqlalchemy import Column, Integer, String, Boolean, DECIMAL, Numeric, ForeignKey, DateTime, Date, Text, ForeignKeyConstraint, BigInteger, UniqueConstraint, and_
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Categoria(Base):
    __tablename__ = "categorias"
    cat_id = Column(Integer, primary_key=True, index=True)
    cat_nombre = Column(String(50), nullable=False)
    cat_prefijo = Column(String(5), nullable=True)
    cat_numerador = Column(Integer, nullable=True, default=0)
    cat_tenantId = Column("cat_tenantid", Integer, nullable=False)

    productos = relationship("Producto", back_populates="categoria")

class Marca(Base):
    __tablename__ = "marcas"
    marca_id = Column(Integer, primary_key=True, index=True)
    marca_nombre = Column(String(50), nullable=False)
    marca_tenantId = Column("marca_tenantid", Integer, nullable=False)

    productos = relationship("Producto", back_populates="marca")

class Producto(Base):
    __tablename__ = "productos"
    prod_id = Column(Integer, primary_key=True, index=True)
    prod_codigo = Column(String(50), unique=True, nullable=False)
    prod_nombre = Column(String(150), nullable=False)
    prod_marca_id = Column(Integer, ForeignKey("marcas.marca_id"), nullable=True) # Changed from string to FK
    prod_categoria_id = Column(Integer, ForeignKey("categorias.cat_id"), nullable=True)
    prod_precio_costo = Column(DECIMAL(12, 2))
    prod_precio_contado = Column(DECIMAL(12, 2))
    # prod_precio_lista = Column(DECIMAL(12, 2)) # REMOVED
    prod_garantia_meses = Column(Integer, default=12)
    prod_stock_actual = Column(Integer, default=0)
    prod_imagen_url = Column(Text, nullable=True) # URL or Base64 of the product image
    prod_uni_med = Column(Integer, ForeignKey("unidad_medida.uni_med_cod"), nullable=True)
    prod_peso_kg = Column(Numeric(10, 3), default=0)
    prod_tenantId = Column("prod_tenantid", Integer, nullable=False)

    categoria = relationship("Categoria", back_populates="productos")
    marca = relationship("Marca", back_populates="productos")
    uni_medida = relationship("UnidadMedida")
    series = relationship("SerieProducto", back_populates="producto")
    inventario_centros = relationship("CentroEntregaInventario", back_populates="producto")
class Cliente(Base):
    __tablename__ = "clientes"
    cli_documento = Column(String(20), primary_key=True, index=True) # CI or main doc acting as PK
    cli_nombre = Column(String(150), nullable=False)
    cli_ruc = Column(String(20), nullable=True) # Specific RUC for billing
    cli_razon_social = Column(String(150), nullable=True) # Business name for billing
    cli_telefono = Column(String(50))
    cli_email = Column(String(100))
    cli_direccion = Column(String(200))
    cli_dep = Column(String(100), nullable=True)
    cli_dis = Column(String(100), nullable=True)
    cli_ciu = Column(String(100), nullable=True)
    cli_bar = Column(String(100), nullable=True)
    cli_tipo = Column(String(1), nullable=True, default='F') # F = Fisica, J = Juridica
    cli_nro_casa = Column(String(50), nullable=True)
    cli_geo = Column(String(100), nullable=True)
    cli_tenantId = Column("cli_tenantid", Integer, nullable=False)

    venta = relationship("Venta", back_populates="cliente")

class CentroEntrega(Base):
    __tablename__ = "centros_entrega"

    centro_id = Column(Integer, primary_key=True, index=True)
    centro_nombre = Column(String(150), nullable=False)
    centro_tipo = Column(String(50), nullable=True) # HOSPITAL, ESCUELA, RESTAURANTE
    centro_direccion = Column(String(255), nullable=True)
    centro_referencia = Column(String(255), nullable=True)
    centro_geo = Column(String(100), nullable=True)
    
    # FKs Geográficas
    centro_dep = Column(Integer, ForeignKey("departamentos.dep_cod"), nullable=True)
    centro_dis = Column(Integer, nullable=True)
    centro_ciu = Column(Integer, nullable=True)
    
    # Integridad Referencial Compuesta
    __table_args__ = (
        ForeignKeyConstraint(
            ['centro_dep', 'centro_dis'],
            ['distritos.dis_dep_cod', 'distritos.dis_cod'],
             name='fk_centros_distrito'
        ),
        ForeignKeyConstraint(
            ['centro_dep', 'centro_dis', 'centro_ciu'],
            ['ciudades.ciu_dep_cod', 'ciudades.ciu_dis_cod', 'ciudades.ciu_cod'],
             name='fk_centros_ciudad'
        ),
    )

    centro_telefono = Column(String(50), nullable=True)
    centro_contacto_email = Column(String(150), ForeignKey("usuarios.usuario_email"), nullable=True)
    centro_horario_recepcion = Column(String(100), nullable=True)
    centro_cant_beneficiarios = Column(Integer, nullable=True)

    centro_estado = Column(String(1), default='A', nullable=False)
    centro_usuario_alta = Column(String(50), nullable=False)
    centro_fecha_alta = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    centro_usuario_mod = Column(String(50), nullable=True)
    centro_fecha_mod = Column(DateTime(timezone=True), onupdate=func.now())
    
    centro_tipo_comida = Column(String(20), nullable=True) # DE, AL, ME, PO, CE
    centro_tenantId = Column("centro_tenantid", Integer, nullable=False, default=1)

    # Relaciones Geográficas
    departamento = relationship("Departamento")
    distrito = relationship("Distrito", foreign_keys=[centro_dep, centro_dis], primaryjoin="and_(CentroEntrega.centro_dep==Distrito.dis_dep_cod, CentroEntrega.centro_dis==Distrito.dis_cod)", overlaps="departamento")
    usuario_contacto = relationship("Usuario", foreign_keys=[centro_contacto_email])
    solicitudes = relationship("SolicitudMercaderia", back_populates="centro")
    inventario = relationship("CentroEntregaInventario", back_populates="centro")

    @property
    def contacto_nombre(self):
        return self.usuario_contacto.usuario_nombre if self.usuario_contacto else None

    @property
    def contacto_email(self):
        return self.usuario_contacto.usuario_email if self.usuario_contacto else None

    @property
    def departamento_nombre(self):
        return self.departamento.dep_dsc if self.departamento else None
        
    @property
    def distrito_nombre(self):
        return self.distrito.dis_dsc if self.distrito else None


class CentroEntregaInventario(Base):
    __tablename__ = "centros_entrega_inventario"
    inv_id = Column(Integer, primary_key=True, index=True)
    inv_centro_id = Column(Integer, ForeignKey("centros_entrega.centro_id"), nullable=False)
    inv_prod_id = Column(Integer, ForeignKey("productos.prod_id"), nullable=False)
    inv_stock_actual = Column(Numeric(12, 3), default=0)
    inv_stock_minimo = Column(Numeric(12, 3), default=0)
    inv_tenantId = Column("inv_tenantid", Integer, nullable=False, default=1)
    
    # Audit
    inv_usuario_mod = Column(String(50), nullable=True)
    inv_fecha_mod = Column(DateTime(timezone=True), onupdate=func.now())

    centro = relationship("CentroEntrega", back_populates="inventario")
    producto = relationship("Producto", back_populates="inventario_centros")

    __table_args__ = (
        UniqueConstraint('inv_centro_id', 'inv_prod_id', 'inv_tenantid', name='uq_centro_producto_tenant'),
    )

    @property
    def prod_nombre(self):
        return self.producto.prod_nombre if self.producto else None

    @property
    def prod_codigo(self):
        return self.producto.prod_codigo if self.producto else None


class PersonalEntrega(Base):
    __tablename__ = "personal_entrega"

    personal_documento = Column(String(20), primary_key=True, index=True)  # CI - PK
    personal_nombre = Column(String(150), nullable=False)
    personal_rol = Column(Integer, nullable=False, default=1)               # 1=Chofer, 2=Acompañante

    # Licencia (relevante para Choferes)
    personal_licencia = Column(String(50), nullable=True)
    personal_cat_licencia = Column(String(20), nullable=True)               # A, B, C, Pro
    personal_vto_licencia = Column(Date, nullable=True)

    personal_telefono = Column(String(50), nullable=True)
    personal_direccion = Column(String(200), nullable=True)

    personal_estado = Column(String(1), default='A', nullable=False)        # 'A', 'I', 'S'uspendido
    personal_usuario_alta = Column(String(50), nullable=False)
    personal_fecha_alta = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    personal_usuario_mod = Column(String(50), nullable=True)
    personal_fecha_mod = Column(DateTime(timezone=True), onupdate=func.now())

    personal_tenantId = Column("personal_tenantid", Integer, nullable=False, default=1)


class MarcaMovil(Base):
    __tablename__ = "marcas_movil"

    marca_id = Column(Integer, primary_key=True, index=True)
    marca_nombre = Column(String(50), nullable=False, unique=True)

    marca_estado = Column(String(1), default='A', nullable=False)
    marca_usuario_alta = Column(String(50), nullable=False)
    marca_fecha_alta = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    marca_usuario_mod = Column(String(50), nullable=True)
    marca_fecha_mod = Column(DateTime(timezone=True), onupdate=func.now())

    marca_tenantId = Column("marca_tenantid", Integer, nullable=False, default=1)

    modelos = relationship("ModeloMovil", back_populates="marca")


class ModeloMovil(Base):
    __tablename__ = "modelos_movil"

    modelo_id = Column(Integer, primary_key=True, index=True)
    modelo_nombre = Column(String(50), nullable=False)
    modelo_marca_id = Column(Integer, ForeignKey("marcas_movil.marca_id"), nullable=False)

    modelo_estado = Column(String(1), default='A', nullable=False)
    modelo_usuario_alta = Column(String(50), nullable=False)
    modelo_fecha_alta = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    modelo_usuario_mod = Column(String(50), nullable=True)
    modelo_fecha_mod = Column(DateTime(timezone=True), onupdate=func.now())

    modelo_tenantId = Column("modelo_tenantid", Integer, nullable=False, default=1)

    marca = relationship("MarcaMovil", back_populates="modelos")
    moviles = relationship("Movil", back_populates="modelo")

    @property
    def marca_nombre(self):
        return self.marca.marca_nombre if self.marca else None



class Movil(Base):
    __tablename__ = "moviles"

    movil_id = Column(Integer, primary_key=True, index=True)
    movil_chapa = Column(String(20), nullable=False, unique=True)

    # FKs a tablas maestras
    movil_marca_id = Column(Integer, ForeignKey("marcas_movil.marca_id"), nullable=False)
    movil_modelo_id = Column(Integer, ForeignKey("modelos_movil.modelo_id"), nullable=False)

    movil_anho = Column(Integer, nullable=True)
    movil_tipo = Column(String(50), default='CAMIONETA')      # CAMIONETA, MOTO, UTILITARIO, etc.
    movil_capacidad_kg = Column(DECIMAL(10, 2), nullable=True)
    movil_km_actual = Column(Integer, default=0)

    # Documentación
    movil_vto_seguro = Column(Date, nullable=True)
    movil_vto_habilitacion = Column(Date, nullable=True)

    # Personal asignado
    movil_chofer_doc = Column(String(20), ForeignKey("personal_entrega.personal_documento"), nullable=True)
    movil_acomp_doc = Column(String(20), ForeignKey("personal_entrega.personal_documento"), nullable=True)

    movil_estado = Column(String(1), default='A', nullable=False)  # 'A', 'I', 'M'antenimiento
    movil_usuario_alta = Column(String(50), nullable=False)
    movil_fecha_alta = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    movil_usuario_mod = Column(String(50), nullable=True)
    movil_fecha_mod = Column(DateTime(timezone=True), onupdate=func.now())
    movil_tenantId = Column("movil_tenantid", Integer, nullable=False, default=1)

    # Relaciones (para navegar desde objetos)
    marca = relationship("MarcaMovil")
    modelo = relationship("ModeloMovil", back_populates="moviles")
    chofer = relationship("PersonalEntrega", foreign_keys=[movil_chofer_doc])
    acompanante = relationship("PersonalEntrega", foreign_keys=[movil_acomp_doc])

    @property
    def marca_nombre(self):
        return self.marca.marca_nombre if self.marca else None

    @property
    def modelo_nombre(self):
        return self.modelo.modelo_nombre if self.modelo else None

    @property
    def chofer_nombre(self):
        return self.chofer.personal_nombre if self.chofer else None

    @property
    def acomp_nombre(self):
        return self.acompanante.personal_nombre if self.acompanante else None


class SerieProducto(Base):
    __tablename__ = "series_productos"
    serie_id = Column(Integer, primary_key=True, index=True)
    serie_numero = Column(String(100), nullable=False)
    serie_prodId = Column("serie_prodid", Integer, ForeignKey("productos.prod_id"))
    serie_estado = Column(String(20), default='DISPONIBLE')
    serie_ventaId = Column("serie_ventaid", Integer)
    serie_tenantId = Column("serie_tenantid", Integer, nullable=False)

    producto = relationship("Producto", back_populates="series")

class Venta(Base):
    __tablename__ = "ventas"
    venta_id = Column(Integer, primary_key=True, index=True)
    venta_fecha = Column(DateTime(timezone=True), server_default=func.now())
    venta_clienteDoc = Column("venta_clientedoc", String(20), ForeignKey("clientes.cli_documento"))
    venta_condicion = Column(String(10))
    venta_total = Column(DECIMAL(12, 2), nullable=False)
    venta_entrega_inicial = Column(DECIMAL(12, 2), default=0)
    venta_saldo_financiar = Column(DECIMAL(12, 2), default=0)
    venta_estado = Column(String(20), default='FINALIZADA')
    venta_vendedorId = Column("venta_vendedorid", Integer)
    venta_sucursal = Column(Integer, ForeignKey("sucursales.suc_id"))
    venta_redondeo = Column(DECIMAL(12, 2), default=0)
    venta_descuento = Column(DECIMAL(12, 2), default=0)
    venta_tenantId = Column("venta_tenantid", Integer, nullable=False)
    venta_requiere_factura = Column(Boolean, default=True)
    venta_solicita_ticket = Column(Boolean, default=False)

    # --- SIFEN Electronic Invoice Fields ---
    venta_cdc = Column(String(44), nullable=True) # Codigo de Control (SIFEN ID)
    venta_numero_oficial = Column(String(20), nullable=True) # Official Invoice Number (001-001-0000123)
    venta_estado_sifen = Column(String(20), default='PENDIENTE') # SIFEN Status
    venta_xml_firmado = Column(Text, nullable=True) # Signed XML content
    venta_qr = Column(Text, nullable=True) # QR Code data
    venta_firma_digital = Column(Text, nullable=True) # Digital Signature

    detalles = relationship("VentaDetalle", back_populates="venta")
    cuotas = relationship("Cuota", back_populates="venta")
    cliente = relationship("Cliente", back_populates="venta")
    sucursal = relationship("Sucursal")

class VentaDetalle(Base):
    __tablename__ = "venta_detalles"
    det_id = Column(Integer, primary_key=True, index=True)
    det_ventaId = Column("det_ventaid", Integer, ForeignKey("ventas.venta_id"))
    det_prodId = Column("det_prodid", Integer, ForeignKey("productos.prod_id"))
    det_cantidad = Column(Integer, nullable=False)
    det_precio_unitario = Column(DECIMAL(12, 2), nullable=False)
    det_subtotal = Column(DECIMAL(12, 2), nullable=False)
    det_tenantId = Column("det_tenantid", Integer, nullable=False)

    venta = relationship("Venta", back_populates="detalles")
    producto = relationship("Producto")

class Cuota(Base):
    __tablename__ = "cuotas"
    cuota_id = Column(Integer, primary_key=True, index=True)
    cuota_ventaId = Column("cuota_ventaid", Integer, ForeignKey("ventas.venta_id"))
    cuota_numero = Column(Integer, nullable=False)
    cuota_vencimiento = Column(Date, nullable=False)
    cuota_monto_capital = Column(DECIMAL(12, 2))
    cuota_monto_interes = Column(DECIMAL(12, 2))
    cuota_monto_total = Column(DECIMAL(12, 2), nullable=False)
    cuota_saldo = Column(DECIMAL(12, 2), nullable=False)
    cuota_estado = Column(String(20), default='PENDIENTE')
    cuota_fecha_pago = Column(DateTime)
    cuota_recargo_mora = Column(DECIMAL(12, 2), default=0)
    cuota_monto_moratorio_pagado = Column(DECIMAL(12, 2), default=0)
    cuota_monto_punitorio_pagado = Column(DECIMAL(12, 2), default=0)
    cuota_dias_atraso_calculado = Column(Integer, default=0)
    cuota_tenantId = Column("cuota_tenantid", Integer, nullable=False)

    venta = relationship("Venta", back_populates="cuotas")

class Pago(Base):
    __tablename__ = "pagos"
    pago_id = Column(Integer, primary_key=True, index=True)
    pago_nro_recibo = Column(String(50))
    pago_clienteDoc = Column("pago_clientedoc", String(20), ForeignKey("clientes.cli_documento"))
    pago_fecha = Column(DateTime(timezone=True), server_default=func.now())
    pago_monto_total = Column(DECIMAL(12, 2), nullable=False)
    pago_sesionId = Column("pago_sesionid", Integer, ForeignKey("caja_sesiones.sesion_id"))
    pago_observacion = Column(Text)
    pago_estado = Column(String(20), default='CONFIRMADO')
    pago_afectar_siguiente = Column(Boolean, default=False)
    pago_es_cancelacion_anticipada = Column(Boolean, default=False)
    pago_descuento_anticipado = Column(DECIMAL(12, 2), default=0)
    pago_tenantId = Column("pago_tenantid", Integer, nullable=False)
    pago_creadoPor = Column("pago_creadopor", String(50))

    sesion = relationship("CajaSesion")
    metodos = relationship("PagoMetodo", back_populates="pago")
    imputaciones = relationship("PagoImputacion", back_populates="pago")
    facturas = relationship("Factura", back_populates="pago")


class Caja(Base):
    __tablename__ = "cajas"
    caja_cod = Column(Integer, primary_key=True)
    caja_sucursal = Column(Integer, ForeignKey("sucursales.suc_id"), primary_key=True, default=1)
    caja_dsc = Column(String(255), nullable=False)
    caja_estado = Column(String(1), default='A')
    caja_tenantId = Column("caja_tenantid", Integer, nullable=False)
    caja_fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
    caja_usuario_creacion = Column(String(100))
    caja_fecha_modificacion = Column(DateTime(timezone=True))
    caja_usuario_modificacion = Column(String(100))

    sucursal = relationship("Sucursal")


class CajaSesion(Base):
    __tablename__ = "caja_sesiones"
    sesion_id = Column(Integer, primary_key=True, index=True)
    sesion_usuario_email = Column("sesion_usuario_email", String(100), ForeignKey("usuarios.usuario_email"), nullable=False)
    
    # Composite FK to Caja
    sesion_cajaId = Column("sesion_cajaid", Integer, nullable=True) 
    sesion_sucursal = Column(Integer, nullable=True, default=1)
    
    sesion_fecha_apertura = Column(DateTime(timezone=True), server_default=func.now())
    sesion_fecha_cierre = Column(DateTime(timezone=True), nullable=True)
    sesion_monto_inicial = Column(DECIMAL(12, 2), nullable=False)
    sesion_monto_final = Column(DECIMAL(12, 2), nullable=True)
    sesion_estado = Column(String(20), default='ABIERTA') 
    sesion_observaciones = Column(String(255), nullable=True)
    sesion_tenantId = Column("sesion_tenantid", Integer, nullable=False)
    
    # Audit & Closing Details
    sesion_usuario_cierre = Column(String(100), nullable=True)
    
    # Calculated Totals by Payment Method (Snapshots at closing)
    sesion_total_efectivo = Column(DECIMAL(12, 2), default=0)
    sesion_cnt_efectivo = Column(Integer, default=0)
    
    sesion_total_tarjeta = Column(DECIMAL(12, 2), default=0)
    sesion_cnt_tarjeta = Column(Integer, default=0)
    
    sesion_total_transferencia = Column(DECIMAL(12, 2), default=0)
    sesion_cnt_transferencia = Column(Integer, default=0)
    
    sesion_total_otros = Column(DECIMAL(12, 2), default=0)
    sesion_cnt_otros = Column(Integer, default=0)

    usuario = relationship("Usuario", foreign_keys=[sesion_usuario_email], primaryjoin="CajaSesion.sesion_usuario_email==Usuario.usuario_email")
    usuario_cierre = relationship("Usuario", foreign_keys=[sesion_usuario_cierre], primaryjoin="CajaSesion.sesion_usuario_cierre==Usuario.usuario_email")

    @property
    def sesion_usuario_nombre(self):
        return self.usuario.usuario_nombre if self.usuario else self.sesion_usuario_email

    @property
    def sesion_usuario_cierre_nombre(self):
        return self.usuario_cierre.usuario_nombre if self.usuario_cierre else self.sesion_usuario_cierre

    # Relationship with composite join
    caja = relationship("Caja", foreign_keys=[sesion_cajaId, sesion_sucursal], 
                        primaryjoin="and_(CajaSesion.sesion_cajaId==Caja.caja_cod, CajaSesion.sesion_sucursal==Caja.caja_sucursal)")


class EntidadFinanciera(Base):
    __tablename__ = "entidades_financieras"
    ent_id = Column(Integer, primary_key=True, index=True)
    ent_nombre = Column(String(100), nullable=False)
    ent_tipo = Column(String(50))
    ent_activo = Column(Boolean, default=True)
    ent_tenantId = Column("ent_tenantid", Integer, nullable=False)
    ent_creadoPor = Column("ent_creadopor", String(50))
    
    cuentas = relationship("CuentaBancaria", back_populates="entidad")

class CuentaBancaria(Base):
    __tablename__ = "cuentas_bancarias"
    cuentas_bancarias_ent_id = Column(Integer, ForeignKey("entidades_financieras.ent_id"), primary_key=True)
    cuentas_bancarias_nro_cuenta = Column(String(20), primary_key=True)
    
    usuario_alta = Column(String(100))
    fecha_alta = Column(DateTime(timezone=True), server_default=func.now())
    usuario_mod = Column(String(100))
    fecha_mod = Column(DateTime(timezone=True), onupdate=func.now())
    tenant_id = Column("tenant_id", Integer, nullable=False)

    entidad = relationship("EntidadFinanciera", back_populates="cuentas")

class PagoMetodo(Base):
    __tablename__ = "pagos_metodos"
    met_id = Column(Integer, primary_key=True, index=True)
    met_pagoId = Column("met_pagoid", Integer, ForeignKey("pagos.pago_id"))
    met_tipo = Column(String(50), nullable=False)
    met_monto = Column(DECIMAL(12, 2), nullable=False)
    met_entidadId = Column("met_entidadid", Integer, ForeignKey("entidades_financieras.ent_id"), nullable=True)
    met_referencia = Column(String(100))
    met_tenantId = Column("met_tenantid", Integer, nullable=False)

    pago = relationship("Pago", back_populates="metodos")
    entidad = relationship("EntidadFinanciera")

class PagoImputacion(Base):
    __tablename__ = "pagos_imputaciones"
    imp_id = Column(Integer, primary_key=True, index=True)
    imp_pagoId = Column("imp_pagoid", Integer, ForeignKey("pagos.pago_id"))
    imp_cuotaId = Column("imp_cuotaid", Integer, ForeignKey("cuotas.cuota_id"))
    imp_monto_capital = Column(DECIMAL(12, 2), default=0)
    imp_monto_interes = Column(DECIMAL(12, 2), default=0)
    imp_monto_mora = Column(DECIMAL(12, 2), default=0)
    imp_tenantId = Column("imp_tenantid", Integer, nullable=False)

    pago = relationship("Pago", back_populates="imputaciones")
    cuota = relationship("Cuota")

class PoliticaCredito(Base):
    __tablename__ = "politicas_credito"
    pol_id = Column(Integer, primary_key=True, index=True)
    pol_tenantId = Column("pol_tenantid", Integer, nullable=False)
    pol_tasa_moratoria_diaria = Column(DECIMAL(10, 6), default=0.001000)
    pol_tasa_punitoria_diaria = Column(DECIMAL(10, 6), default=0.000500)
    pol_dias_gracia = Column(Integer, default=0)
    pol_iva_intereses = Column(DECIMAL(5, 2), default=10.00)
    pol_interes_mensual_tasa = Column(DECIMAL(10, 2), default=3.00) # 3% default
    pol_modificadoPor = Column("pol_modificadopor", String(50))
    pol_fecModificacion = Column("pol_fecmodificacion", DateTime(timezone=True), server_default=func.now())

class Feriado(Base):
    __tablename__ = "feriados"
    feriado_anho = Column(Integer, primary_key=True)
    feriado_fecha = Column(Date, primary_key=True)
    feriado_dsc = Column(String(50))
    feriado_estado = Column(String(1), default='A') # A=Activo, I=Inactivo
    feriado_tenantId = Column("feriado_tenantid", Integer, nullable=False)

class Parametro(Base):
    __tablename__ = "parametros"
    par_id = Column(Integer, primary_key=True, index=True)
    par_codigo = Column(String(50), unique=True, nullable=False)
    par_descripcion = Column(String(150), nullable=False)
    par_valor = Column(Text, nullable=False)
    par_tenantId = Column("par_tenantid", Integer, nullable=False)

# --- Security Models ---


class Menu(Base):
    __tablename__ = "menu"
    menu_cod = Column(Integer, primary_key=True, index=True)
    menu_nombre = Column(Text, nullable=False)
    # Relationships
    detalles = relationship("MenuDetalle", back_populates="menu")
    perfiles = relationship("Perfil", back_populates="menu")

class MenuDetalle(Base):
    __tablename__ = "menu_det"
    menu_cod = Column(Integer, ForeignKey("menu.menu_cod"), primary_key=True)
    menu_det_cod = Column(Integer, primary_key=True)
    menu_det_nombre = Column("menu_det_nombre", Text, nullable=False)
    menu_det_url = Column("menu_det_url", Text, nullable=True)
    menu_det_icono = Column("menu_det_icono", Text, nullable=True)
    menu_det_cod_padre = Column("menu_det_cod_padre", Integer, nullable=True)
    menu_det_estado = Column("menu_det_estado", Text, default='A')
    menu_det_det_orden = Column("menu_det_det_orden", Integer, default=0)

    menu = relationship("Menu", back_populates="detalles")

class Perfil(Base):
    __tablename__ = "perfiles"
    perfil_cod = Column(Integer, primary_key=True, index=True)
    perfil_nombre = Column(Text, nullable=False)
    menu_cod = Column(Integer, ForeignKey("menu.menu_cod"), nullable=False)

    menu = relationship("Menu", back_populates="perfiles")
    usuarios = relationship("Usuario", back_populates="perfil")

class Usuario(Base):
    __tablename__ = "usuarios"
    usuario_email = Column(Text, primary_key=True)
    usuario_sucursal = Column(Integer, ForeignKey("sucursales.suc_id"), nullable=True, default=1)
    usuario_nombre = Column(Text, nullable=False)
    usuario_password = Column(Text, nullable=False)
    perfil_cod = Column(Integer, ForeignKey("perfiles.perfil_cod"), nullable=False)
    usuario_estado = Column(Text, default='A')
    usuario_primer_ingreso = Column(Boolean, default=True)
    usuario_reset_token = Column(Text, nullable=True)

    # Audit
    usuario_tenantId = Column("usuario_tenantid", Integer, nullable=False, default=1)
    usuario_fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
    usuario_usuario_creacion = Column(String(100))
    usuario_fecha_modificacion = Column(DateTime(timezone=True))
    usuario_usuario_modificacion = Column(String(100))
    usuario_imagen_url = Column(String(500), nullable=True)

    perfil = relationship("Perfil", back_populates="usuarios")

class Sucursal(Base):
    __tablename__ = "sucursales"
    suc_id = Column(Integer, primary_key=True, index=True)
    suc_nombre = Column(String(100), nullable=False)
    suc_direccion = Column(String(200))
    suc_telefono = Column(String(50))
    suc_estado = Column(String(1), default='A') # A=Activo, I=Inactivo
    suc_tenantId = Column("suc_tenantid", Integer, nullable=False)

class Empresa(Base):
    __tablename__ = "empresa"
    empresa_cod = Column(Integer, primary_key=True)
    empresa_nom = Column(String(50))
    empresa_ruc = Column(String(15))
    empresa_estado = Column(String(1))
    empresa_usuario_alta = Column(String(100))
    empresa_fecha_alta = Column(DateTime(timezone=True), server_default=func.now())
    empresa_usuario_mod = Column(String(100))
    empresa_fecha_mod = Column(DateTime(timezone=True))
    empresa_act_eco = Column(Integer)
    empresa_dep = Column(Integer)
    empresa_dis = Column(Integer)
    empresa_ciu = Column(Integer)
    empresa_bar = Column(Integer)
    empresa_nom_fan = Column(String(100))
    empresa_mail = Column(String(100))
    empresa_dir = Column(String(200))
    empresa_tel = Column(String(20))
    empresa_propietario = Column(String(50))




# --- Billing / Invoicing ---
class Establecimiento(Base):
    __tablename__ = "establecimientos"
    estab_codigo = Column(Integer, primary_key=True)
    estab_nombre = Column(String(100), nullable=False)
    estab_direccion = Column(String(200))
    estab_usuario_alta = Column(Text)
    estab_fecha_alta = Column(DateTime(timezone=True), server_default=func.now())
    estab_usuario_mod = Column(Text)
    estab_fecha_mod = Column(DateTime(timezone=True))

class PuntoExpedicion(Base):
    __tablename__ = "puntos_expedicion"
    estab_codigo = Column(Integer, ForeignKey("establecimientos.estab_codigo"), primary_key=True)
    punto_codigo = Column(Integer, primary_key=True)
    punto_descripcion = Column(String(100))
    punto_usuario_alta = Column(Text)
    punto_fecha_alta = Column(DateTime(timezone=True), server_default=func.now())
    punto_usuario_mod = Column(Text)
    punto_fecha_mod = Column(DateTime(timezone=True))

    establecimiento = relationship("Establecimiento")

class Timbrado(Base):
    __tablename__ = "timbrados"
    timbrado_numero = Column(BigInteger, primary_key=True)
    timbrado_estado = Column(String(20), default='A', nullable=False)
    timbrado_nro_desde = Column(String(20), nullable=False)
    timbrado_nro_hasta = Column(String(20), nullable=False)
    timbrado_nro_actual = Column(String(20), nullable=False)
    timbrado_usuario_alta = Column(Text)
    timbrado_fecha_alta = Column(DateTime(timezone=True), server_default=func.now())
    timbrado_usuario_mod = Column(Text)
    timbrado_fecha_mod = Column(DateTime(timezone=True))
    timbrado_fecha_vencimiento = Column(Date, nullable=False)

class Factura(Base):
    __tablename__ = "facturas"
    estab_codigo = Column(Integer, primary_key=True)
    punto_codigo = Column(Integer, primary_key=True)
    factura_numero = Column(String(20), primary_key=True)

    __table_args__ = (
        ForeignKeyConstraint(
            ['estab_codigo', 'punto_codigo'],
            ['puntos_expedicion.estab_codigo', 'puntos_expedicion.punto_codigo'],
        ),
    )
    
    timbrado_numero = Column(Integer, ForeignKey("timbrados.timbrado_numero"), nullable=False)
    factura_fecha_emision = Column(Date, server_default=func.now(), nullable=False)
    factura_ruc_receptor = Column(String(20))
    factura_nombre_receptor = Column(String(200))
    factura_total = Column(DECIMAL(18, 2), nullable=False)
    factura_total_letras = Column(String(500))
    factura_estado = Column(String(20), default='emitida', nullable=False)
    
    pago_id = Column(Integer, ForeignKey("pagos.pago_id"), nullable=True) # Check if this is 1-to-1 or 1-to-Many
    
    factura_usuario_alta = Column(Text)
    factura_fecha_alta = Column(DateTime(timezone=True), server_default=func.now())
    factura_usuario_mod = Column(Text)
    factura_fecha_mod = Column(DateTime(timezone=True))

    # Composite FK Relationship
    # Using specific join condition or composite foreign keys
    # For now, simplistic relationship definitions:
    timbrado = relationship("Timbrado")
    pago = relationship("Pago", back_populates="facturas")
    
    # Relationship to parent PuntoExpedicion needs composite join
    punto_expedicion = relationship("PuntoExpedicion", 
        primaryjoin="and_(Factura.estab_codigo==PuntoExpedicion.estab_codigo, Factura.punto_codigo==PuntoExpedicion.punto_codigo)",
        foreign_keys=[estab_codigo, punto_codigo])
        
    detalles = relationship("FacturaDetalle", back_populates="factura")

class FacturaDetalle(Base):
    __tablename__ = "facturas_det"
    estab_codigo = Column(Integer, primary_key=True)
    punto_codigo = Column(Integer, primary_key=True)
    factura_numero = Column(String(20), primary_key=True)
    facdet_linea = Column(Integer, primary_key=True)

    __table_args__ = (
        ForeignKeyConstraint(
            ['estab_codigo', 'punto_codigo', 'factura_numero'],
            ['facturas.estab_codigo', 'facturas.punto_codigo', 'facturas.factura_numero'],
        ),
    )
    
    facdet_concepto = Column(String(200), nullable=False)
    facdet_cantidad = Column(Integer, default=1, nullable=False)
    facdet_precio_unitario = Column(DECIMAL(18, 2), nullable=False)
    facdet_subtotal = Column(DECIMAL(18, 2), nullable=False)
    facdet_iva = Column(DECIMAL(18, 2), nullable=False)
    facdet_total = Column(DECIMAL(18, 2), nullable=False)
    
    facdet_usuario_alta = Column(Text)
    facdet_fecha_alta = Column(DateTime(timezone=True), server_default=func.now())
    facdet_usuario_mod = Column(Text)
    facdet_fecha_mod = Column(DateTime(timezone=True))

    factura = relationship("Factura", 
        back_populates="detalles",
        foreign_keys=[estab_codigo, punto_codigo, factura_numero],
        primaryjoin="and_(FacturaDetalle.estab_codigo==Factura.estab_codigo, FacturaDetalle.punto_codigo==Factura.punto_codigo, FacturaDetalle.factura_numero==Factura.factura_numero)"
    )

class Ticket(Base):
    __tablename__ = "tickets"
    ticket_numero = Column(String(20), primary_key=True)
    ticket_fecha_emision = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    ticket_nombre_receptor = Column(String(200))
    ticket_total = Column(DECIMAL(18, 2), nullable=False)
    ticket_estado = Column(String(20), default='emitido', nullable=False)
    pago_id = Column(Integer, ForeignKey("pagos.pago_id"), unique=True, nullable=True)
    venta_id = Column(Integer, ForeignKey("ventas.venta_id"), nullable=True)
    
    usuario_alta = Column(String(100))
    fecha_alta = Column(DateTime(timezone=True), server_default=func.now())
    usuario_mod = Column(String(100))
    fecha_mod = Column(DateTime(timezone=True))
    
    pago = relationship("Pago")
    venta = relationship("Venta")
    detalles = relationship("TicketDetalle", back_populates="ticket")

class TicketDetalle(Base):
    __tablename__ = "tickets_det"
    ticket_numero = Column(String(20), ForeignKey("tickets.ticket_numero"), primary_key=True)
    ticket_linea = Column(Integer, primary_key=True)
    ticket_concepto = Column(String(200), nullable=False)
    ticket_cantidad = Column(Integer, default=1, nullable=False)
    ticket_precio_unitario = Column(DECIMAL(18, 2), nullable=False)
    ticket_subtotal = Column(DECIMAL(18, 2), nullable=False)
    ticket_total = Column(DECIMAL(18, 2), nullable=False)

    ticket = relationship("Ticket", back_populates="detalles")

#   --- New Tables (2025-02-05) ---

class ActividadEconomica(Base):
    __tablename__ = "actividad_economica"
    act_eco_cod = Column(Integer, primary_key=True, autoincrement=False) # Code from SIFEN
    act_eco_dsc = Column(String(255), nullable=False)
    act_eco_usuario_alta = Column(String(100))
    act_eco_fecha_alta = Column(DateTime(timezone=True), server_default=func.now())

class UnidadMedida(Base):
    __tablename__ = "unidad_medida"
    uni_med_cod = Column(Integer, primary_key=True, autoincrement=False)
    uni_med_dsc = Column(String(100), nullable=False)
    uni_med_usuario_alta = Column(String(100))
    uni_med_fecha_alta = Column(DateTime(timezone=True), server_default=func.now())

class FormaPago(Base):
    __tablename__ = "forma_pago"
    forma_pago_id = Column(Integer, primary_key=True, autoincrement=False)
    forma_pago_dsc = Column(String(100), nullable=False)
    forma_pago_usuario_alta = Column(String(100))
    forma_pago_fecha_alta = Column(DateTime(timezone=True), server_default=func.now())

#   --- Geografia / Ubicaciones ---

class Departamento(Base):
    __tablename__ = "departamentos"
    dep_cod = Column(Integer, primary_key=True, autoincrement=False)
    dep_dsc = Column(String(100), nullable=False)
    dep_usuario_alta = Column(String(100))
    dep_fecha_alta = Column(DateTime(timezone=True), server_default=func.now())

class Distrito(Base):
    __tablename__ = "distritos"
    dis_dep_cod = Column(Integer, ForeignKey("departamentos.dep_cod"), primary_key=True)
    dis_cod = Column(Integer, primary_key=True, autoincrement=False)
    dis_dsc = Column(String(100), nullable=False)
    dis_usuario_alta = Column(String(100))
    dis_fecha_alta = Column(DateTime(timezone=True), server_default=func.now())
    
    departamento = relationship("Departamento")

class Ciudad(Base):
    __tablename__ = "ciudades"
    ciu_dep_cod = Column(Integer, primary_key=True)
    ciu_dis_cod = Column(Integer, primary_key=True)
    ciu_cod = Column(Integer, primary_key=True, autoincrement=False)
    ciu_dsc = Column(String(100), nullable=False)
    
    __table_args__ = (
        ForeignKeyConstraint(
            ['ciu_dep_cod', 'ciu_dis_cod'],
            ['distritos.dis_dep_cod', 'distritos.dis_cod'],
        ),
    )
    
    distrito = relationship("Distrito")

class Barrio(Base):
    __tablename__ = "barrios"
    bar_dep_cod = Column(Integer, primary_key=True)
    bar_dis_cod = Column(Integer, primary_key=True)
    bar_ciu_cod = Column(Integer, primary_key=True)
    bar_cod = Column(Integer, primary_key=True, autoincrement=False)
    bar_dsc = Column(String(100), nullable=False)
    
    __table_args__ = (
        ForeignKeyConstraint(
            ['bar_dep_cod', 'bar_dis_cod', 'bar_ciu_cod'],
            ['ciudades.ciu_dep_cod', 'ciudades.ciu_dis_cod', 'ciudades.ciu_cod'],
        ),
    )
    
    ciudad = relationship("Ciudad")

class CuotaHabilitada(Base):
    __tablename__ = "cuotas_habilitadas"
    cuo_hab_cod = Column(Integer, primary_key=True, index=True) # serial
    cuo_hab_cuo = Column(Integer, nullable=True) # int4
    cuo_hab_por_recargo = Column(DECIMAL(12, 2), default=0)
    cuo_hab_tenantid = Column(Integer, nullable=False)
    cuo_hab_usuario_alta = Column(String(100), nullable=False)
    cuo_hab_fecha_alta = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    cuo_hab_usuario_mod = Column(String(100), nullable=True)
    cuo_hab_fecha_mod = Column(DateTime(timezone=True), nullable=True)

class TipoProveedor(Base):
    __tablename__ = "tipo_proveedor"
    tipo_prov_id = Column(Integer, primary_key=True, index=True)
    tipo_prov_nombre = Column(String(100), nullable=False)
    tipo_prov_usr_usuario_alta = Column(String(50), nullable=False)
    tipo_prov_usr_fecha_alta = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    tipo_prov_usr_usuario_mod = Column(String(50), nullable=True)
    tipo_prov_usr_fecha_mod = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

class Proveedor(Base):
    __tablename__ = "proveedores"
    prov_id = Column(Integer, primary_key=True, index=True)
    prov_nombre = Column(String(150), nullable=False)
    prov_ruc = Column(String(20), nullable=True)
    prov_razon_social = Column(String(150), nullable=True)
    prov_direccion = Column(String(200), nullable=True)
    prov_dep = Column(Integer, ForeignKey("departamentos.dep_cod"), nullable=True)
    prov_dis = Column(Integer, nullable=True)
    prov_ciu = Column(Integer, nullable=True)
    prov_telefono = Column(String(50), nullable=True)
    prov_email = Column(String(100), nullable=True)
    prov_contacto = Column(String(100), nullable=True)
    prov_estado = Column(String(1), default='A')
    prov_tenantId = Column("prov_tenantid", Integer, nullable=False)
    prov_tipo_prov_id = Column(Integer, ForeignKey("tipo_proveedor.tipo_prov_id"), nullable=True)

    __table_args__ = (
        ForeignKeyConstraint(
            ['prov_dep', 'prov_dis'],
            ['distritos.dis_dep_cod', 'distritos.dis_cod'],
            name="fk_prov_dis"
        ),
        ForeignKeyConstraint(
            ['prov_dep', 'prov_dis', 'prov_ciu'],
            ['ciudades.ciu_dep_cod', 'ciudades.ciu_dis_cod', 'ciudades.ciu_cod'],
            name="fk_prov_ciu"
        ),
    )

    departamento = relationship("Departamento")
    distrito = relationship("Distrito", overlaps="departamento")
    ciudad = relationship("Ciudad", overlaps="departamento,distrito")
    tipo_proveedor = relationship("TipoProveedor")

class PagoFactura(Base):
    __tablename__ = "pago_facturas"
    pago_factura_id = Column(Integer, primary_key=True, index=True)
    pago_factura_nro_factura = Column(String(50), nullable=False)

    pago_factura_fecha = Column(Date, nullable=False)
    pago_factura_proveedor = Column(Integer, ForeignKey("proveedores.prov_id"), nullable=False)
    pago_factura_total = Column(DECIMAL(12, 2), nullable=False)
    pago_factura_estado = Column(String(30), default='PENDIENTE') # PENDIENTE, CANCELADA, CON PAGO PARCIAL
    pago_factura_tipo = Column(String(2)) # CO, CR

    usuario_alta = Column(String(100))
    fecha_alta = Column(DateTime(timezone=True), server_default=func.now())
    usuario_mod = Column(String(100))
    fecha_mod = Column(DateTime(timezone=True), onupdate=func.now())
    tenant_id = Column("pago_facturas_tenant_id", Integer, nullable=False)

    __table_args__ = (
        UniqueConstraint('pago_factura_nro_factura', 'pago_factura_fecha', 'pago_factura_proveedor', name='uix_pago_factura_nro_fecha_proveedor'),
    )

    proveedor = relationship("Proveedor")
    pagos = relationship("PagoFacturaPago", back_populates="pago_factura", cascade="all, delete-orphan")

class PagoFacturaPago(Base):
    __tablename__ = "pago_facturas_pagos"
    pago_factura_pago_id = Column(Integer, primary_key=True, index=True)
    pago_factura_id = Column(Integer, ForeignKey("pago_facturas.pago_factura_id", ondelete="CASCADE"), nullable=False)
    
    pago_facturas_forma_pago = Column(Integer, ForeignKey("forma_pago.forma_pago_id"), nullable=False)
    pago_facturas_pagos_banco = Column(Integer, ForeignKey("entidades_financieras.ent_id"), nullable=True)
    pago_facturas_pagos_nro_comprobante = Column(String(50), nullable=True)
    pago_facturas_pagos_cuenta_nro = Column(String(20), nullable=True)
    
    pago_facturas_pagos_fecha = Column(Date, nullable=False)
    pago_facturas_pagos_importe = Column(DECIMAL(12, 2), nullable=False)
    pago_facturas_pago_estado = Column(String(2), default='PR', nullable=False) # PE: PENDIENTE, PR: PAGO REALIZADO
    tenant_id = Column("pago_facturas_pagos_tenant_id", Integer, nullable=False)

    usuario_alta = Column(String(100))
    fecha_alta = Column(DateTime(timezone=True), server_default=func.now())
    usuario_mod = Column(String(100))
    fecha_mod = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (
        ForeignKeyConstraint(
            ['pago_facturas_pagos_banco', 'pago_facturas_pagos_cuenta_nro'],
            ['cuentas_bancarias.cuentas_bancarias_ent_id', 'cuentas_bancarias.cuentas_bancarias_nro_cuenta'],
            name='fk_pago_factura_pago_cuenta'
        ),
    )

    pago_factura = relationship("PagoFactura", back_populates="pagos")
    forma_pago = relationship("FormaPago")
    banco = relationship("EntidadFinanciera")
    cuenta = relationship("CuentaBancaria", 
                         primaryjoin="and_(PagoFacturaPago.pago_facturas_pagos_banco==CuentaBancaria.cuentas_bancarias_ent_id, PagoFacturaPago.pago_facturas_pagos_cuenta_nro==CuentaBancaria.cuentas_bancarias_nro_cuenta)",
                         foreign_keys=[pago_facturas_pagos_banco, pago_facturas_pagos_cuenta_nro],
                         overlaps="banco")
    auditoria = relationship("PagoFacturaAudit", back_populates="pago")

class PagoFacturaAudit(Base):
    __tablename__ = "pago_facturas_audit"
    pfa_id = Column(Integer, primary_key=True, index=True)
    pfa_pago_id = Column(Integer, ForeignKey("pago_facturas_pagos.pago_factura_pago_id", ondelete="CASCADE"))
    pfa_fecha = Column(DateTime(timezone=True), default=func.now())
    pfa_usuario = Column(String(100))
    pfa_data_anterior = Column(Text) # JSON string
    pfa_data_nueva = Column(Text)    # JSON string
    pfa_tenantId = Column(Integer, index=True)

    pago = relationship("PagoFacturaPago", back_populates="auditoria")

class Compra(Base):
    __tablename__ = "compras"
    comp_id = Column(Integer, primary_key=True, index=True)
    comp_prov_id = Column(Integer, ForeignKey("proveedores.prov_id"), nullable=False)
    comp_nro_factura = Column(String(50), nullable=True)
    comp_fecha = Column(DateTime(timezone=True), server_default=func.now())
    comp_total = Column(DECIMAL(12, 2), nullable=False, default=0)
    comp_estado = Column(String(1), default='A') # A=Activo, I=Anulado
    comp_tip_fac = Column(String(2), default='CO')
    comp_tenantId = Column("comp_tenantid", Integer, nullable=False)
    comp_usuario_alta = Column(String(100), nullable=True)

    proveedor = relationship("Proveedor")
    detalles = relationship("CompraDetalle", back_populates="compra", cascade="all, delete-orphan")

class CompraDetalle(Base):
    __tablename__ = "compra_detalles"
    cdet_id = Column(Integer, primary_key=True, index=True)
    cdet_comp_id = Column(Integer, ForeignKey("compras.comp_id", ondelete="CASCADE"), nullable=False)
    cdet_prod_id = Column(Integer, ForeignKey("productos.prod_id"), nullable=False)
    cdet_cantidad = Column(Integer, nullable=False)
    cdet_precio_unitario = Column(DECIMAL(12, 2), nullable=False)
    cdet_subtotal = Column(DECIMAL(12, 2), nullable=False)
    cdet_tenantId = Column("cdet_tenantid", Integer, nullable=False)
    
    # New fields
    cdet_lote = Column(String(20), nullable=True)
    cdet_vto = Column(Date, nullable=True)
    cdet_re = Column(String(20), nullable=True)
    cdet_rspa = Column(String(20), nullable=True)
    cdet_integridad = Column(String(10), default='OP') # OP, VE, AV
    cdet_envase = Column(String(10), default='OP') # OP, AV
    cdet_usu_res = Column(String(100), ForeignKey("usuarios.usuario_email"), nullable=True)

    compra = relationship("Compra", back_populates="detalles")
    producto = relationship("Producto")


class MovimientoStock(Base):
    __tablename__ = "movimientos_stock"
    mov_id = Column(Integer, primary_key=True, index=True)
    mov_prod_id = Column(Integer, ForeignKey("productos.prod_id"), nullable=False)
    mov_tipo = Column(String(1), nullable=False) # E=Entrada, S=Salida, A=Ajuste
    mov_cantidad = Column(Integer, nullable=False)
    mov_referencia = Column(String(150), nullable=True)
    mov_stock_anterior = Column(Integer, nullable=False)
    mov_stock_actual = Column(Integer, nullable=False)
    mov_fecha = Column(DateTime(timezone=True), server_default=func.now())
    mov_usuario = Column(String(100), nullable=True)
    mov_tenantId = Column("mov_tenantid", Integer, nullable=False)
    mov_prov_id = Column(Integer, ForeignKey("proveedores.prov_id"), nullable=True)

    producto = relationship("Producto")
    proveedor = relationship("Proveedor")

# ─── Logística — Centros de Entrega (ORM) ────────

# ─── Solicitudes de Mercadería ────────────────────────────────────────────────

class SolicitudMercaderia(Base):
    __tablename__ = "solicitudes_mercaderia"
    sol_id               = Column(Integer, primary_key=True, index=True)
    sol_centro_id        = Column(Integer, ForeignKey("centros_entrega.centro_id"), nullable=False)
    sol_fecha            = Column(Date, nullable=False, server_default=func.current_date())
    sol_fecha_requerida  = Column(Date, nullable=True)
    sol_estado           = Column(String(20), nullable=False, default='PENDIENTE')
    # PENDIENTE / APROBADA / EN_PROCESO / ENTREGADA / CANCELADA
    sol_observaciones    = Column(Text, nullable=True)
    sol_usuario_alta     = Column(String(100), nullable=True)
    sol_fecha_alta       = Column(DateTime(timezone=True), server_default=func.now())
    sol_usuario_mod      = Column(String(100), nullable=True)
    sol_fecha_mod        = Column(DateTime(timezone=True), onupdate=func.now())
    sol_tenantId         = Column("sol_tenantid", Integer, nullable=False)

    centro    = relationship("CentroEntrega")
    detalles  = relationship("SolicitudMercaderiaDetalle", back_populates="solicitud", cascade="all, delete-orphan")
    trazabilidad = relationship("SolicitudMercaderiaTrazabilidad", back_populates="solicitud", cascade="all, delete-orphan", order_by="SolicitudMercaderiaTrazabilidad.traz_id")
    recepciones = relationship("RecepcionMercaderia", back_populates="solicitud", cascade="all, delete-orphan")

    @property
    def centro_nombre(self):
        return self.centro.centro_nombre if self.centro else None

    @property
    def centro_encargado(self):
        return self.centro.usuario_contacto.usuario_nombre if (self.centro and self.centro.usuario_contacto) else None


class SolicitudMercaderiaDetalle(Base):
    __tablename__ = "solicitudes_mercaderia_det"
    sdet_id           = Column(Integer, primary_key=True, index=True)
    sdet_sol_id       = Column(Integer, ForeignKey("solicitudes_mercaderia.sol_id", ondelete="CASCADE"), nullable=False)
    sdet_prod_id      = Column(Integer, ForeignKey("productos.prod_id"), nullable=False)
    sdet_cantidad     = Column(DECIMAL(12, 3), nullable=False, default=1)
    sdet_unidad       = Column(String(20), nullable=True)
    sdet_observacion  = Column(String(255), nullable=True)
    sdet_tenantId     = Column("sdet_tenantid", Integer, nullable=False)
    sdet_cant_dev     = Column(Numeric(12, 3), nullable=True, default=0)

    solicitud = relationship("SolicitudMercaderia", back_populates="detalles")
    producto  = relationship("Producto")

    @property
    def prod_nombre(self):
        return self.producto.prod_nombre if self.producto else None

    @property
    def prod_codigo(self):
        return self.producto.prod_codigo if self.producto else None

    @property
    def sdet_cant_recibida(self):
        if not self.solicitud or not self.solicitud.recepciones:
            return 0
        total = 0
        for rec in self.solicitud.recepciones:
            for r_det in rec.detalles:
                if r_det.rd_prod_id == self.sdet_prod_id:
                    total += r_det.rd_cant_recibida
        return total

class SolicitudMercaderiaTrazabilidad(Base):
    __tablename__ = "trazabilidad_solicitud_mercaderia"
    traz_id      = Column(Integer, primary_key=True, index=True)
    traz_sol_id  = Column(Integer, ForeignKey("solicitudes_mercaderia.sol_id", ondelete="CASCADE"), nullable=False)
    traz_estado  = Column(String(50), nullable=False)
    traz_usuario = Column(String(100), nullable=False)
    traz_fecha   = Column(DateTime(timezone=True), server_default=func.now())
    traz_tenantId = Column("traz_tenantid", Integer, nullable=False)

    solicitud = relationship("SolicitudMercaderia", back_populates="trazabilidad")
    
    # Relationship to get user name
    usuario_rel = relationship("Usuario", 
                              primaryjoin=and_(
                                  traz_usuario == Usuario.usuario_email,
                                  traz_tenantId == Usuario.usuario_tenantId
                              ),
                              foreign_keys=[traz_usuario, traz_tenantId],
                              viewonly=True)

    @property
    def usuario_nombre(self):
        if self.usuario_rel:
            return self.usuario_rel.usuario_nombre
        # Fallback: Si es un email, formatear de forma amigable si no se encontró en la DB
        if self.traz_usuario and '@' in self.traz_usuario:
            name_part = self.traz_usuario.split('@')[0]
            return name_part.replace('.', ' ').title()
        return self.traz_usuario


# ─── Recepciones de Mercadería ────────────────────────────────────────────────

class RecepcionMercaderia(Base):
    __tablename__ = "recepciones_mercaderia"
    rec_id = Column(Integer, primary_key=True, index=True)
    rec_solicitud_id = Column(Integer, ForeignKey("solicitudes_mercaderia.sol_id"), nullable=False)
    rec_centro_id = Column(Integer, ForeignKey("centros_entrega.centro_id"), nullable=False)
    rec_comentario = Column(Text, nullable=True)
    rec_tenantId = Column("rec_tenantid", Integer, nullable=False)
    
    # Auditoria
    rec_usuario_alta = Column(String(50), nullable=False)
    rec_fecha_alta = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    rec_usuario_mod = Column(String(50), nullable=True)
    rec_fecha_mod = Column(DateTime(timezone=True), onupdate=func.now())

    solicitud = relationship("SolicitudMercaderia", back_populates="recepciones")
    centro = relationship("CentroEntrega")
    detalles = relationship("RecepcionMercaderiaDetalle", back_populates="recepcion", cascade="all, delete-orphan")


class RecepcionMercaderiaDetalle(Base):
    __tablename__ = "recepciones_mercaderia_detalle"
    rd_id = Column(Integer, primary_key=True, index=True)
    rd_recepcion_id = Column(Integer, ForeignKey("recepciones_mercaderia.rec_id", ondelete="CASCADE"), nullable=False)
    rd_prod_id = Column(Integer, ForeignKey("productos.prod_id"), nullable=False)
    rd_cant_solicitada = Column(Numeric(12, 3), nullable=False)
    rd_cant_recibida = Column(Numeric(12, 3), nullable=False)
    rd_tenantId = Column("rd_tenantid", Integer, nullable=False)

    recepcion = relationship("RecepcionMercaderia", back_populates="detalles")
    producto = relationship("Producto")



# --- Recetas / Producción ---
class Receta(Base):
    __tablename__ = "recetas"
    rec_id = Column(Integer, primary_key=True, index=True)
    rec_nombre = Column(String(150), nullable=False)
    rec_descripcion = Column(Text, nullable=True)
    rec_estado = Column(String(1), default='A', nullable=False)
    rec_tenantId = Column("rec_tenantid", Integer, nullable=False)
    
    # Audit fields
    rec_usuario_alta = Column(String(100), nullable=True)
    rec_fecha_alta = Column(DateTime(timezone=True), server_default=func.now())
    rec_usuario_mod = Column(String(100), nullable=True)
    rec_fecha_mod = Column(DateTime(timezone=True), onupdate=func.now())
    
    ingredientes = relationship("RecetaDetalle", back_populates="receta", cascade="all, delete-orphan")

class RecetaDetalle(Base):
    __tablename__ = "receta_detalles"
    rd_id = Column(Integer, primary_key=True, index=True)
    rd_receta_id = Column(Integer, ForeignKey("recetas.rec_id", ondelete="CASCADE"), nullable=False)
    rd_prod_id = Column(Integer, ForeignKey("productos.prod_id"), nullable=False)
    rd_cantidad = Column(DECIMAL(12, 3), nullable=False)
    rd_tenantId = Column("rd_tenantid", Integer, nullable=False, default=1)

    receta = relationship("Receta", back_populates="ingredientes")
    producto = relationship("Producto", foreign_keys=[rd_prod_id])

class SegEmailLog(Base):
    __tablename__ = "seg_email_log"
    log_id = Column(Integer, primary_key=True, index=True)
    log_destinatario = Column(String(150), nullable=False)
    log_asunto = Column(String(200), nullable=False)
    log_cuerpo = Column(Text, nullable=True)
    log_fecha = Column(DateTime(timezone=True), server_default=func.now())
    log_estado = Column(String(20), default='PENDIENTE') # ENVIADO, ERROR, PENDIENTE
    log_error = Column(Text, nullable=True)
    log_tenantId = Column("log_tenantid", Integer, nullable=False, default=1)

class RestriccionCampo(Base):
    __tablename__ = "restricciones_campos"
    __table_args__ = (
        UniqueConstraint('tabla', 'columna', name='uix_tabla_columna'),
    )
    
    id = Column(Integer, primary_key=True, index=True)
    tabla = Column(String(100), nullable=False)
    columna = Column(String(100), nullable=False)
    oculto = Column(Boolean, default=False)
    editable = Column(Boolean, default=True)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())

class PlanificacionMensual(Base):
    __tablename__ = "planificacion_mensual"
    plan_id = Column(Integer, primary_key=True, index=True)
    plan_receta_id = Column(Integer, ForeignKey("recetas.rec_id"), nullable=False)
    plan_fecha = Column(Date, nullable=False)
    plan_tipo_comida = Column(String(2), nullable=False) # DE, AL, PO, ME, CE
    plan_tenantId = Column("plan_tenantid", Integer, nullable=False, default=1)
    
    # Auditoría
    plan_usuario_alta = Column(String(100), nullable=True)
    plan_fecha_alta = Column(DateTime(timezone=True), server_default=func.now())
    plan_usuario_mod = Column(String(100), nullable=True)
    plan_fecha_mod = Column(DateTime(timezone=True), onupdate=func.now())

    receta = relationship("Receta")


class HistorialSolicitudProductos(Base):
    __tablename__ = "hst_solic_productos"
    hsp_id      = Column(Integer, primary_key=True, index=True)
    hsp_fecha   = Column(DateTime(timezone=True), server_default=func.now())
    hsp_usuario = Column(String(100), nullable=False)
    hsp_label   = Column(String(200), nullable=True)
    hsp_tenantId = Column("hsp_tenantid", Integer, nullable=False, default=1)
    
    detalles = relationship("HistorialSolicitudProductosDetalle", back_populates="solicitud", cascade="all, delete-orphan")

class HistorialSolicitudProductosDetalle(Base):
    __tablename__ = "hst_solic_productos_det"
    hspd_id           = Column(Integer, primary_key=True, index=True)
    hspd_solic_id     = Column(Integer, ForeignKey("hst_solic_productos.hsp_id", ondelete="CASCADE"), nullable=False)
    hspd_prod_id      = Column(Integer, nullable=True)
    hspd_prod_nombre  = Column(String(200), nullable=False)
    hspd_cantidad     = Column(DECIMAL(12, 3), nullable=False)
    hspd_unidad       = Column(String(50), nullable=True)
    hspd_tenantId     = Column("hspd_tenantid", Integer, nullable=False, default=1)

    solicitud = relationship("HistorialSolicitudProductos", back_populates="detalles")

class CategoriaNotificacion(Base):
    __tablename__ = "categoria_notificaciones"
    cat_not_id     = Column(Integer, primary_key=True, index=True)
    cat_not_dsc    = Column(String(100), nullable=False)
    cat_not_tenantId = Column("cat_not_tenantid", Integer, nullable=False)
    # Auditory
    usuario_alta   = Column(String(100))
    fecha_alta     = Column(DateTime(timezone=True), server_default=func.now())
    usuario_mod    = Column(String(100))
    fecha_mod      = Column(DateTime(timezone=True), onupdate=func.now())

class ListaCorreo(Base):
    __tablename__ = "listas_correo"
    lis_cor_id     = Column(Integer, primary_key=True, index=True)
    lis_cor_mail   = Column(String(200), nullable=False)
    lis_cor_cat_id = Column(Integer, ForeignKey("categoria_notificaciones.cat_not_id"), nullable=False)
    lis_cor_tenantId = Column("lis_cor_tenantid", Integer, nullable=False)
    # Auditory
    usuario_alta   = Column(String(100))
    fecha_alta     = Column(DateTime(timezone=True), server_default=func.now())
    usuario_mod    = Column(String(100))
    fecha_mod      = Column(DateTime(timezone=True), onupdate=func.now())

    categoria = relationship("CategoriaNotificacion")


# ─── Gestión de Cargas de Móviles ──────────────────────────────────────────────

class CargaMovil(Base):
    __tablename__ = "carga_movil"
    carga_id = Column(Integer, primary_key=True, index=True)
    carga_movil_id = Column(Integer, ForeignKey("moviles.movil_id"), nullable=False)
    carga_fecha = Column(Date, nullable=False, server_default=func.current_date())
    carga_estado = Column(String(20), nullable=False, default='EN_PROCESO')
    # EN_PROCESO, COMPLETADA, TRANSITO, ENTREGADA, CANCELADA

    carga_chofer_doc = Column(String(20), ForeignKey("personal_entrega.personal_documento"), nullable=True)
    carga_acomp_doc = Column(String(20), ForeignKey("personal_entrega.personal_documento"), nullable=True)
    
    carga_viatico = Column(DECIMAL(15, 2), default=0)
    carga_tot_ren = Column(DECIMAL(15, 2), default=0)
    carga_estado_ren = Column(String(5), default="ER") # ER: En Rendicion (In Settlement), RC: Rendición Cerrada (Settlement Closed)
    carga_observacion = Column(Text, nullable=True)
    carga_total_kg = Column(DECIMAL(12, 3), default=0) # Calculated or Snapshot

    carga_tenantid = Column(Integer, nullable=False)
    carga_usuario_alta = Column(String(100), nullable=True)
    carga_fecha_alta = Column(DateTime(timezone=True), server_default=func.now())
    carga_usuario_mod = Column(String(100), nullable=True)
    carga_fecha_mod = Column(DateTime(timezone=True), onupdate=func.now())

    # Relaciones
    movil = relationship("Movil")
    chofer = relationship("PersonalEntrega", foreign_keys=[carga_chofer_doc])
    acompanante = relationship("PersonalEntrega", foreign_keys=[carga_acomp_doc])
    detalles = relationship("CargaMovilDetalle", back_populates="carga", cascade="all, delete-orphan")
    rendiciones = relationship("RendicionMovil", back_populates="carga", cascade="all, delete-orphan")

class CargaMovilDetalle(Base):
    __tablename__ = "carga_movil_detalle"
    cdet_id = Column(Integer, primary_key=True, index=True)
    cdet_carga_id = Column(Integer, ForeignKey("carga_movil.carga_id", ondelete="CASCADE"), nullable=False)
    cdet_sol_id = Column(Integer, ForeignKey("solicitudes_mercaderia.sol_id"), nullable=False)
    cdet_tenantid = Column(Integer, nullable=False)

    carga = relationship("CargaMovil", back_populates="detalles")
    solicitud = relationship("SolicitudMercaderia")
    prod_peso_kg = Column(Numeric(10, 3), default=0)

class RendicionMovil(Base):
    __tablename__ = "rendicion_movil"
    ren_mov_id = Column(Integer, primary_key=True, index=True)
    carga_id = Column(Integer, ForeignKey("carga_movil.carga_id", ondelete="CASCADE"), nullable=False)
    ren_mov_dsc = Column(String(100), nullable=False)
    ren_mov_tot = Column(Numeric(15, 2), nullable=False, default=0)
    ren_mov_tenantId = Column("ren_mov_tenantid", Integer, nullable=False, default=1)

    # Auditoria
    usuario_alta = Column(String(100))
    fecha_alta = Column(DateTime(timezone=True), server_default=func.now())

    carga = relationship("CargaMovil", back_populates="rendiciones")

class ProcesoAgendado(Base):
    __tablename__ = "procesos_agendados"
    
    proc_id = Column(Integer, primary_key=True, index=True)
    proc_nombre = Column(String(100), nullable=False)
    proc_descripcion = Column(Text)
    proc_frecuencia = Column(String(50)) # DIARIO, SEMANAL, MENSUAL, CADA X MIN
    proc_hora = Column(String(5)) # HH:MM
    proc_dias_semana = Column(String(100)) # "1,2,3,4,5" (1=Lun, 7=Dom)
    proc_dia_mes = Column(Integer) # 1-31
    proc_accion = Column(String(100), nullable=False)
    proc_proxima_ejecucion = Column(DateTime(timezone=True))
    proc_ultima_ejecucion = Column(DateTime(timezone=True))
    proc_ultimo_resultado = Column(Text)
    proc_estado_ejecucion = Column(String(20), default="PENDIENTE")
    proc_activo = Column(Boolean, default=True)
    proc_tenantId = Column("proc_tenantid", Integer, nullable=False)
    proc_usuario_mod = Column(String(100))
    proc_fecha_mod = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class HstConsumoCentroEntrega(Base):
    __tablename__ = "hst_consumo_centro_entrega"
    hcce_id = Column(Integer, primary_key=True, index=True)
    hcce_fecha_plan = Column(Date, nullable=False)
    hcce_centro_id = Column(Integer, ForeignKey("centros_entrega.centro_id"), nullable=False)
    hcce_receta_id = Column(Integer, ForeignKey("recetas.rec_id"), nullable=False)
    hcce_prod_id = Column(Integer, ForeignKey("productos.prod_id"), nullable=False)
    hcce_cantidad = Column(Numeric(12, 3), nullable=False)
    hcce_beneficiarios = Column(Integer, nullable=False)
    hcce_estado = Column(String(20), default='PROCESADO') # PROCESADO, REVERTIDO
    hcce_tenantid = Column(Integer, nullable=False)
    hcce_fecha_ejecucion = Column(DateTime(timezone=True), server_default=func.now())
    hcce_usuario_ejecucion = Column(String(100))

    centro = relationship("CentroEntrega")
    receta = relationship("Receta")
    producto = relationship("Producto")

class TipoGasto(Base):
    __tablename__ = "tipos_gastos"
    tip_gas_id = Column(Integer, primary_key=True)
    tip_gas_dsc = Column(String(255), nullable=False)
    tip_gas_usuario_alta = Column(String(100), nullable=False)
    tip_gas_fecha_alta = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    tip_gas_usuario_mod = Column(String(100), nullable=True)
    tip_gas_fecha_mod = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)


class GastoPorPeriodo(Base):
    __tablename__ = "gastos_por_periodo"
    gas_per_anio = Column(Integer, primary_key=True)
    gas_per_mes = Column(Integer, primary_key=True)
    gas_per_tip_gas_id = Column(Integer, ForeignKey("tipos_gastos.tip_gas_id", ondelete="CASCADE"), primary_key=True)
    gas_per_monto = Column(DECIMAL(12, 2), nullable=False, default=0)
    
    # Audit
    gas_per_usuario_alta = Column(String(100), nullable=False)
    gas_per_fecha_alta = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    gas_per_usuario_mod = Column(String(100), nullable=True)
    gas_per_fecha_mod = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
    
    # Relationship
    tipo_gasto = relationship("TipoGasto")

class ConceptoIngEgr(Base):
    __tablename__ = "conceptos_ing_egr"
    con_ing_egr_cod = Column(Integer, primary_key=True)
    con_ing_egr_dsc = Column(String(255), nullable=False)
    con_ing_egr_tipo = Column(String(1), nullable=False) # 'I' o 'E'
    con_ing_egr_usuario_alta = Column(String(100))
    con_ing_egr_fecha_alta = Column(DateTime(timezone=True), server_default=func.now())
    con_ing_egr_usuario_mod = Column(String(100))
    con_ing_egr_fecha_mod = Column(DateTime(timezone=True))

class CajaIngEgr(Base):
    __tablename__ = "caja_ing_egr"
    caja_ie_id = Column(Integer, primary_key=True)
    caja_ie_fecha = Column(DateTime(timezone=True), server_default=func.now())
    caja_ie_concepto_cod = Column(Integer, ForeignKey("conceptos_ing_egr.con_ing_egr_cod"), nullable=False)
    caja_ie_tipo = Column(String(1), nullable=False) # 'I' o 'E'
    caja_ie_monto = Column(DECIMAL(15, 2), nullable=False)
    caja_ie_cliente_doc = Column(String(20), ForeignKey("clientes.cli_documento"), nullable=True)
    caja_ie_observacion = Column(Text, nullable=True)
    caja_ie_sesion_id = Column(Integer, nullable=True)
    caja_ie_tenantId = Column("caja_ie_tenantid", Integer, nullable=False, default=1)
    caja_ie_usuario_alta = Column(String(100), nullable=False)
    caja_ie_nro_recibo = Column(String(20), nullable=True)  # Número correlativo asignado desde tabla numerador

    concepto = relationship("ConceptoIngEgr")
    cliente = relationship("Cliente")

class Numerador(Base):
    """Tabla de secuencias correlativas por tipo de comprobante."""
    __tablename__ = "numerador"
    num_tipo        = Column(String(3), primary_key=True)          # 'REC', 'TIK', 'MOV', etc.
    num_ultimo      = Column(BigInteger, nullable=False, default=0) # Último número emitido
    num_descripcion = Column(String(100), nullable=True)
    num_fecha_mod   = Column(DateTime, server_default=func.now(), onupdate=func.now())



