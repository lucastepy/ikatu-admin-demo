import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLoginPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [logo, setLogo] = useState<string | null>(null);

    useEffect(() => {
        // Redirect if already logged in as admin
        const adminToken = localStorage.getItem('adminToken');
        if (adminToken) {
            navigate('/admin', { replace: true });
        }

        // Fetch logo
        const fetchLogo = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || '/api';
                const response = await fetch(`${apiUrl}/integration/parametro/LOGO_IKATUSOFT?tenant=ALL`, {
                    headers: { 'X-API-Key': 'JwitpJyAhWNDHQOgiTTHS3EWsyEJipL97eiBdtra2aE' }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.valor) {
                        setLogo(data.valor);
                    }
                }
            } catch (err) {
                console.error('Error fetching logo for login', err);
            }
        };
        fetchLogo();
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const apiUrl = import.meta.env.VITE_API_URL || '/api';

        try {
            const response = await fetch(`${apiUrl}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('adminUser', JSON.stringify(data.user));
                toast.success('Acceso concedido al Panel Maestro');
                navigate('/admin');
            } else {
                const text = await response.text();
                try {
                    const errorData = JSON.parse(text);
                    toast.error(errorData.detail || 'Credenciales de administrador inválidas');
                } catch (e) {
                    toast.error('Error del servidor (500). Verifica los logs de Vercel.');
                    console.error('Non-JSON response:', text);
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background overflow-hidden relative">
            {/* Background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="w-full max-w-md p-8 relative z-10">
                <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden p-8">
                    <div className="flex flex-col items-center mb-8">
                        {logo ? (
                            <img src={logo} alt="IkatuSoft Logo" className="w-auto h-24 mb-4 object-contain" />
                        ) : (
                            <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 mb-4">
                                <Shield className="w-10 h-10 text-foreground" />
                            </div>
                        )}
                        <h1 className="text-2xl font-bold text-foreground text-center">Master Admin</h1>
                        <p className="text-blue-400 text-sm font-medium tracking-wider uppercase mt-1">IkatuSoft SaaS Platform</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Usuario Administrador</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-500" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-foreground placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Username"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Contraseña</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-500" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-foreground placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-foreground font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Iniciar Sesión"
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-400 text-xs">
                            Este acceso está restringido únicamente a propietarios de la plataforma IkatuSoft. 
                            Todas las actividades son monitoreadas.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
