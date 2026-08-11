import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface PlanCobroTramo {
  plan_cob_tra_id?: number;
  plan_cob_tra_rango_desde: number;
  plan_cob_tra_rango_hasta?: number | null;
  plan_cob_tra_monto_por_tramo: number;
}

export interface PlanCobro {
  plan_cob_id?: number;
  plan_cob_tipo_cobro: string;
  plan_cob_monto_base: number;
  plan_cob_activo: boolean;
  tramos?: PlanCobroTramo[];
}

export interface Plan {
  id?: number;
  nombre: string;
  creado_en?: string;
  cobros?: PlanCobro[];
}

export interface Sistema {
  id?: number;
  nombre: string;
  descripcion?: string;
  creado_en?: string;
}

export interface MaestroCliente {
  id?: string;
  nombre_comercial: string;
  ruc?: string;
  url_slug: string;
  db_schema: string;
  email_contacto?: string;
  estado: boolean;
  sistema_id?: number;
  sistema?: Sistema;
  logo_url?: string;
  config_json?: any;
  initialize_db?: boolean;
  source_schema?: string;
}

export interface Suscripcion {
  id?: number;
  cliente_id: string;
  plan_id: number;
  fecha_inicio: string;
  esta_activa: boolean;
}

export interface AuditoriaAdmin {
  id: number;
  admin_id: number;
  accion: string;
  recurso: string;
  recurso_id?: string;
  detalle?: string;
  valores_anteriores?: any;
  valores_nuevos?: any;
  ip_address?: string;
  fecha: string;
  admin?: {
    username: string;
    nombre?: string;
  };
}

export interface RestriccionCampo {
  id?: number;
  tabla: string;
  columna: string;
  oculto: boolean;
  editable: boolean;
  tenant?: string;
  creado_en?: string;
}

const api = axios.create({
  baseURL: API_URL,
});

// Add interceptor to include token if available
api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('adminToken');
  const regularToken = localStorage.getItem('token');
  
  // Use adminToken specifically for master admin routes
  if (config.url?.includes('/admin') && adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (regularToken) {
    config.headers.Authorization = `Bearer ${regularToken}`;
  }
  return config;
});

// Add response interceptor to handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (error.config?.url?.includes('/admin')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/admin/login';
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export const adminMasterService = {
  // Planes
  getPlanes: () => api.get('/admin/planes').then(res => res.data),
  createPlan: (data: any) => api.post('/admin/planes', data).then(res => res.data),
  updatePlan: (id: number, data: any) => api.put(`/admin/planes/${id}`, data).then(res => res.data),
  deletePlan: (id: number) => api.delete(`/admin/planes/${id}`).then(res => res.data),

  // Tarifas de Planes (Cobros y Tramos)
  createPlanCobro: (plan_id: number, data: any) => api.post(`/admin/planes/${plan_id}/cobros`, data).then(res => res.data),
  updatePlanCobro: (cobro_id: number, data: any) => api.put(`/admin/planes/cobros/${cobro_id}`, data).then(res => res.data),
  deletePlanCobro: (cobro_id: number) => api.delete(`/admin/planes/cobros/${cobro_id}`).then(res => res.data),
  createPlanCobroTramo: (cobro_id: number, data: any) => api.post(`/admin/planes/cobros/${cobro_id}/tramos`, data).then(res => res.data),
  updatePlanCobroTramo: (tramo_id: number, data: any) => api.put(`/admin/planes/tramos/${tramo_id}`, data).then(res => res.data),
  deletePlanCobroTramo: (tramo_id: number) => api.delete(`/admin/planes/tramos/${tramo_id}`).then(res => res.data),

  // Clients (Tenants)
  getMaestroClientes: () => api.get('/admin/maestro-clientes').then(res => res.data),
  createMaestroCliente: (data: any) => api.post('/admin/maestro-clientes', data).then(res => res.data),
  updateMaestroCliente: (id: string, data: any) => api.put(`/admin/maestro-clientes/${id}`, data).then(res => res.data),
  getMaestroClienteBySlug: (slug: string) => api.get(`/admin/maestro-clientes/slug/${slug}`).then(res => res.data),

  // Suscripciones
  getSuscripciones: () => api.get('/admin/suscripciones').then(res => res.data),
  createSuscripcion: (data: any) => api.post('/admin/suscripciones', data).then(res => res.data),
  updateSuscripcion: (id: number, data: any) => api.put(`/admin/suscripciones/${id}`, data).then(res => res.data),
  deleteSuscripcion: (id: number) => api.delete(`/admin/suscripciones/${id}`).then(res => res.data),

  // Admin Profile
  updateAdminProfile: (data: { nombre?: string, password?: string }) => api.put('/admin/profile', data).then(res => res.data),

  // Audit Logs
  getAuditLogs: (params?: { skip?: number; limit?: number; fecha_desde?: string; fecha_hasta?: string; search?: string }) =>
    api.get('/admin/audit-logs', { params }).then(res => res.data),

  // DB Schemas
  getSchemas: () => api.get('/admin/db-schemas').then(res => res.data),

  // Sistemas
  getSistemas: () => api.get('/admin/sistemas').then(res => res.data),
  createSistema: (data: any) => api.post('/admin/sistemas', data).then(res => res.data),
  updateSistema: (id: number, data: any) => api.put(`/admin/sistemas/${id}`, data).then(res => res.data),
  deleteSistema: (id: number) => api.delete(`/admin/sistemas/${id}`).then(res => res.data),

  // Restricciones de Campos
  getRestricciones: (params?: any) => api.get('/admin/restricciones-campos', { params }).then(res => res.data),
  createRestriccion: (data: any) => api.post('/admin/restricciones-campos', data).then(res => res.data),
  updateRestriccion: (id: number, data: any) => api.put(`/admin/restricciones-campos/${id}`, data).then(res => res.data),
  deleteRestriccion: (id: number) => api.delete(`/admin/restricciones-campos/${id}`).then(res => res.data),
  getRestriccionTenants: () => api.get('/admin/restricciones-campos/tenants').then(res => res.data),
  getRestriccionTables: (schema: string) => api.get('/admin/restricciones-campos/tables', { params: { schema } }).then(res => res.data),
  getRestriccionColumns: (schema: string, table: string) => api.get('/admin/restricciones-campos/columns', { params: { schema, table } }).then(res => res.data),

  // Metadata
  getMetadataTables: () => api.get('/admin/db-metadata/tables').then(res => res.data),
  getMetadataColumns: (table: string) => api.get(`/admin/db-metadata/tables/${table}/columns`).then(res => res.data),

  // Parámetros del Sistema
  getParametrosSistema: (skip = 0, limit = 10, search = '', tenant = '') => 
    api.get(`/admin/parametros-sistema?skip=${skip}&limit=${limit}&search=${encodeURIComponent(search)}&tenant=${encodeURIComponent(tenant)}`).then(res => res.data),
  createParametroSistema: (data: any) => api.post('/admin/parametros-sistema', data).then(res => res.data),
  updateParametroSistema: (id: number, data: any) => api.put(`/admin/parametros-sistema/${id}`, data).then(res => res.data),
  deleteParametroSistema: (id: number) => api.delete(`/admin/parametros-sistema/${id}`).then(res => res.data),
};
