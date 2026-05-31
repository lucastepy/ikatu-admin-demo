/**
 * routeObfuscation.ts
 * 
 * Encripta/desencripta las rutas de la aplicación en la barra de direcciones.
 * Los componentes de React Router siguen funcionando con las rutas reales internamente.
 * Solo se modifica lo que el usuario ve en la URL del navegador.
 * 
 * Uso desde consola del navegador:
 *   revelarURL()  → muestra la ruta real
 *   ocultarURL()  → vuelve a la ruta encriptada
 */

const PREFIX = 'X9@'; // salt interno

/** Codifica un segmento de ruta */
function encodeSegment(segment: string): string {
    return btoa(PREFIX + segment)
        .replace(/=/g, '')
        .replace(/\+/g, 'n')
        .replace(/\//g, 'z');
}

// Lista completa de todos los segmentos de ruta bajo /ikatusoft/
const ALL_SEGMENTS = [
    // Dashboards
    'dashboard', 'dashboard-gerencial', 'dashboard-gerencial-logistica',
    'dashboard-cajero', 'dashboard-encargado-centro',
    // Admin
    'perfil', 'menus', 'users', 'profiles', 'email-logs',
    'config-notificaciones', 'procesos-agendados', 'restricciones',
    // Configuración
    'empresa', 'sucursales', 'cajas', 'parametros', 'politicas',
    'actividades-laborales', 'formas-pago', 'unidades-medida',
    'config-locations', 'cuotas-habilitadas',
    // Ventas / POS
    'pos', 'pos-caja', 'ventas', 'operaciones', 'sesiones',
    'clientes', 'collections',
    // Catálogo
    'productos', 'categorias', 'marcas', 'recetas', 'planificacion-comedor',
    // Proveedores / Compras
    'proveedores', 'tipos-proveedor', 'compras', 'movimientos-stock',
    'solicitud-proveedores', 'historico-solicitud-productos',
    'facturas-pagar', 'reporte-pagos-proveedores',
    'reporte-compras-tipo-proveedor',
    // Finanzas
    'cheques-emitidos', 'entidades-financieras', 'pagos',
    'tipos-gastos', 'gastos-por-periodo',
    // Facturación
    'facturacion-config', 'facturas', 'tickets',
    // Logística
    'personal-entrega', 'moviles', 'centros-entrega',
    'admin-centros-entrega', 'solicitudes-mercaderia',
    'admin-solicitudes-mercaderia', 'carga-moviles', 'rendicion-carga',
    // Reportes
    'reporte-estrategico', 'control-mercaderias-deposito',
    'reporte-consolidado-mercaderias', 'auditoria-consumos',
    // Otros
    'feriados',
];

// Mapas bidireccionales generados una sola vez
const ENCODE_MAP: Record<string, string> = Object.fromEntries(
    ALL_SEGMENTS.map(s => [s, encodeSegment(s)])
);
const DECODE_MAP: Record<string, string> = Object.fromEntries(
    ALL_SEGMENTS.map(s => [encodeSegment(s), s])
);

const TENANT_PREFIX = '/ikatusoft/';

/** Convierte una ruta real en su versión encriptada */
export function encodePath(path: string): string {
    if (!path.startsWith(TENANT_PREFIX)) return path;
    const rest = path.slice(TENANT_PREFIX.length);
    const parts = rest.split('/');
    const encoded = ENCODE_MAP[parts[0]];
    if (!encoded) return path;
    parts[0] = encoded;
    return TENANT_PREFIX + parts.join('/');
}

/** Convierte una ruta encriptada en la ruta real */
export function decodePath(path: string): string {
    if (!path.startsWith(TENANT_PREFIX)) return path;
    const rest = path.slice(TENANT_PREFIX.length);
    const parts = rest.split('/');
    const decoded = DECODE_MAP[parts[0]];
    if (!decoded) return path;
    parts[0] = decoded;
    return TENANT_PREFIX + parts.join('/');
}

/** Retorna true si el path actual es una ruta encriptada */
export function isEncodedPath(path: string): boolean {
    if (!path.startsWith(TENANT_PREFIX)) return false;
    const segment = path.slice(TENANT_PREFIX.length).split('/')[0];
    return segment in DECODE_MAP;
}

/** Retorna true si el path actual es una ruta real (legible) */
export function isRealPath(path: string): boolean {
    if (!path.startsWith(TENANT_PREFIX)) return false;
    const segment = path.slice(TENANT_PREFIX.length).split('/')[0];
    return segment in ENCODE_MAP;
}

/**
 * Registra las funciones globales en window para usar desde la consola.
 * Se llama una sola vez desde el componente principal.
 */
export function registerConsoleUtils() {
    (window as any).revelarURLs = () => {
        localStorage.setItem('url_obfuscation_mode', 'revealed');
        const current = window.location.pathname;
        const real = decodePath(current);
        if (real !== current) {
            window.history.replaceState(null, '', real + window.location.search + window.location.hash);
        }
        console.log('%c✅ URLs Reveladas (Globalmente para esta sesión)', 'color: #10b981; font-weight: bold; font-size:14px');
    };

    (window as any).protegerURLs = () => {
        localStorage.removeItem('url_obfuscation_mode');
        const current = window.location.pathname;
        const encoded = encodePath(current);
        if (encoded !== current) {
            window.history.replaceState(null, '', encoded + window.location.search + window.location.hash);
        }
        console.log('%c🔒 URLs Ocultadas (Globalmente para esta sesión)', 'color: #6366f1; font-weight: bold; font-size:14px');
    };
}
