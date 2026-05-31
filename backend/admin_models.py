from sqlalchemy import Column, Integer, String, Boolean, DECIMAL, ForeignKey, DateTime, Date, Text, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid

class Plan(Base):
    __tablename__ = "planes"
    __table_args__ = {"schema": "public"}
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())

    suscripciones = relationship("Suscripcion", back_populates="plan")
    cobros = relationship("PlanCobro", back_populates="plan", cascade="all, delete-orphan")

class PlanCobro(Base):
    __tablename__ = "plan_cobros"
    __table_args__ = {"schema": "public"}
    
    plan_cob_id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("public.planes.id", ondelete="CASCADE"), nullable=False)
    plan_cob_tipo_cobro = Column(String(50), nullable=False)
    plan_cob_monto_base = Column(DECIMAL(15, 2), nullable=False, default=0.00)
    plan_cob_activo = Column(Boolean, default=True)
    
    plan_cob_usr_usuario_alta = Column(String(50), nullable=False)
    plan_cob_usr_fecha_alta = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    plan_cob_usr_usuario_mod = Column(String(50))
    plan_cob_usr_fecha_mod = Column(DateTime(timezone=True))
    
    plan = relationship("Plan", back_populates="cobros")
    tramos = relationship("PlanCobroTramo", back_populates="cobro", cascade="all, delete-orphan")

class PlanCobroTramo(Base):
    __tablename__ = "plan_cobros_tramos"
    __table_args__ = {"schema": "public"}
    
    plan_cob_tra_id = Column(Integer, primary_key=True, index=True)
    plan_cob_id = Column(Integer, ForeignKey("public.plan_cobros.plan_cob_id", ondelete="CASCADE"), nullable=False)
    plan_cob_tra_rango_desde = Column(Integer, nullable=False)
    plan_cob_tra_rango_hasta = Column(Integer)
    plan_cob_tra_monto_por_tramo = Column(DECIMAL(15, 2), nullable=False)
    
    plan_cob_tra_usr_usuario_alta = Column(String(50), nullable=False)
    plan_cob_tra_usr_fecha_alta = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    plan_cob_tra_usr_usuario_mod = Column(String(50))
    plan_cob_tra_usr_fecha_mod = Column(DateTime(timezone=True))
    
    cobro = relationship("PlanCobro", back_populates="tramos")


class Sistema(Base):
    __tablename__ = "sistemas"
    __table_args__ = {"schema": "public"}
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False, unique=True)
    descripcion = Column(Text)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())
    
    maestro_clientes = relationship("MaestroCliente", back_populates="sistema")

class MaestroCliente(Base):
    __tablename__ = "maestro_clientes"
    __table_args__ = {"schema": "public"}
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre_comercial = Column(String(100), nullable=False)
    ruc = Column(String(20), unique=True)
    url_slug = Column(String(50), nullable=False, unique=True, index=True)
    db_schema = Column(String(50), nullable=False, unique=True)
    email_contacto = Column(String(100))
    estado = Column(Boolean, default=True)
    sistema_id = Column(Integer, ForeignKey("public.sistemas.id"))
    logo_url = Column(Text)
    config_json = Column(JSONB)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())

    sistema = relationship("Sistema", back_populates="maestro_clientes")
    suscripciones = relationship("Suscripcion", back_populates="maestro_cliente")

class Suscripcion(Base):
    __tablename__ = "suscripciones"
    __table_args__ = {"schema": "public"}
    
    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(UUID(as_uuid=True), ForeignKey("public.maestro_clientes.id"))
    plan_id = Column(Integer, ForeignKey("public.planes.id"))
    fecha_inicio = Column(Date, nullable=False)
    esta_activa = Column(Boolean, default=True)

    maestro_cliente = relationship("MaestroCliente", back_populates="suscripciones")
    plan = relationship("Plan", back_populates="suscripciones")

class UsuarioAdmin(Base):
    __tablename__ = "usuarios_admin"
    __table_args__ = {"schema": "public"}
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    nombre = Column(String(100))

class AuditoriaAdmin(Base):
    __tablename__ = "auditoria_admin"
    __table_args__ = {"schema": "public"}
    
    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("public.usuarios_admin.id"))
    accion = Column(String(50), nullable=False) # ej: CREATE, UPDATE, DELETE
    recurso = Column(String(50), nullable=False) # ej: maestro_clientes, planes
    recurso_id = Column(String(100))
    detalle = Column(Text) # Descripción legible
    valores_anteriores = Column(JSONB)
    valores_nuevos = Column(JSONB)
    ip_address = Column(String(45))
    fecha = Column(DateTime(timezone=True), server_default=func.now())

    admin = relationship("UsuarioAdmin")

class SegEmailLog(Base):
    __tablename__ = "seg_email_log"
    __table_args__ = {"schema": "public"}
    
    log_id = Column(Integer, primary_key=True, index=True)
    log_fecha = Column(DateTime(timezone=True), server_default=func.now())
    log_destinatario = Column(String(200), nullable=False)
    log_asunto = Column(String(200), nullable=False)
    log_cuerpo = Column(Text, nullable=True)
    log_estado = Column(String(20), default='PENDIENTE') # PENDIENTE, ENVIADO, ERROR
    log_error = Column(Text, nullable=True)
    log_tenantId = Column("log_tenantid", UUID(as_uuid=True), nullable=True)
