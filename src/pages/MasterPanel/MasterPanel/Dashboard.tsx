import { useState, useEffect } from 'react';
import { adminMasterService } from '../../services/adminMaster';
import type { MaestroCliente, Suscripcion, Plan } from '../../services/adminMaster';
import { 
  Building2, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Search,
  TrendingUp,
  Clock,
  ClipboardList
} from 'lucide-react';
import { toast } from 'sonner';

export default function MasterDashboard() {
  const [tenants, setTenants] = useState<MaestroCliente[]>([]);
  const [subscriptions, setSubscriptions] = useState<Suscripcion[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tntData, subData, planData] = await Promise.all([
        adminMasterService.getMaestroClientes(),
        adminMasterService.getSuscripciones(),
        adminMasterService.getPlanes()
      ]);
      setTenants(tntData);
      setSubscriptions(subData);
      setPlanes(planData);
    } catch (error) {
      toast.error('Error al sincronizar datos del panel');
    } finally {
      setLoading(false);
    }
  };

  // Logic to determine status
  const getSubStatus = (tenantId: string) => {
    const sub = subscriptions.find(s => s.cliente_id === String(tenantId));
    if (!sub) return { label: 'Sin Suscripción', color: 'text-gray-500', bg: 'bg-gray-500/10' };
    
    if (!sub.esta_activa) return { label: 'Suspendida', color: 'text-red-500', bg: 'bg-red-500/10' };
    
    const today = new Date();
    const expiry = sub.fecha_fin ? new Date(sub.fecha_fin) : null;
    
    if (expiry && expiry.getFullYear() > 1 && expiry < today) {
      return { label: 'Vencida', color: 'text-orange-500', bg: 'bg-orange-500/10' };
    }
    
    return { label: 'Activa', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
  };

  const filteredTenants = tenants.filter(t => 
    t.nombre_comercial.toLowerCase().includes(search.toLowerCase()) ||
    t.ruc?.includes(search)
  );

  const stats = {
    total: tenants.length,
    active: subscriptions.filter(s => s.esta_activa).length,
    expired: tenants.filter(t => getSubStatus(t.id!).label === 'Vencida').length,
    revenue: subscriptions.filter(s => s.esta_activa).reduce((acc, sub) => {
      const plan = planes.find(p => p.id === sub.plan_id);
      return acc + (plan?.precio_mensual || 0);
    }, 0)
  };

  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="bg-indigo-600/20 text-indigo-400 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter border border-indigo-600/30">Master Node</span>
             <span className="text-gray-500 text-xs">Conectado como: <b className="text-muted-foreground">{adminUser.username}</b></span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">SuperAdmin <span className="text-indigo-500">Panel</span></h1>
          <p className="text-muted-foreground mt-1">Gestión centralizada de infraestructura y clientes SaaS.</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={handleLogout}
             className="bg-card hover:bg-muted text-muted-foreground px-6 py-3 rounded-2xl font-bold transition-all border border-border"
           >
             Salir
           </button>
           <button 
             onClick={() => window.location.href='/admin/auditoria'}
             className="bg-card hover:bg-muted text-muted-foreground px-6 py-3 rounded-2xl font-bold transition-all border border-border flex items-center gap-2"
           >
             <ClipboardList className="w-4 h-4" /> Auditoría
           </button>
           <button 
             onClick={() => window.location.href='/admin/tenants'}
             className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center gap-2"
           >
             <Plus className="w-5 h-5" /> Registrar Empresa
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          title="Empresas Totales" 
          value={stats.total} 
          icon={<Building2 className="w-6 h-6" />} 
          color="indigo" 
        />
        <StatCard 
          title="Suscripciones Activas" 
          value={stats.active} 
          icon={<CheckCircle2 className="w-6 h-6" />} 
          color="emerald" 
          trend="+2 este mes"
        />
        <StatCard 
          title="Vencimientos Próximos" 
          value={stats.expired} 
          icon={<AlertTriangle className="w-6 h-6" />} 
          color="orange" 
          alert={stats.expired > 0}
        />
        <StatCard 
          title="MRR Estimado" 
          value={`Gs. ${new Intl.NumberFormat('es-PY').format(stats.revenue)}`} 
          icon={<TrendingUp className="w-6 h-6" />} 
          color="cyan" 
        />
      </div>

      <div className="bg-background border border-border rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-muted-foreground" /> Directorio de Clientes
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o RUC..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-card/50 border border-border rounded-xl pl-10 pr-4 py-2 text-sm w-full md:w-80 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-card/30">
                <th className="px-8 py-5">Empresa / Slug</th>
                <th className="px-8 py-5">Plan</th>
                <th className="px-8 py-5">Estado Suscripción</th>
                <th className="px-8 py-5">Infraestructura</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-900">
              {loading ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center animate-pulse text-gray-500 font-medium">Sincronizando con el servidor maestro...</td></tr>
              ) : filteredTenants.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center text-gray-500">No se encontraron empresas registradas.</td></tr>
              ) : filteredTenants.map((t) => {
                const subStatus = getSubStatus(t.id!);
                const plan = planes.find(p => p.id === t.plan_id);
                return (
                  <tr key={t.id} className="hover:bg-card/40 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center font-bold text-indigo-400 border border-indigo-500/10">
                          {t.nombre_comercial.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-foreground group-hover:text-indigo-400 transition-colors">{t.nombre_comercial}</p>
                          <p className="text-xs text-gray-500">/{t.url_slug}</p>
                        </div>
                      </div>
                    </td>
                     <td className="px-8 py-5">
                       <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full w-fit">{plan?.nombre || 'S/P'}</span>
                        {plan && (
                          <span className="text-[10px] text-gray-500 font-mono ml-1">
                            Gs. {new Intl.NumberFormat('es-PY').format(plan.precio_mensual)}
                          </span>
                        )}
                       </div>
                     </td>
                    <td className="px-8 py-5">
                       <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${subStatus.bg} ${subStatus.color} border border-current/10`}>
                         <div className={`w-1.5 h-1.5 rounded-full ${subStatus.color.replace('text', 'bg')}`} />
                         {subStatus.label}
                       </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5 text-gray-600" />
                        <span>esquema: <b className="text-muted-foreground">{t.db_schema}</b></span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, trend, alert }: any) {
  const colors: any = {
    indigo: 'from-indigo-500/10 to-transparent border-indigo-500/20 text-indigo-400',
    emerald: 'from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-400',
    orange: 'from-orange-500/10 to-transparent border-orange-500/20 text-orange-400',
    cyan: 'from-cyan-500/10 to-transparent border-cyan-500/20 text-cyan-400'
  };

  return (
    <div className={`bg-gradient-to-b ${colors[color]} border rounded-3xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl bg-card/50 ${alert ? 'animate-pulse bg-red-500/20 text-red-400' : ''}`}>
          {icon}
        </div>
        {trend && <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">{trend}</span>}
      </div>
      <div>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-black text-foreground mt-1 group-hover:scale-105 transition-transform origin-left">{value}</p>
      </div>
    </div>
  );
}
