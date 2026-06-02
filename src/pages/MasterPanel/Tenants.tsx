import React, { useState, useEffect } from 'react';
import { adminMasterService } from '../../services/adminMaster';
import type { MaestroCliente, Plan, Sistema, Suscripcion } from '../../services/adminMaster';
import { toast } from 'sonner';
import { ConfirmModal } from '../../components/ConfirmModal';
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
  Database,
  CreditCard,
  Calendar,
  Pencil,
  Save,
  Ban,
  Trash2
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

  // Estados para Planes / Suscripciones
  const [suscripciones, setSuscripciones] = useState<Suscripcion[]>([]);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [selectedPlansTenant, setSelectedPlansTenant] = useState<MaestroCliente | null>(null);
  const [newSubForm, setNewSubForm] = useState({ plan_id: 0, fecha_inicio: '' });
  const [editingSubId, setEditingSubId] = useState<number | null>(null);
  const [editSubForm, setEditSubForm] = useState<Partial<Suscripcion>>({});

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const closeConfirm = () => setConfirmConfig(prev => ({ ...prev, isOpen: false }));

  const [formData, setFormData] = useState<Partial<MaestroCliente>>({
    nombre_comercial: '',
    url_slug: '',
    db_schema: '',
    email_contacto: '',
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
      const [tenantsData, planesData, schemasData, sistemasData, subsData] = await Promise.all([
        adminMasterService.getMaestroClientes(),
        adminMasterService.getPlanes(),
        adminMasterService.getSchemas(),
        adminMasterService.getSistemas(),
        adminMasterService.getSuscripciones()
      ]);
      setTenants(tenantsData);
      setPlanes(planesData);
      setDbSchemas(schemasData);
      setSistemas(sistemasData);
      setSuscripciones(subsData);
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
            <p className="text-xs text-gray-500 font-medium">Con Logo</p>
            <p className="text-2xl font-bold">{tenants.filter(t => t.logo_url).length}</p>
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
                <th className="px-6 py-4">Sistema</th>
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
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => {
                          setSelectedPlansTenant(t);
                          setNewSubForm({ plan_id: planes.length > 0 ? planes[0].id! : 0, fecha_inicio: new Date().toISOString().split('T')[0] });
                          setShowPlansModal(true);
                        }}
                        className="p-2 text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all"
                        title="Gestionar Planes Comerciales"
                      >
                        <CreditCard className="w-4 h-4" />
                      </button>
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
                  <label className="text-sm font-medium text-muted-foreground">Esquema Database</label>
                  <div className="flex items-center gap-2 bg-background/50 border border-border rounded-xl px-4 py-2.5 text-gray-500">
                    <Database className="w-4 h-4" />
                    <span className="text-sm font-mono">{formData.db_schema || 'tenant_...'}</span>
                  </div>
                </div>

                {selectedTenant && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Estado</label>
                    <div className="flex items-center gap-3 bg-background/50 border border-border rounded-xl px-4 py-2.5">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, estado: !formData.estado})}
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${formData.estado ? 'bg-emerald-500' : 'bg-red-500'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${formData.estado ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                      <span className={`text-sm font-bold ${formData.estado ? 'text-emerald-500' : 'text-red-500'}`}>
                        {formData.estado ? 'ACTIVO' : 'SUSPENDIDO'}
                      </span>
                    </div>
                  </div>
                )}
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
                  className={`px-8 py-2.5 rounded-xl text-white font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2 ${
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
                    'Guardar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPlansModal && selectedPlansTenant && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-accent/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-400" />
                  Planes Comerciales
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Suscripciones de: <span className="font-bold text-foreground">{selectedPlansTenant.nombre_comercial}</span></p>
              </div>
              <button onClick={() => setShowPlansModal(false)} className="text-gray-500 hover:text-foreground"><XCircle /></button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              <div className="bg-background border border-border p-5 rounded-2xl">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Nueva Suscripción</h4>
                <div className="flex gap-4 items-end">
                  <div className="flex-1 space-y-1">
                    <label className="text-xs font-bold text-gray-400">Plan de Servicio</label>
                    <select 
                      className="w-full bg-card border border-border rounded-xl px-4 py-2"
                      value={newSubForm.plan_id}
                      onChange={(e) => setNewSubForm({...newSubForm, plan_id: Number(e.target.value)})}
                    >
                      <option value={0}>Seleccione un plan...</option>
                      {planes.filter(p => !suscripciones.some(s => s.cliente_id === selectedPlansTenant?.id && s.plan_id === p.id)).map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-xs font-bold text-gray-400">Fecha de Inicio</label>
                    <input 
                      type="date"
                      className="w-full bg-card border border-border rounded-xl px-4 py-2"
                      value={newSubForm.fecha_inicio}
                      onChange={(e) => setNewSubForm({...newSubForm, fecha_inicio: e.target.value})}
                    />
                  </div>
                  <button 
                    onClick={async () => {
                      if (!newSubForm.plan_id) return toast.error("Seleccione un plan");
                      if (!newSubForm.fecha_inicio) return toast.error("Seleccione fecha inicio");
                      const alreadyHasPlan = suscripciones.some(s => s.cliente_id === selectedPlansTenant?.id && s.plan_id === newSubForm.plan_id);
                      if (alreadyHasPlan) return toast.error("Este plan ya está asignado al cliente");
                      try {
                        await adminMasterService.createSuscripcion({
                          cliente_id: selectedPlansTenant.id,
                          plan_id: newSubForm.plan_id,
                          fecha_inicio: newSubForm.fecha_inicio,
                          esta_activa: true
                        });
                        toast.success("Plan asignado correctamente");
                        loadData();
                      } catch(e) {
                        toast.error("Error al asignar plan");
                      }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-xl h-[42px]"
                  >
                    Asignar Plan
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Planes Activos</h4>
                <div className="space-y-3">
                  {suscripciones.filter(s => s.cliente_id === selectedPlansTenant.id).length === 0 ? (
                    <p className="text-sm text-gray-500 italic text-center py-4">No tiene planes asignados.</p>
                  ) : (
                    suscripciones.filter(s => s.cliente_id === selectedPlansTenant.id).map(sub => {
                      const p = planes.find(x => x.id === sub.plan_id);
                      return (
                        <div key={sub.id} className="flex flex-col gap-2 p-4 bg-background border border-border rounded-xl">
                          {editingSubId === sub.id ? (
                            <div className="flex flex-col gap-4">
                              <div className="flex gap-4 items-end">
                                <div className="flex-1 space-y-1">
                                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Plan</label>
                                  <select 
                                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                                    value={editSubForm.plan_id || ''}
                                    onChange={(e) => setEditSubForm({...editSubForm, plan_id: Number(e.target.value)})}
                                  >
                                    {planes.map(pl => <option key={pl.id} value={pl.id}>{pl.nombre}</option>)}
                                  </select>
                                </div>
                                <div className="flex-1 space-y-1">
                                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Inicio</label>
                                  <input 
                                    type="date"
                                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                                    value={editSubForm.fecha_inicio || ''}
                                    onChange={(e) => setEditSubForm({...editSubForm, fecha_inicio: e.target.value})}
                                  />
                                </div>
                                <div className="flex items-center gap-2 pb-2">
                                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Activo</label>
                                  <button
                                    type="button"
                                    onClick={() => setEditSubForm({...editSubForm, esta_activa: !editSubForm.esta_activa})}
                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${editSubForm.esta_activa ? 'bg-emerald-500' : 'bg-gray-700'}`}
                                  >
                                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${editSubForm.esta_activa ? 'translate-x-5' : 'translate-x-1'}`} />
                                  </button>
                                </div>
                              </div>
                              <div className="flex justify-end gap-2 border-t border-border pt-3">
                                <button 
                                  onClick={() => setEditingSubId(null)}
                                  className="px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                                >
                                  <Ban className="w-3.5 h-3.5" /> Cancelar
                                </button>
                                <button 
                                  onClick={async () => {
                                    try {
                                      if(!sub.id) return;
                                      await adminMasterService.updateSuscripcion(sub.id, editSubForm);
                                      toast.success("Plan actualizado correctamente");
                                      setEditingSubId(null);
                                      loadData();
                                    } catch(e) {
                                      toast.error("Error al actualizar");
                                    }
                                  }}
                                  className="px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-1 transition-colors"
                                >
                                  <Save className="w-3.5 h-3.5" /> Guardar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-bold text-indigo-400 flex items-center gap-2">
                                  {p?.nombre || 'Plan Desconocido'}
                                </p>
                                <div className="flex flex-col gap-2 mt-1">
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Calendar className="w-3 h-3" />
                                    Inicio: {(() => {
                                      const [y, m, d] = sub.fecha_inicio.split('T')[0].split('-');
                                      return `${d}/${m}/${y}`;
                                    })()}
                                  </div>
                                  
                                  {/* Resumen de Tipos de Cobro */}
                                  {p?.cobros && p.cobros.length > 0 && (
                                    <div className="flex flex-wrap items-start gap-3 mt-2">
                                      {p.cobros.map(c => (
                                        <div key={c.plan_cob_id || Math.random()} className="text-xs bg-card border border-border/50 shadow-sm px-3 py-2 rounded-xl flex flex-col gap-2 min-w-[180px]">
                                          <div className="flex items-center justify-between gap-3">
                                            <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">
                                              {c.plan_cob_tipo_cobro === 'MENSUAL_FIJO' && 'Mensual Fijo'}
                                              {c.plan_cob_tipo_cobro === 'INICIAL' && 'Pago Inicial'}
                                              {c.plan_cob_tipo_cobro === 'MENSUAL_TRAMOS' && 'Mensual por Tramos'}
                                            </span>
                                            {c.plan_cob_tipo_cobro !== 'MENSUAL_TRAMOS' ? (
                                              <span className="text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded-md font-bold">
                                                Gs. {new Intl.NumberFormat('es-PY').format(c.plan_cob_monto_base)}
                                              </span>
                                            ) : c.plan_cob_monto_base > 0 ? (
                                              <span className="text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded-md font-bold text-[10px]" title="Cargo base fijo">
                                                Base: Gs. {new Intl.NumberFormat('es-PY').format(c.plan_cob_monto_base)}
                                              </span>
                                            ) : null}
                                          </div>
                                          
                                          {c.plan_cob_tipo_cobro === 'MENSUAL_TRAMOS' && c.tramos && c.tramos.length > 0 && (
                                            <div className="flex flex-col gap-1.5 pt-2 mt-1 border-t border-border/50">
                                              {c.tramos.map(t => (
                                                <div key={t.plan_cob_tra_id || Math.random()} className="flex items-center justify-between gap-4">
                                                  <span className="text-gray-500 text-[11px]">
                                                    {t.plan_cob_tra_rango_hasta ? `De ${t.plan_cob_tra_rango_desde} a ${t.plan_cob_tra_rango_hasta}` : `Más de ${t.plan_cob_tra_rango_desde}`}
                                                  </span>
                                                  <span className="text-indigo-400 font-mono text-[11px]">Gs. {new Intl.NumberFormat('es-PY').format(t.plan_cob_tra_monto_por_tramo)} c/u</span>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                {sub.esta_activa ? (
                                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-1 rounded-md uppercase">Activo</span>
                                ) : (
                                  <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold px-2 py-1 rounded-md uppercase">Inactivo</span>
                                )}
                                <button 
                                  onClick={() => {
                                    setEditingSubId(sub.id!);
                                    setEditSubForm({
                                      plan_id: sub.plan_id,
                                      fecha_inicio: sub.fecha_inicio.split('T')[0],
                                      esta_activa: sub.esta_activa
                                    });
                                  }}
                                  className="text-gray-500 hover:text-indigo-400 p-1.5 rounded-lg hover:bg-indigo-500/10 transition-all"
                                  title="Editar Plan"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => {
                                    setConfirmConfig({
                                      isOpen: true,
                                      title: 'Eliminar Suscripción',
                                      message: '¿Estás seguro de eliminar este plan comercial de la empresa? Se perderá el historial asociado.',
                                      onConfirm: async () => {
                                        try {
                                          closeConfirm();
                                          await adminMasterService.deleteSuscripcion(sub.id!);
                                          toast.success("Plan eliminado correctamente");
                                          loadData();
                                        } catch(e) {
                                          toast.error("Error al eliminar plan");
                                        }
                                      }
                                    });
                                  }}
                                  className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-all"
                                  title="Eliminar Plan"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
}
