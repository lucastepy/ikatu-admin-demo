import React, { useState, useEffect } from 'react';
import { adminMasterService } from '../../services/adminMaster';
import type { Plan } from '../../services/adminMaster';
import { ConfirmModal } from '../../components/ConfirmModal';
import { toast } from 'sonner';
import {
  Rocket,
  Plus,
  Trash2,
  Edit2,
  XCircle,
  Banknote,
  Trash
} from 'lucide-react';

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<Plan>>({
    nombre: ''
  });
  const [showTarifasModal, setShowTarifasModal] = useState(false);
  const [tarifasPlan, setTarifasPlan] = useState<Plan | null>(null);
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { }
  });

  const confirmAction = (title: string, message: string, onConfirm: () => void) => {
    setConfirmConfig({ isOpen: true, title, message, onConfirm });
  };

  const closeConfirm = () => setConfirmConfig(prev => ({ ...prev, isOpen: false }));

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
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    confirmAction(
      'Eliminar Plan',
      '¿Está seguro de eliminar este plan? Esta acción no se puede deshacer.',
      async () => {
        try {
          await adminMasterService.deletePlan(id);
          toast.success('Plan eliminado');
          loadPlans();
        } catch (error) {
          toast.error('No se puede eliminar un plan en uso');
        } finally {
          closeConfirm();
        }
      }
    );
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
            setFormData({ nombre: '' });
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
        ) : plans.map((plan) => (
          <div key={plan.id} className="relative group overflow-hidden bg-background border border-border rounded-3xl p-8 flex flex-col hover:border-indigo-500/50 transition-all duration-300 shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1">

            <div className="mb-8 flex-1">
              <h3 className="text-2xl font-bold text-foreground mb-2">{plan.nombre}</h3>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setTarifasPlan(plan);
                  setShowTarifasModal(true);
                }}
                className="flex-1 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white text-indigo-500 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                title="Configurar Tarifas"
              >
                <Banknote className="w-4 h-4" /> Tarifas
              </button>
              <button
                onClick={() => {
                  setSelectedPlan(plan);
                  setFormData(plan);
                  setShowModal(true);
                }}
                className="flex-1 bg-card border border-border hover:border-gray-400 hover:text-gray-300 text-muted-foreground py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
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
              <div className="space-y-1 pb-4">
                <label className="text-xs font-bold text-gray-500 uppercase">Nombre del Plan</label>
                <input
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="pt-4 border-t border-border">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 text-white font-bold rounded-xl shadow-lg transition-all ${isSubmitting ? 'bg-gray-600 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
                    }`}
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTarifasModal && tarifasPlan && (
        <ManageTarifasModal
          plan={plans.find(p => p.id === tarifasPlan.id) || tarifasPlan}
          onClose={() => setShowTarifasModal(false)}
          onRefresh={loadPlans}
        />
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



// ----------------------------------------------------
// COMPONENTE: GESTIÓN DE TARIFAS (COBROS Y TRAMOS)
// ----------------------------------------------------

function ManageTarifasModal({ plan, onClose, onRefresh }: { plan: Plan; onClose: () => void; onRefresh: () => void }) {
  const [newCobro, setNewCobro] = useState({ plan_cob_tipo_cobro: 'MENSUAL_FIJO', plan_cob_monto_base: '' });
  const [newTramo, setNewTramo] = useState({ plan_cob_id: 0, rango_hasta: '', monto: '' });

  const [editingCobroId, setEditingCobroId] = useState<number | null>(null);
  const [editingCobroMonto, setEditingCobroMonto] = useState<string>('');

  const [editingTramoId, setEditingTramoId] = useState<number | null>(null);
  const [editingTramoMonto, setEditingTramoMonto] = useState<string>('');

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { }
  });

  const confirmAction = (title: string, message: string, onConfirm: () => void) => {
    setConfirmConfig({ isOpen: true, title, message, onConfirm });
  };

  const closeConfirm = () => setConfirmConfig(prev => ({ ...prev, isOpen: false }));

  const formatNumber = (val: string | number) => {
    if (!val && val !== 0) return '';
    const num = Number(val.toString().replace(/\D/g, ''));
    return new Intl.NumberFormat('es-PY').format(num);
  };

  const parseNumber = (val: string) => Number(val.replace(/\D/g, ''));

  const handleCreateCobro = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminMasterService.createPlanCobro(plan.id!, {
        ...newCobro,
        plan_cob_monto_base: parseNumber(newCobro.plan_cob_monto_base)
      });
      toast.success('Cobro agregado exitosamente');
      onRefresh();
      setNewCobro({ plan_cob_tipo_cobro: 'MENSUAL_FIJO', plan_cob_monto_base: '' });
    } catch (e) {
      toast.error('Error al agregar cobro');
    }
  };

  const handleUpdateCobro = async (cobro_id: number) => {
    try {
      await adminMasterService.updatePlanCobro(cobro_id, { plan_cob_monto_base: parseNumber(editingCobroMonto) });
      toast.success('Cobro actualizado');
      setEditingCobroId(null);
      onRefresh();
    } catch (e) {
      toast.error('Error al actualizar');
    }
  };

  const handleDeleteCobro = async (cobro_id: number) => {
    confirmAction(
      'Eliminar Cobro',
      '¿Eliminar este cobro y todos sus tramos?',
      async () => {
        try {
          await adminMasterService.deletePlanCobro(cobro_id);
          toast.success('Cobro eliminado');
          onRefresh();
        } catch (e) {
          toast.error('Error al eliminar');
        } finally {
          closeConfirm();
        }
      }
    );
  };

  const handleCreateTramo = async (e: React.FormEvent, cobro_id: number, nextDesde: number) => {
    e.preventDefault();
    if (newTramo.rango_hasta && Number(newTramo.rango_hasta) <= nextDesde) {
      toast.error('El límite "Hasta" debe ser mayor que "Desde"');
      return;
    }
    try {
      const data = {
        plan_cob_tra_rango_desde: nextDesde,
        plan_cob_tra_rango_hasta: newTramo.rango_hasta ? Number(newTramo.rango_hasta) : null,
        plan_cob_tra_monto_por_tramo: parseNumber(newTramo.monto)
      };
      await adminMasterService.createPlanCobroTramo(cobro_id, data);
      toast.success('Tramo agregado');
      onRefresh();
      setNewTramo({ plan_cob_id: 0, rango_hasta: '', monto: '' });
    } catch (e) {
      toast.error('Error al agregar tramo');
    }
  };

  const handleUpdateTramo = async (tramo_id: number) => {
    try {
      await adminMasterService.updatePlanCobroTramo(tramo_id, { plan_cob_tra_monto_por_tramo: parseNumber(editingTramoMonto) });
      toast.success('Tramo actualizado');
      setEditingTramoId(null);
      onRefresh();
    } catch (e) {
      toast.error('Error al actualizar');
    }
  };

  const handleDeleteTramo = async (tramo_id: number) => {
    confirmAction(
      'Eliminar Tramo',
      '¿Seguro que desea eliminar este tramo?',
      async () => {
        try {
          await adminMasterService.deletePlanCobroTramo(tramo_id);
          toast.success('Tramo eliminado');
          onRefresh();
        } catch (e) {
          toast.error('Error al eliminar');
        } finally {
          closeConfirm();
        }
      }
    );
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-accent/20 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Cabecera */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-indigo-500/5">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2"><Banknote className="text-indigo-500" /> Tarifas: {plan.nombre}</h3>
            <p className="text-xs text-muted-foreground">Estructura de cobros y tramos del plan</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-foreground"><XCircle className="w-6 h-6" /></button>
        </div>

        {/* Contenido (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1 space-y-8 bg-background/50">

          {/* Seccion 1: Crear Nuevo Cobro */}
          <div className="bg-card border border-border p-5 rounded-2xl">
            <h4 className="text-sm font-bold uppercase text-gray-500 mb-4">Agregar Nuevo Cobro</h4>
            <form onSubmit={handleCreateCobro} className="flex items-end gap-4">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-bold text-gray-400">TIPO DE COBRO</label>
                <select
                  className="w-full bg-background border border-border rounded-xl px-4 py-2"
                  value={newCobro.plan_cob_tipo_cobro}
                  onChange={(e) => setNewCobro({ ...newCobro, plan_cob_tipo_cobro: e.target.value })}
                >
                  <option value="INICIAL">Setup / Inicial (Única vez)</option>
                  <option value="MENSUAL_FIJO">Mensual Fijo</option>
                  <option value="MENSUAL_TRAMOS">Mensual por Tramos (Volumen)</option>
                </select>
              </div>
              {newCobro.plan_cob_tipo_cobro !== 'MENSUAL_TRAMOS' && (
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-bold text-gray-400">MONTO BASE (Gs.)</label>
                  <input
                    type="text" required
                    className="w-full bg-background border border-border rounded-xl px-4 py-2"
                    value={newCobro.plan_cob_monto_base}
                    onChange={(e) => setNewCobro({ ...newCobro, plan_cob_monto_base: formatNumber(e.target.value) })}
                  />
                </div>
              )}
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-xl h-[42px]">
                Agregar
              </button>
            </form>
          </div>

          {/* Seccion 2: Lista de Cobros Existentes */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase text-gray-500">Cobros Activos ({plan.cobros?.length || 0})</h4>

            {plan.cobros?.length === 0 && (
              <p className="text-center py-6 text-gray-500 italic border border-dashed border-border rounded-2xl">
                No hay reglas de cobro definidas para este plan.
              </p>
            )}

            {plan.cobros?.map(cobro => (
              <div key={cobro.plan_cob_id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">

                {/* Cabecera del Cobro */}
                <div className="p-4 flex items-center justify-between bg-muted/20 border-b border-border">
                  <div className="flex items-center gap-3">
                    <span className="bg-indigo-500/10 text-indigo-400 text-xs font-black uppercase px-3 py-1 rounded-md border border-indigo-500/20">
                      {cobro.plan_cob_tipo_cobro}
                    </span>
                    <div className="flex items-center gap-2">
                      {cobro.plan_cob_tipo_cobro !== 'MENSUAL_TRAMOS' && (
                        editingCobroId === cobro.plan_cob_id ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-gray-500">Gs.</span>
                            <input
                              autoFocus
                              type="text"
                              className="bg-background border border-indigo-500 rounded-md px-2 py-1 text-sm font-mono font-bold w-32"
                              value={editingCobroMonto}
                              onChange={(e) => setEditingCobroMonto(formatNumber(e.target.value))}
                            />
                            <button onClick={() => handleUpdateCobro(cobro.plan_cob_id!)} className="bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white px-2 py-1 rounded-md text-xs font-bold">Guardar</button>
                            <button onClick={() => setEditingCobroId(null)} className="text-gray-500 hover:text-foreground text-xs">Cancelar</button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 group/edit">
                            <span className="font-mono text-lg font-bold">Gs. {new Intl.NumberFormat('es-PY').format(cobro.plan_cob_monto_base)} <span className="text-xs text-gray-500">(Base)</span></span>
                            <button onClick={() => { setEditingCobroId(cobro.plan_cob_id!); setEditingCobroMonto(formatNumber(cobro.plan_cob_monto_base.toString())); }} className="text-gray-400 hover:text-indigo-400 opacity-60 hover:opacity-100 transition-opacity">
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                  <button onClick={() => handleDeleteCobro(cobro.plan_cob_id!)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors">
                    <Trash className="w-4 h-4" />
                  </button>
                </div>

                {/* Tramos (Solo si es de tramos o si tiene tramos por diseño) */}
                {cobro.plan_cob_tipo_cobro === 'MENSUAL_TRAMOS' && (
                  <div className="p-4 bg-background">
                    <p className="text-xs font-bold uppercase text-gray-400 mb-3 ml-1">Configuración de Tramos</p>

                    {/* Lista de tramos de este cobro */}
                    <div className="space-y-2 mb-4">
                      {cobro.tramos?.map((tramo, index) => (
                        <div key={tramo.plan_cob_tra_id} className="flex items-center justify-between bg-muted/10 border border-border p-3 rounded-xl">
                          <div className="flex items-center gap-4 text-sm font-mono">
                            <span className="text-gray-400">De:</span>
                            <span className="font-bold">{tramo.plan_cob_tra_rango_desde} txs</span>
                            <span className="text-gray-400">Hasta:</span>
                            <span className="font-bold">{tramo.plan_cob_tra_rango_hasta || '∞'} txs</span>
                            <span className="text-gray-400 ml-4">Costo:</span>
                            {editingTramoId === tramo.plan_cob_tra_id ? (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500 font-bold">Gs.</span>
                                <input
                                  autoFocus
                                  type="text"
                                  className="bg-background border border-indigo-500 rounded-md px-2 py-1 text-sm font-mono font-bold w-24"
                                  value={editingTramoMonto}
                                  onChange={(e) => setEditingTramoMonto(formatNumber(e.target.value))}
                                />
                                <button onClick={() => handleUpdateTramo(tramo.plan_cob_tra_id!)} className="bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white px-2 py-1 rounded-md text-xs font-bold">Ok</button>
                                <button onClick={() => setEditingTramoId(null)} className="text-gray-500 hover:text-foreground text-xs">X</button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 group/edit-tramo">
                                <span className="font-bold text-emerald-500">Gs. {new Intl.NumberFormat('es-PY').format(tramo.plan_cob_tra_monto_por_tramo)}</span>
                                <button onClick={() => { setEditingTramoId(tramo.plan_cob_tra_id!); setEditingTramoMonto(formatNumber(tramo.plan_cob_tra_monto_por_tramo.toString())); }} className="text-gray-400 hover:text-indigo-400 opacity-60 hover:opacity-100 transition-opacity">
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                          {index === cobro.tramos!.length - 1 && (
                            <button onClick={() => handleDeleteTramo(tramo.plan_cob_tra_id!)} className="text-red-500/60 hover:text-red-500">
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Agregar nuevo tramo (solo si el ultimo tramo no es infinito) */}
                    {(!cobro.tramos || cobro.tramos.length === 0 || cobro.tramos[cobro.tramos.length - 1].plan_cob_tra_rango_hasta !== null) && (() => {
                      const nextDesde = (cobro.tramos && cobro.tramos.length > 0) ? cobro.tramos[cobro.tramos.length - 1].plan_cob_tra_rango_hasta! + 1 : 1;
                      return (
                        <form
                          onSubmit={(e) => handleCreateTramo(e, cobro.plan_cob_id!, nextDesde)}
                          className="flex items-end gap-2 bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/20"
                        >
                          <div className="flex-[0.5] space-y-1 opacity-60">
                            <label className="text-[10px] font-bold text-gray-500">DESDE</label>
                            <input type="text" readOnly className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-sm font-bold text-gray-500" value={nextDesde} />
                          </div>
                          <div className="flex-1 space-y-1">
                            <label className="text-[10px] font-bold text-gray-500">HASTA (Vacío = Infinito)</label>
                            <input type="number" className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-sm" placeholder="∞" value={newTramo.plan_cob_id === cobro.plan_cob_id ? newTramo.rango_hasta : ''} onChange={(e) => setNewTramo({ ...newTramo, plan_cob_id: cobro.plan_cob_id!, rango_hasta: e.target.value })} />
                          </div>
                          <div className="flex-1 space-y-1">
                            <label className="text-[10px] font-bold text-gray-500">COSTO TRAMO (Gs.)</label>
                            <input type="text" required className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-sm font-bold" value={newTramo.plan_cob_id === cobro.plan_cob_id ? newTramo.monto : ''} onChange={(e) => setNewTramo({ ...newTramo, plan_cob_id: cobro.plan_cob_id!, monto: formatNumber(e.target.value) })} />
                          </div>
                          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg h-[34px]">
                            + Tramo
                          </button>
                        </form>
                      );
                    })()}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>

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
