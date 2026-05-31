-- SCRIPT GENERADO AUTOMÁTICAMENTE PARA COMENTARIOS DE COLUMNAS
-- Siguiendo formato: Cód.Tabla, Nom.Tabla, Dsc.Tabla
-- Ejecutar este script en el esquema correspondiente del inquilino

-- Tabla: categorias
COMMENT ON COLUMN categorias.cat_id IS 'Cód.Categorias';
COMMENT ON COLUMN categorias.cat_nombre IS 'Nom.Categorias';
COMMENT ON COLUMN categorias.cat_tenantid IS 'ID de Inquilino (Tenant)';

-- Tabla: marcas
COMMENT ON COLUMN marcas.marca_id IS 'Cód.Marca';
COMMENT ON COLUMN marcas.marca_nombre IS 'Nom.Marca';
COMMENT ON COLUMN marcas.marca_tenantid IS 'Marca tenantid';

-- Tabla: productos
COMMENT ON COLUMN productos.prod_id IS 'I.Producto';
COMMENT ON COLUMN productos.prod_codigo IS 'Cód.Producto';
COMMENT ON COLUMN productos.prod_nombre IS 'Nom.Producto';
COMMENT ON COLUMN productos.prod_marca_id IS 'Cód.Marca';
COMMENT ON COLUMN productos.prod_categoria_id IS 'Cód.Categoría';
COMMENT ON COLUMN productos.prod_precio_costo IS 'Precio Costo';
COMMENT ON COLUMN productos.prod_precio_contado IS 'Precio Contado';
COMMENT ON COLUMN productos.prod_garantia_meses IS 'Garantia meses';
COMMENT ON COLUMN productos.prod_stock_actual IS 'Stock actual';
COMMENT ON COLUMN productos.prod_imagen_url IS 'Imagen url';
COMMENT ON COLUMN productos.prod_tenantid IS 'ID de Inquilino (Tenant)';

-- Tabla: clientes
COMMENT ON COLUMN clientes.cli_documento IS 'Nº Documento';
COMMENT ON COLUMN clientes.cli_nombre IS 'Nom.Cliente';
COMMENT ON COLUMN clientes.cli_ruc IS 'RUC';
COMMENT ON COLUMN clientes.cli_razon_social IS 'Razón Social';
COMMENT ON COLUMN clientes.cli_telefono IS 'Teléfono';
COMMENT ON COLUMN clientes.cli_email IS 'Email';
COMMENT ON COLUMN clientes.cli_direccion IS 'Dirección';
COMMENT ON COLUMN clientes.cli_dep IS 'Departamento';
COMMENT ON COLUMN clientes.cli_dis IS 'Distrito';
COMMENT ON COLUMN clientes.cli_ciu IS 'Ciudad';
COMMENT ON COLUMN clientes.cli_bar IS 'Barrio';
COMMENT ON COLUMN clientes.cli_tipo IS 'Tipo';
COMMENT ON COLUMN clientes.cli_nro_casa IS 'Nro casa';
COMMENT ON COLUMN clientes.cli_geo IS 'Geo-posicionamiento';
COMMENT ON COLUMN clientes.cli_tenantid IS 'ID de Inquilino (Tenant)';

-- Tabla: centros_entrega
COMMENT ON COLUMN centros_entrega.centro_id IS 'Cód.Centro Entrega';
COMMENT ON COLUMN centros_entrega.centro_nombre IS 'Nom.Centros Entrega';
COMMENT ON COLUMN centros_entrega.centro_tipo IS 'Centro Tipo';
COMMENT ON COLUMN centros_entrega.centro_direccion IS 'Centro Dirección';
COMMENT ON COLUMN centros_entrega.centro_referencia IS 'Centro Referencia';
COMMENT ON COLUMN centros_entrega.centro_geo IS 'Centro Geo';
COMMENT ON COLUMN centros_entrega.centro_dep IS 'Centro Departamento';
COMMENT ON COLUMN centros_entrega.centro_dis IS 'Centro Distrito';
COMMENT ON COLUMN centros_entrega.centro_ciu IS 'Centro Ciudad';
COMMENT ON COLUMN centros_entrega.centro_telefono IS 'Centro Teléfono';
COMMENT ON COLUMN centros_entrega.centro_contacto_email IS 'Centro Contacto email';
COMMENT ON COLUMN centros_entrega.centro_horario_recepcion IS 'Centro horario recepción';
COMMENT ON COLUMN centros_entrega.centro_estado IS 'Centro Estado';
COMMENT ON COLUMN centros_entrega.centro_usuario_alta IS 'Centro usuario alta';
COMMENT ON COLUMN centros_entrega.centro_fecha_alta IS 'Centro fecha alta';
COMMENT ON COLUMN centros_entrega.centro_usuario_mod IS 'Centro usuario mod';
COMMENT ON COLUMN centros_entrega.centro_fecha_mod IS 'Centro fecha mod';
COMMENT ON COLUMN centros_entrega.centro_tenantid IS 'Centro tenantid';

-- Tabla: personal_entrega
COMMENT ON COLUMN personal_entrega.personal_documento IS 'Per.Entrega NºDoc.';
COMMENT ON COLUMN personal_entrega.personal_nombre IS 'Nom.PersonalEntrega';
COMMENT ON COLUMN personal_entrega.personal_rol IS 'Personal Rol';
COMMENT ON COLUMN personal_entrega.personal_licencia IS 'Nº Licencia';
COMMENT ON COLUMN personal_entrega.personal_cat_licencia IS 'Cat.licencia';
COMMENT ON COLUMN personal_entrega.personal_vto_licencia IS 'Vto.licencia';
COMMENT ON COLUMN personal_entrega.personal_telefono IS 'Teléfono';
COMMENT ON COLUMN personal_entrega.personal_direccion IS 'Dirección';
COMMENT ON COLUMN personal_entrega.personal_estado IS 'Estado';
COMMENT ON COLUMN personal_entrega.personal_usuario_alta IS 'Personal usuario alta';
COMMENT ON COLUMN personal_entrega.personal_fecha_alta IS 'Personal fecha alta';
COMMENT ON COLUMN personal_entrega.personal_usuario_mod IS 'Personal usuario mod';
COMMENT ON COLUMN personal_entrega.personal_fecha_mod IS 'Personal fecha mod';
COMMENT ON COLUMN personal_entrega.personal_tenantid IS 'Personal tenantid';

-- Tabla: marcas_movil
COMMENT ON COLUMN marcas_movil.marca_id IS 'Cód.Marca Movil';
COMMENT ON COLUMN marcas_movil.marca_nombre IS 'Nom.Marca Movil';
COMMENT ON COLUMN marcas_movil.marca_estado IS 'Estado';
COMMENT ON COLUMN marcas_movil.marca_usuario_alta IS 'Marca usuario alta';
COMMENT ON COLUMN marcas_movil.marca_fecha_alta IS 'Marca fecha alta';
COMMENT ON COLUMN marcas_movil.marca_usuario_mod IS 'Marca usuario mod';
COMMENT ON COLUMN marcas_movil.marca_fecha_mod IS 'Marca fecha mod';
COMMENT ON COLUMN marcas_movil.marca_tenantid IS 'Marca tenantid';

-- Tabla: modelos_movil
COMMENT ON COLUMN modelos_movil.modelo_id IS 'Cód.Modelo Movil';
COMMENT ON COLUMN modelos_movil.modelo_nombre IS 'Nom.Modelo Movil';
COMMENT ON COLUMN modelos_movil.modelo_marca_id IS 'Cód.Modelo Movil';
COMMENT ON COLUMN modelos_movil.modelo_estado IS 'Estado';
COMMENT ON COLUMN modelos_movil.modelo_usuario_alta IS 'Modelo usuario alta';
COMMENT ON COLUMN modelos_movil.modelo_fecha_alta IS 'Modelo fecha alta';
COMMENT ON COLUMN modelos_movil.modelo_usuario_mod IS 'Modelo usuario mod';
COMMENT ON COLUMN modelos_movil.modelo_fecha_mod IS 'Modelo fecha mod';
COMMENT ON COLUMN modelos_movil.modelo_tenantid IS 'Modelo tenantid';

-- Tabla: moviles
COMMENT ON COLUMN moviles.movil_id IS 'Cód.Móvil';
COMMENT ON COLUMN moviles.movil_chapa IS 'Nº Chapa';
COMMENT ON COLUMN moviles.movil_marca_id IS 'Cód.Marca';
COMMENT ON COLUMN moviles.movil_modelo_id IS 'Cód.Modelo';
COMMENT ON COLUMN moviles.movil_anho IS 'Año';
COMMENT ON COLUMN moviles.movil_tipo IS 'Tipo';
COMMENT ON COLUMN moviles.movil_capacidad_kg IS 'Capacidad kg';
COMMENT ON COLUMN moviles.movil_km_actual IS 'Km actual';
COMMENT ON COLUMN moviles.movil_vto_seguro IS 'Vto seguro';
COMMENT ON COLUMN moviles.movil_vto_habilitacion IS 'Vto habilitación';
COMMENT ON COLUMN moviles.movil_chofer_doc IS 'Nº Doc.Chofer';
COMMENT ON COLUMN moviles.movil_acomp_doc IS 'Nº Doc.Acompañante';
COMMENT ON COLUMN moviles.movil_estado IS 'Estado';
COMMENT ON COLUMN moviles.movil_usuario_alta IS 'Movil usuario alta';
COMMENT ON COLUMN moviles.movil_fecha_alta IS 'Movil fecha alta';
COMMENT ON COLUMN moviles.movil_usuario_mod IS 'Movil usuario mod';
COMMENT ON COLUMN moviles.movil_fecha_mod IS 'Movil fecha mod';
COMMENT ON COLUMN moviles.movil_tenantid IS 'Movil tenantid';

-- Tabla: series_productos
COMMENT ON COLUMN series_productos.serie_id IS 'Cód.Serie Producto ';
COMMENT ON COLUMN series_productos.serie_numero IS 'Serie Número';
COMMENT ON COLUMN series_productos.serie_prodid IS 'Cód.Producto';
COMMENT ON COLUMN series_productos.serie_estado IS 'Estado';
COMMENT ON COLUMN series_productos.serie_ventaid IS 'Cód.Venta';
COMMENT ON COLUMN series_productos.serie_tenantid IS 'Serie tenantid';

-- Tabla: ventas
COMMENT ON COLUMN ventas.venta_id IS 'Cód.Venta';
COMMENT ON COLUMN ventas.venta_fecha IS 'Fecha';
COMMENT ON COLUMN ventas.venta_clientedoc IS 'Nº Doc.Cliente';
COMMENT ON COLUMN ventas.venta_condicion IS 'Condición Venta';
COMMENT ON COLUMN ventas.venta_total IS 'Total';
COMMENT ON COLUMN ventas.venta_entrega_inicial IS 'Entrega inicial';
COMMENT ON COLUMN ventas.venta_saldo_financiar IS 'Saldo financiar';
COMMENT ON COLUMN ventas.venta_estado IS 'Estado';
COMMENT ON COLUMN ventas.venta_vendedorid IS 'Id.Vendedor';
COMMENT ON COLUMN ventas.venta_sucursal IS 'Sucursal';
COMMENT ON COLUMN ventas.venta_redondeo IS 'Redondeo';
COMMENT ON COLUMN ventas.venta_tenantid IS 'Venta tenantid';
COMMENT ON COLUMN ventas.venta_cdc IS 'CDC';
COMMENT ON COLUMN ventas.venta_numero_oficial IS 'Nro.Oficial';
COMMENT ON COLUMN ventas.venta_estado_sifen IS 'Estado sifen';
COMMENT ON COLUMN ventas.venta_xml_firmado IS 'xml firmado';
COMMENT ON COLUMN ventas.venta_qr IS 'QR';
COMMENT ON COLUMN ventas.venta_firma_digital IS 'Firma digital';

-- Tabla: venta_detalles
COMMENT ON COLUMN venta_detalles.det_id IS 'Cód.Venta Detalle';
COMMENT ON COLUMN venta_detalles.det_ventaid IS 'Cód.Venta';
COMMENT ON COLUMN venta_detalles.det_prodid IS 'Cód.Producto';
COMMENT ON COLUMN venta_detalles.det_cantidad IS 'Cantidad';
COMMENT ON COLUMN venta_detalles.det_precio_unitario IS 'Precio Unitario';
COMMENT ON COLUMN venta_detalles.det_subtotal IS 'Subtotal';
COMMENT ON COLUMN venta_detalles.det_tenantid IS 'ID de Inquilino (Tenant)';

-- Tabla: cuotas
COMMENT ON COLUMN cuotas.cuota_id IS 'Cód.Cuota';
COMMENT ON COLUMN cuotas.cuota_ventaid IS 'Cód.Venta';
COMMENT ON COLUMN cuotas.cuota_numero IS 'Número Cuota';
COMMENT ON COLUMN cuotas.cuota_vencimiento IS 'Vencimiento';
COMMENT ON COLUMN cuotas.cuota_monto_capital IS 'Capital';
COMMENT ON COLUMN cuotas.cuota_monto_interes IS 'Interés';
COMMENT ON COLUMN cuotas.cuota_monto_total IS 'Monto Total';
COMMENT ON COLUMN cuotas.cuota_saldo IS 'Saldo';
COMMENT ON COLUMN cuotas.cuota_estado IS 'Estado';
COMMENT ON COLUMN cuotas.cuota_fecha_pago IS 'Fecha Pago';
COMMENT ON COLUMN cuotas.cuota_recargo_mora IS 'Recargo Mora';
COMMENT ON COLUMN cuotas.cuota_monto_moratorio_pagado IS 'Monto moratorio pagado';
COMMENT ON COLUMN cuotas.cuota_monto_punitorio_pagado IS 'Monto punitorio pagado';
COMMENT ON COLUMN cuotas.cuota_dias_atraso_calculado IS 'Cuota dias atraso calculado';
COMMENT ON COLUMN cuotas.cuota_tenantid IS 'Cuota tenantid';

-- Tabla: pagos
COMMENT ON COLUMN pagos.pago_id IS 'Cód.Pago';
COMMENT ON COLUMN pagos.pago_nro_recibo IS 'Nro recibo';
COMMENT ON COLUMN pagos.pago_clientedoc IS 'NºDoc.Cliente';
COMMENT ON COLUMN pagos.pago_fecha IS 'Fecha';
COMMENT ON COLUMN pagos.pago_monto_total IS 'Monto total';
COMMENT ON COLUMN pagos.pago_sesionid IS 'Sesionid';
COMMENT ON COLUMN pagos.pago_observacion IS 'Observación';
COMMENT ON COLUMN pagos.pago_estado IS 'Estado';
COMMENT ON COLUMN pagos.pago_tenantid IS 'ID de Inquilino (Tenant)';
COMMENT ON COLUMN pagos.pago_creadopor IS 'Creadopor';

-- Tabla: cajas
COMMENT ON COLUMN cajas.caja_cod IS 'Cód.Caja';
COMMENT ON COLUMN cajas.caja_sucursal IS 'Sucursal';
COMMENT ON COLUMN cajas.caja_dsc IS 'Dsc.Cajas';
COMMENT ON COLUMN cajas.caja_estado IS 'Estado';
COMMENT ON COLUMN cajas.caja_tenantid IS 'ID de Inquilino (Tenant)';
COMMENT ON COLUMN cajas.caja_fecha_creacion IS 'Fecha creacion';
COMMENT ON COLUMN cajas.caja_usuario_creacion IS 'Usuario creacion';
COMMENT ON COLUMN cajas.caja_fecha_modificacion IS 'Fecha modificacion';
COMMENT ON COLUMN cajas.caja_usuario_modificacion IS 'Usuario modificacion';

-- Tabla: caja_sesiones
COMMENT ON COLUMN caja_sesiones.sesion_id IS 'Cód.Caja Sesión';
COMMENT ON COLUMN caja_sesiones.sesion_usuario_email IS 'usuario';
COMMENT ON COLUMN caja_sesiones.sesion_cajaid IS 'Cód.Caja';
COMMENT ON COLUMN caja_sesiones.sesion_sucursal IS 'Sucursal';
COMMENT ON COLUMN caja_sesiones.sesion_fecha_apertura IS 'Fecha apertura';
COMMENT ON COLUMN caja_sesiones.sesion_fecha_cierre IS 'Fecha cierre';
COMMENT ON COLUMN caja_sesiones.sesion_monto_inicial IS 'Monto inicial';
COMMENT ON COLUMN caja_sesiones.sesion_monto_final IS 'Monto final';
COMMENT ON COLUMN caja_sesiones.sesion_estado IS 'Estado';
COMMENT ON COLUMN caja_sesiones.sesion_observaciones IS 'Observaciones';
COMMENT ON COLUMN caja_sesiones.sesion_tenantid IS 'Sesion tenantid';
COMMENT ON COLUMN caja_sesiones.sesion_usuario_cierre IS 'Usuario cierre';
COMMENT ON COLUMN caja_sesiones.sesion_total_efectivo IS 'Total efectivo';
COMMENT ON COLUMN caja_sesiones.sesion_cnt_efectivo IS 'cnt efectivo';
COMMENT ON COLUMN caja_sesiones.sesion_total_tarjeta IS 'Total tarjeta';
COMMENT ON COLUMN caja_sesiones.sesion_cnt_tarjeta IS 'cnt tarjeta';
COMMENT ON COLUMN caja_sesiones.sesion_total_transferencia IS 'Total transferencia';
COMMENT ON COLUMN caja_sesiones.sesion_cnt_transferencia IS 'Transferencia';
COMMENT ON COLUMN caja_sesiones.sesion_total_otros IS 'Total otros';
COMMENT ON COLUMN caja_sesiones.sesion_cnt_otros IS 'cnt otros';

-- Tabla: entidades_financieras
COMMENT ON COLUMN entidades_financieras.ent_id IS 'Cód.Entidad';
COMMENT ON COLUMN entidades_financieras.ent_nombre IS 'Nom.Entidad';
COMMENT ON COLUMN entidades_financieras.ent_tipo IS 'Tipo';
COMMENT ON COLUMN entidades_financieras.ent_activo IS 'Activo';
COMMENT ON COLUMN entidades_financieras.ent_tenantid IS 'ID de Inquilino (Tenant)';
COMMENT ON COLUMN entidades_financieras.ent_creadopor IS 'Creadopor';

-- Tabla: pagos_metodos
COMMENT ON COLUMN pagos_metodos.met_id IS 'Cód.Metodo Pago';
COMMENT ON COLUMN pagos_metodos.met_pagoid IS 'Cód.Pago';
COMMENT ON COLUMN pagos_metodos.met_tipo IS 'Tipo';
COMMENT ON COLUMN pagos_metodos.met_monto IS 'Monto';
COMMENT ON COLUMN pagos_metodos.met_entidadid IS 'Entidadid';
COMMENT ON COLUMN pagos_metodos.met_referencia IS 'Referencia';
COMMENT ON COLUMN pagos_metodos.met_tenantid IS 'ID de Inquilino (Tenant)';

-- Tabla: pagos_imputaciones
COMMENT ON COLUMN pagos_imputaciones.imp_id IS 'Cód.Pagos Imputaciones';
COMMENT ON COLUMN pagos_imputaciones.imp_pagoid IS 'Cód.Pago';
COMMENT ON COLUMN pagos_imputaciones.imp_cuotaid IS 'Cód.Cuota';
COMMENT ON COLUMN pagos_imputaciones.imp_monto_capital IS 'Capital';
COMMENT ON COLUMN pagos_imputaciones.imp_monto_interes IS 'Interés';
COMMENT ON COLUMN pagos_imputaciones.imp_monto_mora IS 'Mora';
COMMENT ON COLUMN pagos_imputaciones.imp_tenantid IS 'ID de Inquilino (Tenant)';

-- Tabla: politicas_credito
COMMENT ON COLUMN politicas_credito.pol_id IS 'Cód.Politica Crédito';
COMMENT ON COLUMN politicas_credito.pol_tenantid IS 'ID de Inquilino (Tenant)';
COMMENT ON COLUMN politicas_credito.pol_tasa_moratoria_diaria IS 'Tasa moratoria diaria';
COMMENT ON COLUMN politicas_credito.pol_tasa_punitoria_diaria IS 'Tasa punitoria diaria';
COMMENT ON COLUMN politicas_credito.pol_dias_gracia IS 'Días gracia';
COMMENT ON COLUMN politicas_credito.pol_iva_intereses IS 'Iva intereses';
COMMENT ON COLUMN politicas_credito.pol_interes_mensual_tasa IS 'Interes mensual tasa';
COMMENT ON COLUMN politicas_credito.pol_modificadopor IS 'Modificado por';
COMMENT ON COLUMN politicas_credito.pol_fecmodificacion IS 'Fec.Modificación';

-- Tabla: feriados
COMMENT ON COLUMN feriados.feriado_anho IS 'Año';
COMMENT ON COLUMN feriados.feriado_fecha IS 'Fecha';
COMMENT ON COLUMN feriados.feriado_dsc IS 'Dsc.Feriados';
COMMENT ON COLUMN feriados.feriado_estado IS 'Estado';
COMMENT ON COLUMN feriados.feriado_tenantid IS 'Feriado tenantid';

-- Tabla: parametros
COMMENT ON COLUMN parametros.par_id IS 'Id.Parámetro';
COMMENT ON COLUMN parametros.par_codigo IS 'Cód.Parámetro';
COMMENT ON COLUMN parametros.par_descripcion IS 'Dsc.Parametros';
COMMENT ON COLUMN parametros.par_valor IS 'Valor';
COMMENT ON COLUMN parametros.par_tenantid IS 'ID de Inquilino (Tenant)';

-- Tabla: menu
COMMENT ON COLUMN menu.menu_cod IS 'Cód.Menu';
COMMENT ON COLUMN menu.menu_nombre IS 'Nom.Menu';

-- Tabla: menu_det
COMMENT ON COLUMN menu_det.menu_cod IS 'Cód.Menu';
COMMENT ON COLUMN menu_det.menu_det_cod IS 'Cód.MenuDet';
COMMENT ON COLUMN menu_det.menu_det_nombre IS 'Nom.MenuDet';
COMMENT ON COLUMN menu_det.menu_det_url IS 'url';
COMMENT ON COLUMN menu_det.menu_det_icono IS 'icono';
COMMENT ON COLUMN menu_det.menu_det_cod_padre IS 'Cód padre';
COMMENT ON COLUMN menu_det.menu_det_estado IS 'Estado';
COMMENT ON COLUMN menu_det.menu_det_det_orden IS 'Orden';

-- Tabla: perfiles
COMMENT ON COLUMN perfiles.perfil_cod IS 'Cód.Perfil';
COMMENT ON COLUMN perfiles.perfil_nombre IS 'Nom.Perfil';
COMMENT ON COLUMN perfiles.menu_cod IS 'Cód.Perfil';

-- Tabla: usuarios
COMMENT ON COLUMN usuarios.usuario_email IS 'Usuario email';
COMMENT ON COLUMN usuarios.usuario_sucursal IS 'Usuario sucursal';
COMMENT ON COLUMN usuarios.usuario_nombre IS 'Nom.Usuarios';
COMMENT ON COLUMN usuarios.usuario_password IS 'Usuario password';
COMMENT ON COLUMN usuarios.perfil_cod IS 'Cód.Perfil';
COMMENT ON COLUMN usuarios.usuario_estado IS 'Estado';
COMMENT ON COLUMN usuarios.usuario_primer_ingreso IS 'Primer ingreso';
COMMENT ON COLUMN usuarios.usuario_reset_token IS 'Reset token';
COMMENT ON COLUMN usuarios.usuario_tenantid IS 'Usuario tenantid';
COMMENT ON COLUMN usuarios.usuario_fecha_creacion IS 'Usuario fecha creacion';
COMMENT ON COLUMN usuarios.usuario_usuario_creacion IS 'Usuario usuario creacion';
COMMENT ON COLUMN usuarios.usuario_fecha_modificacion IS 'Usuario fecha modificacion';
COMMENT ON COLUMN usuarios.usuario_usuario_modificacion IS 'Usuario usuario modificacion';
COMMENT ON COLUMN usuarios.usuario_imagen_url IS 'Imagen url';

-- Tabla: sucursales
COMMENT ON COLUMN sucursales.suc_id IS 'Cód.Sucursal';
COMMENT ON COLUMN sucursales.suc_nombre IS 'Nom.Sucursal';
COMMENT ON COLUMN sucursales.suc_direccion IS 'Dirección';
COMMENT ON COLUMN sucursales.suc_telefono IS 'Teléfono';
COMMENT ON COLUMN sucursales.suc_estado IS 'Estado';
COMMENT ON COLUMN sucursales.suc_tenantid IS 'ID de Inquilino (Tenant)';

-- Tabla: empresa
COMMENT ON COLUMN empresa.empresa_cod IS 'Cód.Empresa';
COMMENT ON COLUMN empresa.empresa_nom IS 'Nom.Empresa';
COMMENT ON COLUMN empresa.empresa_ruc IS 'RUC';
COMMENT ON COLUMN empresa.empresa_estado IS 'Estado';
COMMENT ON COLUMN empresa.empresa_usuario_alta IS 'Empresa usuario alta';
COMMENT ON COLUMN empresa.empresa_fecha_alta IS 'Empresa fecha alta';
COMMENT ON COLUMN empresa.empresa_usuario_mod IS 'Empresa usuario mod';
COMMENT ON COLUMN empresa.empresa_fecha_mod IS 'Empresa fecha mod';
COMMENT ON COLUMN empresa.empresa_act_eco IS 'Empresa act eco';
COMMENT ON COLUMN empresa.empresa_dep IS 'Departamento';
COMMENT ON COLUMN empresa.empresa_dis IS 'Distrito';
COMMENT ON COLUMN empresa.empresa_ciu IS 'Ciudad';
COMMENT ON COLUMN empresa.empresa_bar IS 'Barrio';
COMMENT ON COLUMN empresa.empresa_nom_fan IS 'Nom.Fantasía';
COMMENT ON COLUMN empresa.empresa_mail IS 'Mail';
COMMENT ON COLUMN empresa.empresa_dir IS 'Dirección';
COMMENT ON COLUMN empresa.empresa_tel IS 'Teléfono';
COMMENT ON COLUMN empresa.empresa_propietario IS 'Propietario';

-- Tabla: establecimientos
COMMENT ON COLUMN establecimientos.estab_codigo IS 'Cód.Establecimiento';
COMMENT ON COLUMN establecimientos.estab_nombre IS 'Nom.Establecimiento';
COMMENT ON COLUMN establecimientos.estab_direccion IS 'Dirección';
COMMENT ON COLUMN establecimientos.estab_usuario_alta IS 'Estab usuario alta';
COMMENT ON COLUMN establecimientos.estab_fecha_alta IS 'Estab fecha alta';
COMMENT ON COLUMN establecimientos.estab_usuario_mod IS 'Estab usuario mod';
COMMENT ON COLUMN establecimientos.estab_fecha_mod IS 'Estab fecha mod';

-- Tabla: puntos_expedicion
COMMENT ON COLUMN puntos_expedicion.estab_codigo IS 'Cód.Establecimiento';
COMMENT ON COLUMN puntos_expedicion.punto_codigo IS 'Cód.Punto';
COMMENT ON COLUMN puntos_expedicion.punto_descripcion IS 'Dsc.Punto Expedición';
COMMENT ON COLUMN puntos_expedicion.punto_usuario_alta IS 'Punto usuario alta';
COMMENT ON COLUMN puntos_expedicion.punto_fecha_alta IS 'Punto fecha alta';
COMMENT ON COLUMN puntos_expedicion.punto_usuario_mod IS 'Punto usuario mod';
COMMENT ON COLUMN puntos_expedicion.punto_fecha_mod IS 'Punto fecha mod';

-- Tabla: timbrados
COMMENT ON COLUMN timbrados.timbrado_numero IS 'Nº Timbrado';
COMMENT ON COLUMN timbrados.timbrado_estado IS 'Estado';
COMMENT ON COLUMN timbrados.timbrado_nro_desde IS 'Nro desde';
COMMENT ON COLUMN timbrados.timbrado_nro_hasta IS 'Nro hasta';
COMMENT ON COLUMN timbrados.timbrado_nro_actual IS 'Nro actual';
COMMENT ON COLUMN timbrados.timbrado_usuario_alta IS 'Timbrado usuario alta';
COMMENT ON COLUMN timbrados.timbrado_fecha_alta IS 'Timbrado fecha alta';
COMMENT ON COLUMN timbrados.timbrado_usuario_mod IS 'Timbrado usuario mod';
COMMENT ON COLUMN timbrados.timbrado_fecha_mod IS 'Timbrado fecha mod';
COMMENT ON COLUMN timbrados.timbrado_fecha_vencimiento IS 'Fecha vencimiento';

-- Tabla: facturas
COMMENT ON COLUMN facturas.estab_codigo IS 'Cód.Establecimiento';
COMMENT ON COLUMN facturas.punto_codigo IS 'Cód.Punto';
COMMENT ON COLUMN facturas.factura_numero IS 'NºFactura';
COMMENT ON COLUMN facturas.timbrado_numero IS 'Nº Timbrado';
COMMENT ON COLUMN facturas.factura_fecha_emision IS 'Fecha emision';
COMMENT ON COLUMN facturas.factura_ruc_receptor IS 'RUC receptor';
COMMENT ON COLUMN facturas.factura_nombre_receptor IS 'Nom.Receptor';
COMMENT ON COLUMN facturas.factura_total IS 'Total';
COMMENT ON COLUMN facturas.factura_total_letras IS 'Total letras';
COMMENT ON COLUMN facturas.factura_estado IS 'Estado';
COMMENT ON COLUMN facturas.pago_id IS 'Cód.Pago';
COMMENT ON COLUMN facturas.factura_usuario_alta IS 'Factura usuario alta';
COMMENT ON COLUMN facturas.factura_fecha_alta IS 'Factura fecha alta';
COMMENT ON COLUMN facturas.factura_usuario_mod IS 'Factura usuario mod';
COMMENT ON COLUMN facturas.factura_fecha_mod IS 'Factura fecha mod';

-- Tabla: facturas_det
COMMENT ON COLUMN facturas_det.estab_codigo IS 'Cód.Establecimiento';
COMMENT ON COLUMN facturas_det.punto_codigo IS 'Cód.Punto';
COMMENT ON COLUMN facturas_det.factura_numero IS 'NºFactura';
COMMENT ON COLUMN facturas_det.facdet_linea IS 'Nº Linea';
COMMENT ON COLUMN facturas_det.facdet_concepto IS 'Concepto';
COMMENT ON COLUMN facturas_det.facdet_cantidad IS 'Cantidad';
COMMENT ON COLUMN facturas_det.facdet_precio_unitario IS 'Precio unitario';
COMMENT ON COLUMN facturas_det.facdet_subtotal IS 'Subtotal';
COMMENT ON COLUMN facturas_det.facdet_iva IS 'IVA';
COMMENT ON COLUMN facturas_det.facdet_total IS 'Total';
COMMENT ON COLUMN facturas_det.facdet_usuario_alta IS 'Facdet usuario alta';
COMMENT ON COLUMN facturas_det.facdet_fecha_alta IS 'Facdet fecha alta';
COMMENT ON COLUMN facturas_det.facdet_usuario_mod IS 'Facdet usuario mod';
COMMENT ON COLUMN facturas_det.facdet_fecha_mod IS 'Facdet fecha mod';

-- Tabla: tickets
COMMENT ON COLUMN tickets.ticket_numero IS 'Nº Ticket';
COMMENT ON COLUMN tickets.ticket_fecha_emision IS 'Fecha emision';
COMMENT ON COLUMN tickets.ticket_nombre_receptor IS 'Nombre receptor';
COMMENT ON COLUMN tickets.ticket_total IS 'Total';
COMMENT ON COLUMN tickets.ticket_estado IS 'Estado';
COMMENT ON COLUMN tickets.pago_id IS 'Cód.Pago';
COMMENT ON COLUMN tickets.usuario_alta IS 'Usuario que creó';
COMMENT ON COLUMN tickets.fecha_alta IS 'Fecha de alta';
COMMENT ON COLUMN tickets.usuario_mod IS 'Último usuario que modificó';
COMMENT ON COLUMN tickets.fecha_mod IS 'Fecha de última modificación';

-- Tabla: tickets_det
COMMENT ON COLUMN tickets_det.ticket_numero IS 'Nº Ticket';
COMMENT ON COLUMN tickets_det.ticket_linea IS 'Nº Linea';
COMMENT ON COLUMN tickets_det.ticket_concepto IS 'Concepto';
COMMENT ON COLUMN tickets_det.ticket_cantidad IS 'Cantidad';
COMMENT ON COLUMN tickets_det.ticket_precio_unitario IS 'Precio unitario';
COMMENT ON COLUMN tickets_det.ticket_subtotal IS 'Subtotal';
COMMENT ON COLUMN tickets_det.ticket_total IS 'Total';

-- Tabla: actividad_economica
COMMENT ON COLUMN actividad_economica.act_eco_cod IS 'Cód.Actividad Economica';
COMMENT ON COLUMN actividad_economica.act_eco_dsc IS 'Dsc.Actividad Economica';
COMMENT ON COLUMN actividad_economica.act_eco_usuario_alta IS 'Usuario alta';
COMMENT ON COLUMN actividad_economica.act_eco_fecha_alta IS 'Fecha alta';

-- Tabla: unidad_medida
COMMENT ON COLUMN unidad_medida.uni_med_cod IS 'Cód.Unidad Medida';
COMMENT ON COLUMN unidad_medida.uni_med_dsc IS 'Dsc.Unidad Medida';
COMMENT ON COLUMN unidad_medida.uni_med_usuario_alta IS 'Usuario alta';
COMMENT ON COLUMN unidad_medida.uni_med_fecha_alta IS 'Fecha alta';

-- Tabla: forma_pago
COMMENT ON COLUMN forma_pago.forma_pago_id IS 'Cód.Forma Pago';
COMMENT ON COLUMN forma_pago.forma_pago_dsc IS 'Dsc.Forma Pago';
COMMENT ON COLUMN forma_pago.forma_pago_usuario_alta IS 'Usuario alta';
COMMENT ON COLUMN forma_pago.forma_pago_fecha_alta IS 'Fecha alta';

-- Tabla: departamentos
COMMENT ON COLUMN departamentos.dep_cod IS 'Cód.Departamento';
COMMENT ON COLUMN departamentos.dep_dsc IS 'Dsc.Departamento';
COMMENT ON COLUMN departamentos.dep_usuario_alta IS 'Usuario que creó';
COMMENT ON COLUMN departamentos.dep_fecha_alta IS 'Fecha de alta';

-- Tabla: distritos
COMMENT ON COLUMN distritos.dis_dep_cod IS 'Cód.Departamento';
COMMENT ON COLUMN distritos.dis_cod IS 'Cód.Distritos';
COMMENT ON COLUMN distritos.dis_dsc IS 'Dsc.Distritos';
COMMENT ON COLUMN distritos.dis_usuario_alta IS 'Usuario que creó';
COMMENT ON COLUMN distritos.dis_fecha_alta IS 'Fecha de alta';

-- Tabla: ciudades
COMMENT ON COLUMN ciudades.ciu_dep_cod IS 'Cód.Departamento';
COMMENT ON COLUMN ciudades.ciu_dis_cod IS 'Cód.Distritos';
COMMENT ON COLUMN ciudades.ciu_cod IS 'Cód.Ciudades';
COMMENT ON COLUMN ciudades.ciu_dsc IS 'Dsc.Ciudades';

-- Tabla: barrios
COMMENT ON COLUMN barrios.bar_dep_cod IS 'Cód.Departamento';
COMMENT ON COLUMN barrios.bar_dis_cod IS 'Cód.Distritos';
COMMENT ON COLUMN barrios.bar_ciu_cod IS 'Cód.Ciudades';
COMMENT ON COLUMN barrios.bar_cod IS 'Cód.Barrios';
COMMENT ON COLUMN barrios.bar_dsc IS 'Dsc.Barrios';

-- Tabla: cuotas_habilitadas
COMMENT ON COLUMN cuotas_habilitadas.cuo_hab_cod IS 'Cód.Cuotas Habilitadas';
COMMENT ON COLUMN cuotas_habilitadas.cuo_hab_cuo IS 'Cuota';
COMMENT ON COLUMN cuotas_habilitadas.cuo_hab_por_recargo IS '% recargo';
COMMENT ON COLUMN cuotas_habilitadas.cuo_hab_tenantid IS 'Hab tenantid';
COMMENT ON COLUMN cuotas_habilitadas.cuo_hab_usuario_alta IS 'Usuario alta';
COMMENT ON COLUMN cuotas_habilitadas.cuo_hab_fecha_alta IS 'Fecha alta';
COMMENT ON COLUMN cuotas_habilitadas.cuo_hab_usuario_mod IS 'Usuario mod';
COMMENT ON COLUMN cuotas_habilitadas.cuo_hab_fecha_mod IS 'Fecha mod';

-- Tabla: proveedores
COMMENT ON COLUMN proveedores.prov_id IS 'Cód.Proveedor';
COMMENT ON COLUMN proveedores.prov_nombre IS 'Nom.Proveedor';
COMMENT ON COLUMN proveedores.prov_ruc IS 'RUC';
COMMENT ON COLUMN proveedores.prov_razon_social IS 'Razón Social';
COMMENT ON COLUMN proveedores.prov_direccion IS 'Dirección';
COMMENT ON COLUMN proveedores.prov_dep IS 'Departamento';
COMMENT ON COLUMN proveedores.prov_dis IS 'Distrito';
COMMENT ON COLUMN proveedores.prov_ciu IS 'Ciudad';
COMMENT ON COLUMN proveedores.prov_telefono IS 'Teléfono';
COMMENT ON COLUMN proveedores.prov_email IS 'Email';
COMMENT ON COLUMN proveedores.prov_contacto IS 'Contacto';
COMMENT ON COLUMN proveedores.prov_estado IS 'Estado';
COMMENT ON COLUMN proveedores.prov_tenantid IS 'ID de Inquilino (Tenant)';

-- Tabla: compras
COMMENT ON COLUMN compras.comp_id IS 'Cód.Compra';
COMMENT ON COLUMN compras.comp_prov_id IS 'Cód.Proveedor';
COMMENT ON COLUMN compras.comp_nro_factura IS 'Nº factura';
COMMENT ON COLUMN compras.comp_fecha IS 'Fecha';
COMMENT ON COLUMN compras.comp_total IS 'Total';
COMMENT ON COLUMN compras.comp_estado IS 'Estado';
COMMENT ON COLUMN compras.comp_tenantid IS 'ID de Inquilino (Tenant)';
COMMENT ON COLUMN compras.comp_usuario_alta IS 'Usuario que creó';

-- Tabla: compra_detalles
COMMENT ON COLUMN compra_detalles.cdet_id IS 'Cód.Compra Detalle';
COMMENT ON COLUMN compra_detalles.cdet_comp_id IS 'Cód.Compra';
COMMENT ON COLUMN compra_detalles.cdet_prod_id IS 'Cód.Producto';
COMMENT ON COLUMN compra_detalles.cdet_cantidad IS 'Cantidad';
COMMENT ON COLUMN compra_detalles.cdet_precio_unitario IS 'Precio unitario';
COMMENT ON COLUMN compra_detalles.cdet_subtotal IS 'Subtotal';
COMMENT ON COLUMN compra_detalles.cdet_tenantid IS 'ID de Inquilino (Tenant)';

-- Tabla: movimientos_stock
COMMENT ON COLUMN movimientos_stock.mov_id IS 'Cód.Stock';
COMMENT ON COLUMN movimientos_stock.mov_prod_id IS 'Cód.Producto';
COMMENT ON COLUMN movimientos_stock.mov_tipo IS 'Tipo';
COMMENT ON COLUMN movimientos_stock.mov_cantidad IS 'Cantidad';
COMMENT ON COLUMN movimientos_stock.mov_referencia IS 'Referencia';
COMMENT ON COLUMN movimientos_stock.mov_stock_anterior IS 'Stock anterior';
COMMENT ON COLUMN movimientos_stock.mov_stock_actual IS 'Stock actual';
COMMENT ON COLUMN movimientos_stock.mov_fecha IS 'Fecha';
COMMENT ON COLUMN movimientos_stock.mov_usuario IS 'Usuario';
COMMENT ON COLUMN movimientos_stock.mov_tenantid IS 'ID de Inquilino (Tenant)';
COMMENT ON COLUMN movimientos_stock.mov_prov_id IS 'Cód.Proveedor';

-- Tabla: solicitudes_mercaderia
COMMENT ON COLUMN solicitudes_mercaderia.sol_id IS 'Cód.Solicitud Mercaderias';
COMMENT ON COLUMN solicitudes_mercaderia.sol_centro_id IS 'Cód.Centro Entrega';
COMMENT ON COLUMN solicitudes_mercaderia.sol_fecha IS 'Fecha';
COMMENT ON COLUMN solicitudes_mercaderia.sol_fecha_requerida IS 'Fecha requerida';
COMMENT ON COLUMN solicitudes_mercaderia.sol_estado IS 'Estado';
COMMENT ON COLUMN solicitudes_mercaderia.sol_observaciones IS 'Observaciones';
COMMENT ON COLUMN solicitudes_mercaderia.sol_usuario_alta IS 'Usuario que creó';
COMMENT ON COLUMN solicitudes_mercaderia.sol_fecha_alta IS 'Fecha de alta';
COMMENT ON COLUMN solicitudes_mercaderia.sol_usuario_mod IS 'Último usuario que modificó';
COMMENT ON COLUMN solicitudes_mercaderia.sol_fecha_mod IS 'Fecha de última modificación';
COMMENT ON COLUMN solicitudes_mercaderia.sol_tenantid IS 'ID de Inquilino (Tenant)';

-- Tabla: solicitudes_mercaderia_det
COMMENT ON COLUMN solicitudes_mercaderia_det.sdet_id IS 'Cód.Solicitud Mercaderias';
COMMENT ON COLUMN solicitudes_mercaderia_det.sdet_sol_id IS 'Cód.Solicitudes Mercaderia Det';
COMMENT ON COLUMN solicitudes_mercaderia_det.sdet_prod_id IS 'Cód.Producto';
COMMENT ON COLUMN solicitudes_mercaderia_det.sdet_cantidad IS 'Cantidad';
COMMENT ON COLUMN solicitudes_mercaderia_det.sdet_unidad IS 'Unidad';
COMMENT ON COLUMN solicitudes_mercaderia_det.sdet_observacion IS 'Observación';
COMMENT ON COLUMN solicitudes_mercaderia_det.sdet_tenantid IS 'ID de Inquilino (Tenant)';

-- Tabla: seg_email_log
COMMENT ON COLUMN seg_email_log.log_id IS 'Cód.SegEmailLog';
COMMENT ON COLUMN seg_email_log.log_destinatario IS 'Destinatario';
COMMENT ON COLUMN seg_email_log.log_asunto IS 'Asunto';
COMMENT ON COLUMN seg_email_log.log_cuerpo IS 'Cuerpo';
COMMENT ON COLUMN seg_email_log.log_fecha IS 'Fecha';
COMMENT ON COLUMN seg_email_log.log_estado IS 'Estado';
COMMENT ON COLUMN seg_email_log.log_error IS 'Error';
COMMENT ON COLUMN seg_email_log.log_tenantid IS 'ID de Inquilino (Tenant)';

-- Tabla: restricciones_campos
COMMENT ON COLUMN restricciones_campos.id IS 'Cód.Restriccion Campo';
COMMENT ON COLUMN restricciones_campos.tabla IS 'Tabla';
COMMENT ON COLUMN restricciones_campos.columna IS 'Columna';
COMMENT ON COLUMN restricciones_campos.oculto IS 'Oculto';
COMMENT ON COLUMN restricciones_campos.editable IS 'Editable';
COMMENT ON COLUMN restricciones_campos.creado_en IS 'Fecha de Creación';
