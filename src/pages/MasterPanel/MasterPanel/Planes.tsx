import React, { useState, useEffect } from 'react';
import { adminMasterService } from '../../services/adminMaster';
import type { Plan } from '../../services/adminMaster';
import { toast } from 'sonner';
import { 
  Rocket, 
  Plus, 
  Trash2, 
  Edit2, 
  XCircle,
  Crown
} from 'lucide-react';

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState<Partial<Plan>>({
    nombre: '',
    precio_mensual: 0,
    limite_usuarios: 5,
    limite_sucursales: 1
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await adminMasterService.getPlanes();
      setPlans(data);
    } catch (error) {
      toast.error('Error al cargar planes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedPlan) {
        await adminMasterService.updatePlan(selectedPlan.id!, formData);
        toast.success('Plan actualizado');
      } else {
        await adminMasterService.createPlan(formData);
        toast.success('Nuevo nivel de servicio creado');
      }
      setShowModal(false);
      loadPlans();
    } catch (error) {
      toast.error('Error al guardar el plan');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este plan?')) return;
    try {
      await adminMasterService.deletePlan(id);
      toast.success('Plan eliminado');
      loadPlans();
    } catch (error) {
      toast.error('No se puede eliminar un plan en uso');
    }
  };

  const formatPrice = (val: any) => {
    if (val === undefined || val === null) return '0';
    return new Intl.NumberFormat('es-PY').format(Number(val));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, precio_mensual: Number(rawValue) });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Rocket className="w-8 h-8 text-indigo-400" />
            Planes de Servicio
          </h1>
          <p className="text-muted-foreground mt-1">Defina los niveles de acceso y límites de la plataforma SaaS.</p>
        </div>
        <button 
          onClick={() => {
            setSelectedPlan(null);
            setFormData({ nombre: '', precio_mensual: 0, limite_usuarios: 5, limite_sucursales: 1 });
            setShowModal(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Crear Nivel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-96 bg-card animate-pulse rounded-3xl border border-border"></div>
          ))
        ) : plans.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-3xl">
            <p className="text-gray-500">No hay planes definidos.</p>
          </div>
        ) : [...plans].sort((a,b) => (a.precio_mensual || 0) - (b.precio_mensual || 0)).map((plan) => (
          <div key={plan.id} className="relative group overflow-hidden bg-background border border-border rounded-3xl p-8 flex flex-col hover:border-indigo-500/50 transition-all duration-300 shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1">
             {(plan.precio_mensual || 0) > 0 && plan.id === [...plans].sort((a,b) => (b.precio_mensual || 0) - (a.precio_mensual || 0))[0].id && (
               <div className="absolute top-4 right-4 bg-indigo-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-indigo-500/30">
                 <Crown className="w-3 h-3" /> Popular
               </div>
             )}

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-2">{plan.nombre}</h3>
              <div className="flex items-baseline gap-1 mt-4">
                <span className="text-4xl font-extrabold text-foreground">Gs. {formatPrice(plan.precio_mensual)}</span>
                <span className="text-gray-500 text-sm">/mes</span>
              </div>
            </div>

            <div className="space-y-4 mb-10 flex-1">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <CheckCircleSubtle />
                </div>
                <span className="text-sm font-medium">Hasta <b>{plan.limite_usuarios}</b> Usuarios</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <CheckCircleSubtle />
                </div>
                <span className="text-sm font-medium">Hasta <b>{plan.limite_sucursales}</b> Sucursal</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <CheckCircleSubtle />
                </div>
                <span className="text-sm font-medium">Soporte Estándar</span>
              </div>
            </div>

            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => {
                  setSelectedPlan(plan);
                  setFormData(plan);
                  setShowModal(true);
                }}
                className="flex-1 bg-card border border-border hover:border-indigo-500 hover:text-indigo-400 text-muted-foreground py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" /> Editar
              </button>
              <button 
                onClick={() => handleDelete(plan.id!)}
                className="bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-500 p-2.5 rounded-xl transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-accent/10 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-xl font-bold">{selectedPlan ? 'Editar Plan' : 'Nuevo Nivel de Servicio'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-foreground"><XCircle /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Nombre del Plan</label>
                <input 
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Precio Mensual (Gs.)</label>
                <input 
                  type="text"
                  required
                  value={formatPrice(formData.precio_mensual)}
                  onChange={handlePriceChange}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <label className="text-xs font-bold text-gray-500 uppercase">Límite Usuarios</label>
                  <input 
                    type="number"
                    value={formData.limite_usuarios}
                    onChange={(e) => setFormData({...formData, limite_usuarios: Number(e.target.value)})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="space-y-1">
                   <label className="text-xs font-bold text-gray-500 uppercase">Límite Sucursales</label>
                  <input 
                    type="number"
                    value={formData.limite_sucursales}
                    onChange={(e) => setFormData({...formData, limite_sucursales: Number(e.target.value)})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all">
                  Guardar Nivel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckCircleSubtle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor"/>
    </svg>
  );
}
