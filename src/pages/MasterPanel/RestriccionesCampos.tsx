import React, { useState, useEffect } from 'react';
import { adminMasterService } from '../../services/adminMaster';
import type { RestriccionCampo } from '../../services/adminMaster';
import { toast } from 'sonner';
import { 
  ShieldAlert, 
  Plus, 
  Search, 
  XCircle,
  EyeOff,
  Edit3,
  Trash2,
  Lock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface TenantInfo {
  schema: string;
  slug: string;
  nombre: string;
}

export default function RestriccionesCamposPage() {
  const [restricciones, setRestricciones] = useState<RestriccionCampo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);

  // Dynamic Lists
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [tables, setTables] = useState<string[]>([]);
  const [columns, setColumns] = useState<string[]>([]);

  // Dropdown load states
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingColumns, setLoadingColumns] = useState(false);

  // Form state
  const defaultFormData = {
    tenant_schema: '', // Schema name to fetch tables (e.g. tenant_fitra)
    tenant: '', // Slug to save (e.g. fitra)
    tabla: '',
    columna: '',
    oculto: false,
    editable: true,
    tipo_restriccion: 'oculto' // Helper to toggle: 'oculto' | 'readonly'
  };
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    loadData();
    loadTenants();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await adminMasterService.getRestricciones();
      setRestricciones(res.items || res.data || []);
    } catch (error) {
      toast.error('Error al cargar restricciones');
    } finally {
      setLoading(false);
    }
  };

  const loadTenants = async () => {
    try {
      setLoadingTenants(true);
      const data = await adminMasterService.getRestriccionTenants();
      setTenants(data || []);
    } catch (error) {
      toast.error('Error al cargar tenants');
    } finally {
      setLoadingTenants(false);
    }
  };

  const handleTenantChange = async (schemaVal: string) => {
    const selectedTenantObj = tenants.find(t => t.schema === schemaVal);
    const slugVal = selectedTenantObj ? selectedTenantObj.slug : '';

    setFormData(prev => ({
      ...prev,
      tenant_schema: schemaVal,
      tenant: slugVal,
      tabla: '',
      columna: ''
    }));
    setTables([]);
    setColumns([]);

    if (!schemaVal) return;

    try {
      setLoadingTables(true);
      const data = await adminMasterService.getRestriccionTables(schemaVal);
      setTables(data || []);
    } catch (error) {
      toast.error('Error al cargar tablas del tenant');
    } finally {
      setLoadingTables(false);
    }
  };

  const handleTableChange = async (tableVal: string) => {
    setFormData(prev => ({
      ...prev,
      tabla: tableVal,
      columna: ''
    }));
    setColumns([]);

    if (!tableVal || !formData.tenant_schema) return;

    try {
      setLoadingColumns(true);
      const data = await adminMasterService.getRestriccionColumns(formData.tenant_schema, tableVal);
      setColumns(data || []);
    } catch (error) {
      toast.error('Error al cargar columnas');
    } finally {
      setLoadingColumns(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const isOculto = formData.tipo_restriccion === 'oculto';
      const isEditable = formData.tipo_restriccion !== 'readonly';

      const payload = {
        tenant: formData.tenant,
        tabla: formData.tabla,
        columna: formData.columna,
        oculto: isOculto,
        editable: isEditable
      };

      if (editingId) {
        await adminMasterService.updateRestriccion(editingId, payload);
        toast.success('Restricción actualizada correctamente');
      } else {
        await adminMasterService.createRestriccion(payload);
        toast.success('Restricción creada correctamente');
      }
      setShowModal(false);
      setEditingId(null);
      setFormData(defaultFormData);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Error al guardar restricción');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (restriccion: RestriccionCampo) => {
    setEditingId(restriccion.id || null);
    
    // Find matching tenant schema
    const tenantObj = tenants.find(t => t.slug === restriccion.tenant);
    const schemaVal = tenantObj ? tenantObj.schema : (restriccion.tenant || '');

    const restrictionType = restriccion.oculto ? 'oculto' : 'readonly';

    setFormData({
      tenant_schema: schemaVal,
      tenant: restriccion.tenant || '',
      tabla: restriccion.tabla,
      columna: restriccion.columna,
      oculto: restriccion.oculto,
      editable: restriccion.editable,
      tipo_restriccion: restrictionType
    });

    setShowModal(true);

    // Load tables and columns for editing
    if (schemaVal) {
      try {
        setLoadingTables(true);
        const tablesData = await adminMasterService.getRestriccionTables(schemaVal);
        setTables(tablesData || []);

        setLoadingColumns(true);
        const columnsData = await adminMasterService.getRestriccionColumns(schemaVal, restriccion.tabla);
        setColumns(columnsData || []);
      } catch (err) {
        console.error("Error loading tables/columns for editing:", err);
      } finally {
        setLoadingTables(false);
        setLoadingColumns(false);
      }
    }
  };

  const handleDelete = async (id: number, fieldName: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la restricción en "${fieldName}"?\nEsta acción no se puede deshacer.`)) return;
    
    try {
      await adminMasterService.deleteRestriccion(id);
      toast.success('Restricción eliminada correctamente');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'No se pudo eliminar la restricción');
    }
  };

  const filtered = restricciones.filter(r => 
    (r.tenant || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.tabla || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.columna || '').toLowerCase().includes(search.toLowerCase())
  );

  const total = filtered.length;

  const getTenantReadableName = (slug?: string) => {
    if (!slug) return '-';
    const found = tenants.find(t => t.slug === slug);
    return found ? found.nombre : slug;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent flex items-center gap-3">
            <Lock className="w-8 h-8 text-blue-500" />
            Restricciones de Campos
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-blue-400" />
            Configura qué campos de base de datos están ocultos o son de solo lectura por cada Tenant
          </p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData(defaultFormData);
            setTables([]);
            setColumns([]);
            setShowModal(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nueva Restricción
        </button>
      </div>

      <div className="bg-card/30 border border-border/50 rounded-2xl backdrop-blur-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/20">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Buscar por tenant, tabla o columna..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="w-full bg-background/50 border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Total: {total} registros
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-card/40">
                <th className="p-4 text-sm font-semibold text-muted-foreground">Tenant</th>
                <th className="p-4 text-sm font-semibold text-muted-foreground">Tabla</th>
                <th className="p-4 text-sm font-semibold text-muted-foreground">Columna</th>
                <th className="p-4 text-sm font-semibold text-muted-foreground">Restricción</th>
                <th className="p-4 text-sm font-semibold text-muted-foreground">Creado en</th>
                <th className="p-4 text-sm font-semibold text-muted-foreground text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Cargando restricciones...</td></tr>
              ) : total === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No se encontraron restricciones configuradas.</td></tr>
              ) : (
                filtered.slice(page * pageSize, (page + 1) * pageSize).map((item) => (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-card/20 transition-colors">
                    <td className="p-4 font-semibold">{getTenantReadableName(item.tenant)}</td>
                    <td className="p-4 font-mono text-xs text-blue-400">{item.tabla}</td>
                    <td className="p-4 font-mono text-xs text-purple-400">{item.columna}</td>
                    <td className="p-4">
                      {item.oculto ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <EyeOff className="w-3.5 h-3.5" /> Oculto
                        </span>
                      ) : !item.editable ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Edit3 className="w-3.5 h-3.5" /> Solo Lectura
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Ninguna
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {item.creado_en ? new Date(item.creado_en).toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                    </td>
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <button 
                        onClick={() => handleEdit(item)} 
                        className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id!, `${item.tabla}.${item.columna}`)} 
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-border flex items-center justify-between bg-card/10">
          <span className="text-xs text-muted-foreground">
            Mostrando {page * pageSize + 1} al {Math.min((page + 1) * pageSize, total)} de {total} registros
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => Math.max(0, p - 1))}
              className="p-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium">
              Página {page + 1} de {Math.max(1, Math.ceil(total / pageSize))}
            </span>
            <button
              disabled={(page + 1) * pageSize >= total}
              onClick={() => setPage(p => p + 1)}
              className="p-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-accent/10 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-card border border-border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between bg-background/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                  <Lock className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{editingId ? 'Editar Restricción' : 'Nueva Restricción'}</h3>
                  <p className="text-sm text-gray-500">Configure la política de visualización del campo.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-foreground transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                {/* Tenant Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Tenant</label>
                  <select 
                    required
                    disabled={!!editingId}
                    value={formData.tenant_schema}
                    onChange={(e) => handleTenantChange(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="">Seleccione un tenant...</option>
                    {tenants.map(t => (
                      <option key={t.schema} value={t.schema}>{t.nombre}</option>
                    ))}
                  </select>
                  {loadingTenants && <span className="text-xs text-blue-400">Cargando tenants...</span>}
                </div>

                {/* Table Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Tabla</label>
                  <select 
                    required
                    disabled={!!editingId || !formData.tenant_schema}
                    value={formData.tabla}
                    onChange={(e) => handleTableChange(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="">Seleccione una tabla...</option>
                    {tables.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  {loadingTables && <span className="text-xs text-blue-400">Cargando tablas...</span>}
                </div>

                {/* Column Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Columna</label>
                  <select 
                    required
                    disabled={!!editingId || !formData.tabla}
                    value={formData.columna}
                    onChange={(e) => setFormData({...formData, columna: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="">Seleccione una columna...</option>
                    {columns.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {loadingColumns && <span className="text-xs text-blue-400">Cargando columnas...</span>}
                </div>

                {/* Restriction Type */}
                <div className="space-y-2 pt-2">
                  <label className="text-sm font-medium text-muted-foreground">Tipo de Restricción</label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      formData.tipo_restriccion === 'oculto'
                        ? 'bg-rose-500/10 border-rose-500 text-rose-400 font-semibold'
                        : 'border-border hover:bg-muted/50 text-muted-foreground'
                    }`}>
                      <input 
                        type="radio" 
                        name="tipo_restriccion" 
                        value="oculto"
                        checked={formData.tipo_restriccion === 'oculto'}
                        onChange={(e) => setFormData({...formData, tipo_restriccion: e.target.value})}
                        className="sr-only"
                      />
                      <EyeOff className="w-4 h-4" /> Ocultar Campo
                    </label>
                    <label className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      formData.tipo_restriccion === 'readonly'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-semibold'
                        : 'border-border hover:bg-muted/50 text-muted-foreground'
                    }`}>
                      <input 
                        type="radio" 
                        name="tipo_restriccion" 
                        value="readonly"
                        checked={formData.tipo_restriccion === 'readonly'}
                        onChange={(e) => setFormData({...formData, tipo_restriccion: e.target.value})}
                        className="sr-only"
                      />
                      <Edit3 className="w-4 h-4" /> Solo Lectura
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`px-8 py-2.5 rounded-xl text-white font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2 ${
                    isSubmitting 
                      ? 'bg-gray-700 cursor-not-allowed shadow-none' 
                      : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
                  }`}
                >
                  {isSubmitting ? 'Guardando...' : (editingId ? 'Actualizar' : 'Crear Restricción')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
