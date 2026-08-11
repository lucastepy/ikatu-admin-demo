import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useCallback, useEffect } from 'react';
import axios from 'axios';

// Componentes y Contextos
import MasterSidebar from './components/MasterSidebar';
import { ThemeProvider } from './context/ThemeContext';
import { InitialDataProvider } from './context/InitialDataContext';
import SessionTimeoutModal from './components/SessionTimeoutModal';

// Hooks
import { useSessionTimeout } from './hooks/useSessionTimeout';

// Páginas de Admin
import MasterLogin from './pages/MasterPanel/AdminLogin';
import MasterDashboard from './pages/MasterPanel/Dashboard';
import MasterTenants from './pages/MasterPanel/Tenants';
import MasterPlans from './pages/MasterPanel/Planes';
import MasterSistemas from './pages/MasterPanel/Sistemas';
import MasterParametros from './pages/MasterPanel/ParametrosSistema';
import MasterAudit from './pages/MasterPanel/AuditLogs';
import MasterProfile from './pages/MasterPanel/Profile';
import MasterRestricciones from './pages/MasterPanel/RestriccionesCampos';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/admin/login' || location.pathname === '/';

  if (isAuthPage) {
    return (
      <>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground font-sans antialiased overflow-hidden">
      <MasterSidebar />
      <main className="flex-1 overflow-auto bg-background relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-50 pointer-events-none"></div>
        {children}
      </main>
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
};

const SessionWrapper = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  
  const handleLogout = useCallback(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login', { replace: true });
  }, [navigate]);

  const { isWarning, timeLeft, stayLoggedIn } = useSessionTimeout(handleLogout);

  return (
    <>
      <SessionTimeoutModal
        isOpen={isWarning}
        timeLeft={timeLeft}
        onStayLoggedIn={stayLoggedIn}
        onLogout={handleLogout}
      />
      {children}
    </>
  );
};

const MasterProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const adminToken = localStorage.getItem('adminToken');
  const adminUser = localStorage.getItem('adminUser');

  if (!adminToken || !adminUser) {
    return <Navigate to="/admin/login" replace />;
  }
  return <SessionWrapper>{children}</SessionWrapper>;
};

function App() {
  useEffect(() => {
    const updateFavicon = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || '/api'}/integration/parametro/LOGO_IKATUSOFT?tenant=ALL`,
          { headers: { 'X-API-Key': 'JwitpJyAhWNDHQOgiTTHS3EWsyEJipL97eiBdtra2aE' } }
        );
        const data = response.data;
        
        let oldLink = document.querySelector("link[rel~='icon']");
        if (oldLink) {
          document.head.removeChild(oldLink);
        }

        let link = document.createElement('link');
        link.rel = 'icon';
        
        if (data && data.valor) {
          if (data.valor.startsWith('data:image/png')) {
            link.type = 'image/png';
          } else if (data.valor.startsWith('data:image/jpeg')) {
            link.type = 'image/jpeg';
          }
          link.href = data.valor;
        } else {
          link.href = '/ikatusoft_logo_1773080761059.png';
        }
        
        document.head.appendChild(link);
      } catch (err) {
        console.error("Error fetching favicon", err);
      }
    };
    updateFavicon();
  }, []);

  return (
    <ThemeProvider>
      <InitialDataProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Login */}
              <Route path="/" element={<Navigate to="/admin/login" replace />} />
              <Route path="/admin/login" element={<MasterLogin />} />

              {/* Protected Routes */}
              <Route path="/admin" element={<MasterProtectedRoute><MasterDashboard /></MasterProtectedRoute>} />
              <Route path="/admin/tenants" element={<MasterProtectedRoute><MasterTenants /></MasterProtectedRoute>} />
              <Route path="/admin/planes" element={<MasterProtectedRoute><MasterPlans /></MasterProtectedRoute>} />
              <Route path="/admin/sistemas" element={<MasterProtectedRoute><MasterSistemas /></MasterProtectedRoute>} />
              <Route path="/admin/parametros-sistema" element={<MasterProtectedRoute><MasterParametros /></MasterProtectedRoute>} />
              <Route path="/admin/restricciones-campos" element={<MasterProtectedRoute><MasterRestricciones /></MasterProtectedRoute>} />
              <Route path="/admin/auditoria" element={<MasterProtectedRoute><MasterAudit /></MasterProtectedRoute>} />
              <Route path="/admin/perfil" element={<MasterProtectedRoute><MasterProfile /></MasterProtectedRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/admin/login" replace />} />
            </Routes>
          </Layout>
        </Router>
      </InitialDataProvider>
    </ThemeProvider>
  );
}

export default App;
