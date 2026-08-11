import React, { useState, useEffect } from 'react';
import { adminMasterService } from '../../services/adminMaster';
import type { MaestroCliente } from '../../services/adminMaster';
import { toast } from 'sonner';
import { 
  Settings, 
  Plus, 
  Search, 
  XCircle,
  Edit3,
  Trash2,
  File,
  Type,
  Hash,
  FileText,
  UploadCloud,
  CheckSquare
} from 'lucide-react';
import { ConfirmModal } from '../../components/ConfirmModal';

interface ParametroSistema {
  par_sis_id: number;
  par_sis_codigo: string;
  par_sis_descripcion: string;
  par_sis_valor: string;
  par_sis_tenantid: string;
  par_sis_adjunta_archivo: boolean;
  par_sis_usuario_alta?: string;
}

export default function ParametrosSistemaPage() {
  const [parametros, setParametros] = useState<ParametroSistema[]>([]);
  const [tenants, setTenants] = useState<MaestroCliente[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Search
  const [search, setSearch] = useState('');
  const [tenantFilter, setTenantFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [paramToDelete, setParamToDelete] = useState<ParametroSistema | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    par_sis_codigo: '',
    par_sis_descripcion: '',
    par_sis_valor: '',
    par_sis_tenantid: 'ALL',
    par_sis_adjunta_archivo: false,
  });
  
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    loadData();
  }, [page, search, tenantFilter]);

  useEffect(() => {
    const fetchTenants = async () => {
        try {
            const data = await adminMasterService.getMaestroClientes();
            setTenants(data || []);
        } catch(e) {
            console.error("Error fetching tenants:", e);
        }
    };
    fetchTenants();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const skip = (page - 1) * limit;
      const res = await adminMasterService.getParametrosSistema(skip, limit, search, tenantFilter);
      setParametros(res.items || []);
      setTotalItems(res.total || 0);
    } catch (error: any) {
      if (error.response?.status !== 401) {
        toast.error('Error al cargar parámetros del sistema');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    let finalValue: any = type === 'checkbox' ? checked : value;
    if (name === 'par_sis_codigo' && typeof finalValue === 'string') {
        finalValue = finalValue.toUpperCase();
    }
    
    setFormData(prev => ({ 
        ...prev, 
        [name]: finalValue 
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setFileName(file.name);
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({
                ...prev,
                par_sis_valor: reader.result as string
            }));
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      const payload = {
        ...formData,
        // if no tenant given by user, provide generic or ask for one
        par_sis_tenantid: formData.par_sis_tenantid || 'temp'
      };

      if (editingId) {
        await adminMasterService.updateParametroSistema(editingId, {
          par_sis_descripcion: formData.par_sis_descripcion,
          par_sis_valor: formData.par_sis_valor,
          par_sis_adjunta_archivo: formData.par_sis_adjunta_archivo
        });
        toast.success('Parámetro actualizado correctamente');
      } else {
        await adminMasterService.createParametroSistema(payload);
        toast.success('Parámetro registrado correctamente');
      }
      closeModal();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Error al guardar parámetro');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (param: ParametroSistema) => {
    setParamToDelete(param);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!paramToDelete) return;
    try {
      await adminMasterService.deleteParametroSistema(paramToDelete.par_sis_id);
      toast.success('Parámetro eliminado correctamente');
      if (page > 1 && parametros.length === 1) {
          setPage(page - 1);
      } else {
          loadData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'No se pudo eliminar el parámetro');
    } finally {
      setIsConfirmOpen(false);
      setParamToDelete(null);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFileName('');
    setFormData({
        par_sis_codigo: '',
        par_sis_descripcion: '',
        par_sis_valor: '',
        par_sis_tenantid: 'temp',
        par_sis_adjunta_archivo: false,
    });
  };

  const totalPages = Math.ceil(totalItems / limit);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Parámetros del Sistema
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-400" />
            Configura los valores globales de comportamiento (Soporta Base64)
          </p>
        </div>
        <button 
          onClick={() => {
            closeModal();
            setShowModal(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Parámetro
        </button>
      </div>

      <div className="bg-card/30 border border-border/50 rounded-2xl backdrop-blur-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center gap-4 bg-card/20">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Buscar parámetros por código o descripción..." 
              value={search}
              onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
              }}
              className="w-full bg-background/50 border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            />
          </div>
          <div className="w-full sm:w-64">
            <select
                value={tenantFilter}
                onChange={(e) => {
                    setTenantFilter(e.target.value);
                    setPage(1);
                }}
                className="w-full bg-background/50 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            >
                <option value="">Todos los Tenants</option>
                <option value="ALL">Global (ALL)</option>
                {tenants.map(t => (
                    <option key={t.id} value={t.url_slug}>{t.nombre_comercial} ({t.url_slug})</option>
                ))}
            </select>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
             <div className="flex justify-center py-20">
                 <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : parametros.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500 flex flex-col items-center">
               <Settings className="w-12 h-12 opacity-10 mb-2" />
               <p>No hay parámetros definidos o no coinciden con la búsqueda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                    <tr className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                        <th className="px-6 py-4">Código</th>
                        <th className="px-6 py-4">Descripción</th>
                        <th className="px-6 py-4">Tenant</th>
                        <th className="px-6 py-4">Tipo</th>
                        <th className="px-6 py-4">Valor</th>
                        <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {parametros.map(param => (
                        <tr key={param.par_sis_id} className="group transition-colors">
                            <td className="px-6 py-4 bg-background/40 group-hover:bg-background/80 rounded-l-2xl border-y border-l border-border/50">
                                <span className="font-mono text-xs font-medium text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg">
                                    {param.par_sis_codigo}
                                </span>
                            </td>
                            <td className="px-6 py-4 bg-background/40 group-hover:bg-background/80 border-y border-border/50">
                                <p className="text-sm text-foreground font-medium">{param.par_sis_descripcion}</p>
                            </td>
                            <td className="px-6 py-4 bg-background/40 group-hover:bg-background/80 border-y border-border/50">
                                <span className={`inline-flex items-center text-[10px] font-bold px-2 py-1 rounded border ${param.par_sis_tenantid === 'ALL' ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' : 'text-amber-500 bg-amber-500/10 border-amber-500/20'}`}>
                                    {param.par_sis_tenantid}
                                </span>
                            </td>
                            <td className="px-6 py-4 bg-background/40 group-hover:bg-background/80 border-y border-border/50">
                                {param.par_sis_adjunta_archivo ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                                        <File size={12} /> Archivo (Base64)
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-accent px-2 py-1 rounded border border-border">
                                        <Type size={12} /> Texto
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 bg-background/40 group-hover:bg-background/80 border-y border-border/50">
                                <div className="text-sm text-foreground font-medium max-w-[200px] truncate" title={param.par_sis_valor}>
                                    {param.par_sis_adjunta_archivo && param.par_sis_valor?.startsWith('data:image/') ? (
                                        <img src={param.par_sis_valor} alt="Preview" className="h-10 rounded border border-border/50 object-cover" />
                                    ) : param.par_sis_adjunta_archivo && param.par_sis_valor?.startsWith('data:') ? (
                                        <span className="text-indigo-400 text-xs">[Archivo Documento]</span>
                                    ) : (
                                        param.par_sis_valor
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 bg-background/40 group-hover:bg-background/80 rounded-r-2xl border-y border-r border-border/50 text-right">
                                <div className="flex justify-end gap-2">
                                    <button 
                                        onClick={() => {
                                            setEditingId(param.par_sis_id);
                                            setFormData({
                                                par_sis_codigo: param.par_sis_codigo,
                                                par_sis_descripcion: param.par_sis_descripcion,
                                                par_sis_valor: param.par_sis_valor,
                                                par_sis_tenantid: param.par_sis_tenantid,
                                                par_sis_adjunta_archivo: param.par_sis_adjunta_archivo || false
                                            });
                                            setFileName('');
                                            setShowModal(true);
                                        }} 
                                        className="p-2 text-muted-foreground hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteClick(param)} 
                                        className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
              </table>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                  <div className="mt-6 flex justify-between items-center border-t border-border pt-4">
                      <span className="text-sm text-muted-foreground">
                          Mostrando {parametros.length} resultados de {totalItems}
                      </span>
                      <div className="flex gap-2">
                          <button 
                              disabled={page === 1}
                              onClick={() => setPage(page - 1)}
                              className="px-4 py-2 text-sm font-medium text-muted-foreground bg-accent rounded-lg hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                              Anterior
                          </button>
                          <span className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-lg">
                              {page} / {totalPages}
                          </span>
                          <button 
                              disabled={page === totalPages}
                              onClick={() => setPage(page + 1)}
                              className="px-4 py-2 text-sm font-medium text-muted-foreground bg-accent rounded-lg hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                              Siguiente
                          </button>
                      </div>
                  </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-accent/10 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-card border border-border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between bg-background/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center">
                  <Settings className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{editingId ? 'Editar Parámetro' : 'Nuevo Parámetro'}</h3>
                  <p className="text-sm text-muted-foreground">Configura un valor del sistema.</p>
                </div>
              </div>
              <button 
                onClick={closeModal}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <Hash size={14} className="text-indigo-400" /> Código
                    </label>
                    <input
                        type="text" required
                        name="par_sis_codigo"
                        value={formData.par_sis_codigo}
                        onChange={handleChange}
                        disabled={!!editingId}
                        className={`w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none transition-all uppercase ${!!editingId ? 'text-muted-foreground cursor-not-allowed opacity-70' : 'focus:ring-2 focus:ring-indigo-500/20 border-l-4 border-l-indigo-500 font-mono text-sm'}`}
                        placeholder="EJ: MAX_USERS"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <FileText size={14} className="text-amber-400" /> Descripción
                    </label>
                    <input
                        type="text" required
                        name="par_sis_descripcion"
                        value={formData.par_sis_descripcion}
                        onChange={handleChange}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                        placeholder="Descripción breve del parámetro"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <File size={14} className="text-blue-400" /> Tenant Asociado
                    </label>
                    <select
                        required
                        name="par_sis_tenantid"
                        value={formData.par_sis_tenantid}
                        onChange={handleChange}
                        disabled={!!editingId}
                        className={`w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none transition-all text-sm ${!!editingId ? 'text-muted-foreground cursor-not-allowed opacity-70' : 'focus:ring-2 focus:ring-indigo-500/20'}`}
                    >
                        <option value="ALL">Todos los Tenants</option>
                        {tenants.filter(t => t.db_schema !== 'public').map(t => (
                            <option key={t.id} value={t.url_slug}>
                                {t.nombre_comercial} ({t.url_slug})
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-accent/30 rounded-xl border border-border/50">
                    <input
                        type="checkbox"
                        id="par_sis_adjunta_archivo"
                        name="par_sis_adjunta_archivo"
                        checked={formData.par_sis_adjunta_archivo}
                        onChange={handleChange}
                        className="w-5 h-5 text-indigo-500 bg-background border-border rounded focus:ring-indigo-500 focus:ring-offset-background"
                    />
                    <label htmlFor="par_sis_adjunta_archivo" className="text-sm font-medium text-foreground flex items-center gap-2 cursor-pointer">
                        <CheckSquare size={16} className="text-muted-foreground" />
                        Adjuntar Archivo (Base64)
                    </label>
                </div>

                {formData.par_sis_adjunta_archivo ? (
                    <div className="space-y-2 mt-4">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <UploadCloud size={14} className="text-emerald-400" /> Subir Archivo
                        </label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-xl hover:border-indigo-500/50 transition-colors bg-accent/10 relative group overflow-hidden">
                            <div className="space-y-1 text-center relative z-10">
                                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground group-hover:text-indigo-400 transition-colors" />
                                <div className="flex text-sm text-foreground justify-center mt-2">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-background border border-border px-3 py-1.5 rounded-md font-medium text-indigo-400 hover:text-indigo-300 transition-colors shadow-sm focus-within:outline-none">
                                        <span>{fileName ? 'Cambiar archivo' : 'Seleccionar'}</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="*/*" />
                                    </label>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {fileName ? `Archivo: ${fileName}` : 'Cualquier formato será codificado a Base64'}
                                </p>
                            </div>
                        </div>
                        {!fileName && editingId && formData.par_sis_valor?.startsWith('data:') && (
                            <div className="mt-4 flex flex-col items-center gap-2">
                                <p className="text-xs text-emerald-400 flex items-center gap-1"><CheckSquare size={12}/> Ya existe un archivo guardado.</p>
                                {formData.par_sis_valor.startsWith('data:image/') && (
                                    <img src={formData.par_sis_valor} alt="Preview" className="max-h-32 rounded-xl border border-border/50 shadow-sm object-contain" />
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-2 mt-4">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <Type size={14} className="text-emerald-400" /> Valor
                        </label>
                        <textarea
                            required={!formData.par_sis_adjunta_archivo}
                            name="par_sis_valor"
                            value={formData.par_sis_valor}
                            onChange={handleChange}
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all min-h-[120px] resize-none text-sm"
                            placeholder="Escribe el valor aquí..."
                        />
                    </div>
                )}
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border/50">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-6 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-all font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`px-8 py-2.5 rounded-xl text-white font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2 ${
                    isSubmitting 
                      ? 'bg-gray-600 cursor-not-allowed shadow-none' 
                      : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
                  }`}
                >
                  {isSubmitting ? 'Guardando...' : (editingId ? 'Actualizar' : 'Guardar Parámetro')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isConfirmOpen}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="¿Eliminar parámetro?"
        message={`Esta acción eliminará definitivamente el parámetro "${paramToDelete?.par_sis_codigo}".`}
        confirmText="Eliminar"
      />
    </div>
  );
}
