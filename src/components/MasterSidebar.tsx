import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { 
  Rocket, 
  Users, 
  LayoutDashboard, 
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  History,
  Monitor,
  Sun,
  Moon,
  Settings,
  Lock
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function MasterSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = location.pathname;

  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Empresas / Tenants', path: '/admin/tenants', icon: Users },
    { name: 'Planes de Servicio', path: '/admin/planes', icon: Rocket },
    { name: 'Sistemas', path: '/admin/sistemas', icon: Monitor },
    { name: 'Parámetros del Sistema', path: '/admin/parametros-sistema', icon: Settings },
    { name: 'Restricciones de Campos', path: '/admin/restricciones-campos', icon: Lock },
    { name: 'Auditoría', path: '/admin/auditoria', icon: History },
    { name: 'Perfil / Seguridad', path: '/admin/perfil', icon: ShieldCheck },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  return (
    <aside 
      className={`bg-card border-r border-border transition-all duration-300 flex flex-col h-screen sticky top-0 z-50 ${isCollapsed ? 'w-20' : 'w-72'}`}
    >
      {/* Brand Header */}
      <div className={`h-20 flex items-center px-6 border-b border-border/50 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-foreground tracking-widest leading-none">MASTER</span>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">Panel Control</span>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-amber-400 transition-all"
            title={theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          {!isCollapsed && (
            <button 
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {isCollapsed && (
        <div className="flex justify-center py-4 border-b border-border/50">
          <button 
            onClick={() => setIsCollapsed(false)}
            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'text-muted-foreground hover:bg-accent hover:text-white'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}`} />
              {!isCollapsed && <span className={`font-semibold text-sm ${isActive ? 'text-white' : ''}`}>{item.name}</span>}
              {!isCollapsed && isActive && (
                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-2 py-1 bg-popover text-popover-foreground text-xs rounded border border-border opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User / Logout */}
      <div className="p-4 border-t border-border/50">
        <div className={`flex items-center gap-3 p-3 rounded-2xl bg-accent/50 border border-border/50 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <span className="font-bold text-sm uppercase">{adminUser.username?.[0] || 'A'}</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground truncate">{adminUser.nombre || 'Admin'}</p>
              <p className="text-[10px] text-muted-foreground truncate">@{adminUser.username}</p>
            </div>
          )}
          {!isCollapsed && (
            <button 
              onClick={handleLogout}
              className="p-2 text-muted-foreground hover:text-red-400 transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
        {isCollapsed && (
           <button 
           onClick={handleLogout}
           className="w-full mt-2 flex justify-center p-2 text-muted-foreground hover:text-red-400 transition-colors"
           title="Cerrar Sesión"
         >
           <LogOut className="w-5 h-5" />
         </button>
        )}
      </div>
    </aside>
  );
}
