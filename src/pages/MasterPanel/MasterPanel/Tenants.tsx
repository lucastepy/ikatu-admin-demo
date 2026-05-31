import React, { useState, useEffect } from 'react';
import { adminMasterService } from '../../services/adminMaster';
import type { MaestroCliente, Plan, Sistema } from '../../services/adminMaster';
import { toast } from 'sonner';
import { 
  Building2, 
  Globe, 
  Plus, 
  Search, 
  Settings, 
  Filter, 
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Database
} from 'lucide-react';

export default function TenantsPage() {
  const [tenants, setTenants] = useState<MaestroCliente[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [sistemas, setSistemas] = useState<Sistema[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<MaestroCliente | null>(null);
  const [dbSchemas, setDbSchemas] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<MaestroCliente>>({
    nombre_comercial: '',
    url_slug: '',
    db_schema: '',
    email_contacto: '',
    plan_id: undefined,
    sistema_id: undefined,
    estado: true,
    initialize_db: true,
    source_schema: 'public'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tenantsData, planesData, schemasData, sistemasData] = await Promise.all([
        adminMasterService.getMaestroClientes(),
        adminMasterService.getPlanes(),
        adminMasterService.getSchemas(),
        adminMasterService.getSistemas()
      ]);
      setTenants(tenantsData);
      setPlanes(planesData);
      setDbSchemas(schemasData);
      setSistemas(sistemasData);
    } catch (error) {
      toast.error('Error al cargar datos del panel maestro');
    } finally {
      setLoading(false);
    }
  };

  const handleSlugChange = (val: string) => {
    const slug = val.toLowerCase().replace(/[^a-z0-9]/g, '-');
    setFormData({
      ...formData,
      url_slug: slug,
      db_schema: `tenant_${slug.replace(/-/g, '_')}`
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      if (selectedTenant) {
        await adminMasterService.updateMaestroCliente(selectedTenant.id!, formData);
        toast.success('Cliente actualizado');
      } else {
        await adminMasterService.createMaestroCliente(formData);
        toast.success('Empresa registrada e infraestructura inicializada');
      }
      setShowModal(false);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Error al procesar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTenants = tenants.filter(t => 
    t.nombre_comercial.toLowerCase().includes(search.toLowerCase()) ||
    t.url_slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Maestro de Empresas
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            Gestión centralizada de inquilinos y aprovisionamiento SaaS
          </p>
        </div>
        <button 
          onClick={() => {
            setSelectedTenant(null);
            setFormData({
              nombre_comercial: '',
              url_slug: '',
              db_schema: '',
              email_contacto: '',
              plan_id: planes[0]?.id,
              sistema_id: sistemas[0]?.id,
              estado: true,
              initialize_db: true,
              source_schema: 'public'
            });
            setShowModal(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nueva Empresa
        </button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card/50 border border-border p-4 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Empresas</p>
            <p className="text-2xl font-bold">{tenants.length}</p>
          </div>
        </div>
        <div className="bg-card/50 border border-border p-4 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Activas</p>
            <p className="text-2xl font-bold">{tenants.filter(t => t.estado).length}</p>
          </div>
        </div>
        <div className="bg-card/50 border border-border p-4 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Esquemas DB</p>
            <p className="text-2xl font-bold">{tenants.length}</p>
          </div>
        </div>
        <div className="bg-card/50 border border-border p-4 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400">
            <Filter className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Plan Básico</p>
            <p className="text-2xl font-bold">{tenants.filter(t => t.plan_id === planes[0]?.id).length}</p>
          </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-card/30 border border-border/50 rounded-2xl backdrop-blur-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-4 bg-card/20">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o slug..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background/50 border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            />
          </div>
          <button className="p-2 border border-border rounded-xl hover:bg-muted text-muted-foreground transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider bg-background/20">
                <th className="px-6 py-4">Empresa / RUC</th>
                <th className="px-6 py-4">Sistema / Plan</th>
                <th className="px-6 py-4">Acceso (Slug)</th>
                <th className="px-6 py-4">Base de Datos</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8 h-16 bg-muted/10"></td>
                  </tr>
                ))
              ) : filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron inquilinos registrados.
                  </td>
                </tr>
              ) : filteredTenants.map((t) => (
                <tr key={t.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400 text-lg font-bold border border-indigo-500/20">
                        {t.nombre_comercial.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{t.nombre_comercial}</p>
                        <p className="text-xs text-gray-500">{t.ruc || 'Sin RUC'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {t.sistema?.nombre || 'S/N'}
                        </span>
                      </div>
                      {(() => {
                        const plan = planes.find(p => p.id === t.plan_id);
                        return (
                          <>
                            <span className="text-xs font-medium text-muted-foreground">
                              {plan?.nombre || 'S/N'}
                            </span>
                          </>
                        );
                      })()}
                      <div className="flex items-center gap-1.5">
                        {t.estado ? (
                          <div className="flex items-center gap-1 text-[10px] text-emerald-400 uppercase font-bold tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Activo
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[10px] text-red-400 uppercase font-bold tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                            Suspendido
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Globe className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{t.url_slug}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Database className="w-3 h-3" />
                        <code>{t.db_schema}</code>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500/50" />
                        Aprovisionado
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => {
                          setSelectedTenant(t);
                          setFormData(t);
                          setShowModal(true);
                        }}
                        className="p-2 hover:bg-gray-700/50 rounded-lg text-muted-foreground hover:text-foreground transition-all ring-1 ring-gray-800"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-accent/10 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-card border border-border w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between bg-background/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center">
                  <Plus className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedTenant ? 'Editar Empresa' : 'Alta de Nueva Empresa'}</h3>
                  <p className="text-sm text-gray-500">Configure la identidad y provisión del inquilino.</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Nombre Comercial</label>
                  <input 
                    required
                    value={formData.nombre_comercial}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!selectedTenant) {
                        const slug = val.toLowerCase().replace(/[^a-z0-9]/g, '-');
                        setFormData(prev => ({
                          ...prev, 
                          nombre_comercial: val,
                          url_slug: slug,
                          db_schema: `tenant_${slug.replace(/-/g, '_')}`
                        }));
                      } else {
                        setFormData(prev => ({...prev, nombre_comercial: val}));
                      }
                    }}
                    placeholder="Comercio"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all border-l-4 border-l-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">RUC (Opcional)</label>
                  <input 
                    value={formData.ruc || ''}
                    onChange={(e) => setFormData({...formData, ruc: e.target.value})}
                    placeholder="80012345-0"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">URL Slug (slug de acceso)</label>
                  <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-4 py-2.5">
                    <Globe className="w-4 h-4 text-gray-600" />
                    <input 
                      required
                      value={formData.url_slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      disabled={!!selectedTenant}
                      placeholder="motokeiro"
                      className="bg-transparent outline-none text-sm w-full disabled:text-gray-600"
                    />
                  </div>
                  <p className="text-[10px] text-gray-500">Se usará como: ikatusoft.com/<b>{formData.url_slug || 'slug'}</b></p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Email de Contacto</label>
                  <input 
                    required
                    type="email"
                    value={formData.email_contacto || ''}
                    onChange={(e) => setFormData({...formData, email_contacto: e.target.value})}
                    placeholder="admin@empresa.com"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all border-l-4 border-l-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Sistema / Solución</label>
                  <select 
                    required
                    value={formData.sistema_id}
                    onChange={(e) => setFormData({...formData, sistema_id: Number(e.target.value)})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  >
                    <option value="">Seleccione un sistema</option>
                    {sistemas.map(s => (
                      <option key={s.id} value={s.id}>{s.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Plan de Suscripción</label>
                  <select 
                    required
                    value={formData.plan_id}
                    onChange={(e) => setFormData({...formData, plan_id: Number(e.target.value)})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  >
                    {planes.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} - Gs. {new Intl.NumberFormat('es-PY').format(p.precio_mensual || 0)}/mes
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Esquema Database</label>
                  <div className="flex items-center gap-2 bg-background/50 border border-border rounded-xl px-4 py-2.5 text-gray-500">
                    <Database className="w-4 h-4" />
                    <span className="text-sm font-mono">{formData.db_schema || 'tenant_...'}</span>
                  </div>
                </div>
              </div>

              {!selectedTenant && (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex gap-4">
                    <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                    <div className="space-y-2 w-full">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="init-db"
                          checked={formData.initialize_db}
                          onChange={(e) => setFormData({...formData, initialize_db: e.target.checked})}
                          className="w-4 h-4 rounded border-border bg-background text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="init-db" className="text-xs font-bold text-amber-500 uppercase tracking-tighter">Inicializar infraestructura</label>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed font-medium italic">
                        Esta opción ejecutará el provionamiento automático (CREATE SCHEMA y creación de tablas base).
                      </p>
                      
                      {formData.initialize_db && (
                        <div className="pt-2 animate-in slide-in-from-top-1 duration-200">
                          <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Esquema Origen (Master Data)</label>
                          <select 
                            value={formData.source_schema || 'public'}
                            onChange={(e) => setFormData({...formData, source_schema: e.target.value})}
                            className="w-full bg-background border border-border/50 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-amber-500/50 appearance-none cursor-pointer"
                          >
                            {dbSchemas.map(schema => (
                              <option key={schema} value={schema}>{schema}</option>
                            ))}
                          </select>
                          <p className="text-[9px] text-gray-500 mt-1">Se copiarán perfiles, menús y datos básicos desde este esquema.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`px-8 py-2.5 rounded-xl text-foreground font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2 ${
                    isSubmitting 
                      ? 'bg-gray-700 cursor-not-allowed shadow-none' 
                      : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-border border-t-white rounded-full animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    selectedTenant ? 'Guardar Cambios' : 'Finalizar Registro'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
