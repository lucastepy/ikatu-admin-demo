-- Módulo de Facturación, Inventario y Cobranzas - easy_ventas

-- 1. Modelo de Datos: Inventario y Ventas
-- A. Gestión de Productos
CREATE TABLE productos (
    prod_id SERIAL PRIMARY KEY,
    prod_codigo VARCHAR(50) UNIQUE NOT NULL, -- SKU o Código de barras
    prod_nombre VARCHAR(150) NOT NULL,       -- Ej: "Heladera Samsung Inverter"
    prod_marca VARCHAR(50),
    prod_categoria VARCHAR(50),              -- Linea Blanca, TV, Audio
    prod_precio_costo DECIMAL(12,2),
    prod_precio_contado DECIMAL(12,2),       -- Precio con descuento por efectivo
    prod_precio_lista DECIMAL(12,2),         -- Precio base para financiar
    prod_garantia_meses INT DEFAULT 12,      -- Duración de garantía
    prod_stock_actual INT DEFAULT 0,
    prod_tenantId INT NOT NULL               -- Aislamiento multicliente
);

-- Tabla para rastrear cada unidad física (Garantía y Trazabilidad)
CREATE TABLE series_productos (
    serie_id SERIAL PRIMARY KEY,
    serie_numero VARCHAR(100) NOT NULL,      -- El Nro de serie del fabricante
    serie_prodId INT REFERENCES productos(prod_id),
    serie_estado VARCHAR(20) DEFAULT 'DISPONIBLE', -- DISPONIBLE, VENDIDO, DEFECTUOSO
    serie_ventaId INT,                       -- Se llena al venderse
    serie_tenantId INT NOT NULL
);

-- B. Módulo de Ventas (Cabecera)
-- Asumimos existencia de tabla 'clientes'. Si no existe, se deberá crear o referenciar.
-- Placeholder para clientes si no existe en este script (referencia externa asumida por contexto).
-- CREATE TABLE IF NOT EXISTS clientes (cliente_nroDoc VARCHAR(15) PRIMARY KEY, ...);

CREATE TABLE ventas (
    venta_id BIGSERIAL PRIMARY KEY,
    venta_fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    venta_clienteDoc VARCHAR(15), -- REFERENCES clientes(cliente_nroDoc) - Descomentar si la tabla existe
    venta_condicion VARCHAR(10) CHECK (venta_condicion IN ('CONTADO', 'CREDITO')),
    venta_total DECIMAL(12,2) NOT NULL,
    venta_entrega_inicial DECIMAL(12,2) DEFAULT 0, -- Down payment (para créditos)
    venta_saldo_financiar DECIMAL(12,2) DEFAULT 0, -- Lo que se va a cuotas
    venta_estado VARCHAR(20) DEFAULT 'FINALIZADA', -- PENDIENTE, APROBACION_CREDITO, FINALIZADA, ANULADA
    venta_vendedorId INT,
    venta_tenantId INT NOT NULL
);

CREATE TABLE venta_detalles (
    det_id BIGSERIAL PRIMARY KEY,
    det_ventaId BIGINT REFERENCES ventas(venta_id),
    det_prodId INT REFERENCES productos(prod_id),
    det_cantidad INT NOT NULL,
    det_precio_unitario DECIMAL(12,2) NOT NULL,
    det_subtotal DECIMAL(12,2) NOT NULL,
    det_tenantId INT NOT NULL
);

-- C. El Corazón del Crédito: Tabla de Cuotas
CREATE TABLE cuotas (
    cuota_id BIGSERIAL PRIMARY KEY,
    cuota_ventaId BIGINT REFERENCES ventas(venta_id),
    cuota_numero INT NOT NULL,               -- 1, 2, 3...
    cuota_vencimiento DATE NOT NULL,
    cuota_monto_capital DECIMAL(12,2),       -- Parte que cubre el producto
    cuota_monto_interes DECIMAL(12,2),       -- Ganancia financiera
    cuota_monto_total DECIMAL(12,2) NOT NULL,-- Lo que paga el cliente
    cuota_saldo DECIMAL(12,2) NOT NULL,      -- Cuánto falta pagar de esta cuota
    cuota_estado VARCHAR(20) DEFAULT 'PENDIENTE', -- PENDIENTE, PAGADO, VENCIDO, MOROSO
    cuota_fecha_pago TIMESTAMP,              -- Cuándo se pagó realmente
    cuota_recargo_mora DECIMAL(12,2) DEFAULT 0,
    cuota_tenantId INT NOT NULL
);

-- 5. Módulo de Tesorería y Cobranzas
-- A. Estructura de Tablas

-- 1. CONTROL DE CAJA
CREATE TABLE cajas_sesiones (
    sesion_id SERIAL PRIMARY KEY,
    sesion_usuario VARCHAR(50) NOT NULL,
    sesion_fecha_apertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sesion_fecha_cierre TIMESTAMP,
    sesion_monto_inicial DECIMAL(12,2) NOT NULL, -- "Sencillo" o cambio inicial
    sesion_monto_final DECIMAL(12,2),            -- Lo que el cajero cuenta al cerrar
    sesion_estado VARCHAR(20) DEFAULT 'ABIERTA', -- ABIERTA, CERRADA, ARQUEADA
    sesion_tenantId INT NOT NULL
);

-- 2. CABECERA DEL PAGO
CREATE TABLE pagos (
    pago_id BIGSERIAL PRIMARY KEY,
    pago_nro_recibo VARCHAR(50),             -- Número legal del comprobante
    pago_clienteDoc VARCHAR(15), -- REFERENCES clientes(cliente_nroDoc)
    pago_fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pago_monto_total DECIMAL(12,2) NOT NULL, -- Total abonado en esta transacción
    pago_sesionId INT REFERENCES cajas_sesiones(sesion_id),
    pago_observacion TEXT,
    pago_estado VARCHAR(20) DEFAULT 'CONFIRMADO', -- CONFIRMADO, ANULADO
    pago_tenantId INT NOT NULL,
    pago_creadoPor VARCHAR(50)
);

-- 7. Módulo de Entidades Financieras
-- Tabla Maestra de Entidades
CREATE TABLE entidades_financieras (
    ent_id SERIAL PRIMARY KEY,
    ent_nombre VARCHAR(100) NOT NULL, -- Ej: "Banco Itaú", "Visión Banco", "Tigo Money"
    ent_tipo VARCHAR(50),             -- 'BANCO', 'COOPERATIVA', 'BILLETERA', 'PROCESADORA'
    ent_activo BOOLEAN DEFAULT TRUE,  -- Para ocultar bancos que ya no se usan
    -- ent_tenantId INT NOT NULL REFERENCES tenants(tenant_id), -- Asumiendo tabla tenants
    ent_tenantId INT NOT NULL,
    ent_creadoPor VARCHAR(50)
);

-- 3. FORMAS DE PAGO (Modificada con Entidades)
CREATE TABLE pagos_metodos (
    met_id BIGSERIAL PRIMARY KEY,
    met_pagoId BIGINT REFERENCES pagos(pago_id),
    met_tipo VARCHAR(50) NOT NULL, -- 'EFECTIVO', 'TARJETA_DEBITO', 'TARJETA_CREDITO', 'CHEQUE', 'TRANSFERENCIA'
    met_monto DECIMAL(12,2) NOT NULL,
    met_entidadId INT REFERENCES entidades_financieras(ent_id), -- FK hacia la nueva tabla
    met_referencia VARCHAR(100),   -- Nro de Boleta, Cheque o Lote
    met_tenantId INT NOT NULL
);

-- 4. IMPUTACIÓN
CREATE TABLE pagos_imputaciones (
    imp_id BIGSERIAL PRIMARY KEY,
    imp_pagoId BIGINT REFERENCES pagos(pago_id),
    imp_cuotaId BIGINT REFERENCES cuotas(cuota_id),
    imp_monto_capital DECIMAL(12,2) DEFAULT 0, -- Cuánto cubrió del capital
    imp_monto_interes DECIMAL(12,2) DEFAULT 0, -- Cuánto cubrió del interés
    imp_monto_mora DECIMAL(12,2) DEFAULT 0,    -- Cuánto cubrió de la mora
    imp_tenantId INT NOT NULL
);

-- 6. Configuración Financiera y Cálculo de Mora
-- TABLA: POLÍTICAS DE CRÉDITO
CREATE TABLE politicas_credito (
    pol_id SERIAL PRIMARY KEY,
    -- pol_tenantId INT NOT NULL REFERENCES tenants(tenant_id),
    pol_tenantId INT NOT NULL,
    
    -- Tasa diaria aplicada al Capital vencido (Ej: 0.1% = 0.001)
    pol_tasa_moratoria_diaria DECIMAL(10,6) DEFAULT 0.001000, 
    
    -- Tasa diaria aplicada sobre el monto de la Mora calculada (Interés sobre interés)
    pol_tasa_punitoria_diaria DECIMAL(10,6) DEFAULT 0.000500,
    
    -- Días de gracia antes de empezar a cobrar mora (Opcional)
    pol_dias_gracia INT DEFAULT 0,
    
    -- Configuración de impuestos sobre intereses (IVA)
    pol_iva_intereses DECIMAL(5,2) DEFAULT 10.00,
    
    pol_modificadoPor VARCHAR(50),
    pol_fecModificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Actualización a la tabla CUOTAS
ALTER TABLE cuotas 
ADD COLUMN cuota_monto_moratorio_pagado DECIMAL(12,2) DEFAULT 0,
ADD COLUMN cuota_monto_punitorio_pagado DECIMAL(12,2) DEFAULT 0,
ADD COLUMN cuota_dias_atraso_calculado INT DEFAULT 0;
