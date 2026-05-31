import { useState, useEffect } from 'react';
import { adminMasterService } from '../../services/adminMaster';
import type { AuditoriaAdmin } from '../../services/adminMaster';
import { 
  ClipboardList, 
  Search, 
  User, 
  Calendar, 
  Database,
  Info,
  ChevronDown,
  ChevronUp,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditoriaAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await adminMasterService.getAuditLogs();
      setLogs(data);
    } catch (error) {
      toast.error('Error al cargar logs de auditoría');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.detalle?.toLowerCase().includes(search.toLowerCase()) ||
    log.accion.toLowerCase().includes(search.toLowerCase()) ||
    log.admin?.username.toLowerCase().includes(search.toLowerCase())
  );

  const getActionColor = (accion: string) => {
    switch (accion) {
      case 'CREATE': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'UPDATE': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'DELETE': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-muted-foreground bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="bg-indigo-600/20 text-indigo-400 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter border border-indigo-600/30">Security Ledger</span>
             <Activity className="w-3 h-3 text-indigo-500 animate-pulse" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Auditoría <span className="text-indigo-500">Master</span></h1>
          <p className="text-muted-foreground mt-1">Historial detallado de todas las operaciones realizadas en el panel maestro.</p>
        </div>
      </div>

      <div className="bg-background border border-border rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
            <ClipboardList className="w-5 h-5 text-muted-foreground" /> Registros de Actividad
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Buscar por detalle, acción o admin..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-card/50 border border-border rounded-xl pl-10 pr-4 py-2 text-sm w-full md:w-96 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-foreground"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-card/30">
                <th className="px-8 py-5">Fecha / Hora</th>
                <th className="px-8 py-5">Admin</th>
                <th className="px-8 py-5">Acción</th>
                <th className="px-8 py-5">Recurso</th>
                <th className="px-8 py-5">Detalle</th>
                <th className="px-8 py-5 text-right">Datos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-900">
              {loading ? (
                <tr><td colSpan={6} className="px-8 py-20 text-center animate-pulse text-gray-500">Cargando bitácora de seguridad...</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan={6} className="px-8 py-20 text-center text-gray-500">No hay registros que coincidan con la búsqueda.</td></tr>
              ) : filteredLogs.map((log) => (
                <>
                  <tr key={log.id} className="hover:bg-card/40 transition-colors group">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5 text-gray-600" />
                        <span className="text-xs font-medium">
                          {new Date(log.fecha).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="text-sm font-bold text-foreground">{log.admin?.username || 'Unknown'}</span>
                        <span className="text-[10px] text-gray-500 block">({log.ip_address})</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${getActionColor(log.accion)}`}>
                        {log.accion}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-xs text-muted-foreground font-mono">
                      {log.recurso} <span className="text-gray-600">#{log.recurso_id?.substring(0, 8)}</span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm text-muted-foreground line-clamp-1">{log.detalle}</p>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                        className="text-gray-500 hover:text-foreground p-2 transition-colors"
                      >
                        {expandedId === log.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                  {expandedId === log.id && (
                    <tr className="bg-card/20 border-l-2 border-indigo-500">
                      <td colSpan={6} className="px-8 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 scale-in-center">
                          <div>
                            <h4 className="text-[10px] font-black text-gray-500 uppercase mb-2 flex items-center gap-1">
                              <Database className="w-3 h-3" /> Estado Anterior
                            </h4>
                            <pre className="text-[10px] bg-accent/10 p-3 rounded-lg border border-border text-muted-foreground overflow-auto max-h-40">
                              {JSON.stringify(log.valores_anteriores, null, 2) || 'N/A'}
                            </pre>
                          </div>
                          <div>
                            <h4 className="text-[10px] font-black text-emerald-500 uppercase mb-2 flex items-center gap-1">
                              <Info className="w-3 h-3" /> Nuevos Valores
                            </h4>
                            <pre className="text-[10px] bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10 text-emerald-100/70 overflow-auto max-h-40">
                              {JSON.stringify(log.valores_nuevos, null, 2) || 'N/A'}
                            </pre>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
