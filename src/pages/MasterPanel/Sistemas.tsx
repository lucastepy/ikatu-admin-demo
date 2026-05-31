import React, { useState, useEffect } from 'react';
import { adminMasterService } from '../../services/adminMaster';
import type { Sistema } from '../../services/adminMaster';
import { toast } from 'sonner';
import { 
  Monitor, 
  Plus, 
  Search, 
  XCircle,
  Cpu,
  Info,
  Edit3,
  Trash2
} from 'lucide-react';

export default function SistemasPage() {
  const [sistemas, setSistemas] = useState<Sistema[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Sistema>>({
    nombre: '',
    descripcion: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await adminMasterService.getSistemas();
      setSistemas(data);
    } catch (error) {
      toast.error('Error al cargar sistemas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      if (editingId) {
        await adminMasterService.updateSistema(editingId, formData);
        toast.success('Sistema actualizado correctamente');
      } else {
        await adminMasterService.createSistema(formData);
        toast.success('Sistema registrado correctamente');
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ nombre: '', descripcion: '' });
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Error al guardar sistema');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, nombre: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el sistema "${nombre}"?\nEsta acción no se puede deshacer.`)) return;
    
    try {
      await adminMasterService.deleteSistema(id);
      toast.success('Sistema eliminado correctamente');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'No se pudo eliminar el sistema');
    }
  };

  const filtered = sistemas.filter(s => 
    s.nombre.toLowerCase().includes(search.toLowerCase()) ||
    s.descripcion?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Sistemas / Soluciones
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            Definición de productos de software disponibles para inquilinos
          </p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ nombre: '', descripcion: '' });
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Sistema
        </button>
      </div>

      <div className="bg-card/30 border border-border/50 rounded-2xl backdrop-blur-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-4 bg-card/20">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Buscar por nombre..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background/50 border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {loading ? (
             Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-40 bg-muted/20 rounded-2xl animate-pulse" />
             ))
          ) : filtered.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500 flex flex-col items-center">
               <Monitor className="w-12 h-12 opacity-10 mb-2" />
               <p>No hay sistemas definidos.</p>
            </div>
          ) : filtered.map((s) => (
            <div key={s.id} className="bg-background/40 border border-border p-6 rounded-2xl hover:border-blue-500/30 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -mr-12 -mt-12 transition-all group-hover:bg-blue-500/10"></div>
              
              <div className="flex items-start justify-between relative z-10">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-4 border border-blue-500/20">
                  <Monitor className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => {
                      setEditingId(s.id!);
                      setFormData({ nombre: s.nombre, descripcion: s.descripcion });
                      setShowModal(true);
                    }}
                    className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(s.id!, s.nombre)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-foreground mb-2 relative z-10">{s.nombre}</h3>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-6 min-h-[60px] relative z-10">
                {s.descripcion || 'Sin descripción disponible.'}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-border relative z-10">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                  <Info className="w-3 h-3" />
                  ID: #{s.id}
                </div>
                <div className="text-[10px] text-gray-600 font-mono">
                  {new Date(s.creado_en!).toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-accent/10 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-card border border-border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between bg-background/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                  <Plus className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{editingId ? 'Editar Sistema' : 'Nuevo Sistema'}</h3>
                  <p className="text-sm text-gray-500">Defina o edite un producto de software.</p>
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
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Nombre del Sistema</label>
                  <input 
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    placeholder="Ej: Gestión Gastronómica"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all border-l-4 border-l-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Descripción / Alcance</label>
                  <textarea 
                    rows={4}
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    placeholder="Escriba brevemente de qué trata este sistema..."
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
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
                  className={`px-8 py-2.5 rounded-xl text-foreground font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2 ${
                    isSubmitting 
                      ? 'bg-gray-700 cursor-not-allowed shadow-none' 
                      : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
                  }`}
                >
                  {isSubmitting ? 'Guardando...' : (editingId ? 'Actualizar' : 'Crear Sistema')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
