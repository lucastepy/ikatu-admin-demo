import { useState } from 'react';
import { adminMasterService } from '../../services/adminMaster';
import { toast } from 'sonner';
import { 
  ShieldCheck, 
  User, 
  Lock, 
  Save,
  AlertCircle
} from 'lucide-react';

export default function AdminProfilePage() {
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: adminUser.nombre || '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      return toast.error('Las contraseñas no coinciden');
    }

    try {
      setLoading(true);
      const updatePayload: any = { nombre: formData.nombre };
      if (formData.password) updatePayload.password = formData.password;

      const updatedUser = await adminMasterService.updateAdminProfile(updatePayload);
      
      // Update local storage
      localStorage.setItem('adminUser', JSON.stringify(updatedUser));
      
      toast.success('Perfil actualizado correctamente');
      setFormData({ ...formData, password: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-indigo-400" />
          Seguridad del Administrador
        </h1>
        <p className="text-muted-foreground mt-1">Gestione sus credenciales de acceso al Panel Maestro.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <div className="bg-card/50 border border-border p-6 rounded-3xl">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-600/20 mb-4 mx-auto">
              {adminUser.username?.[0].toUpperCase()}
            </div>
            <div className="text-center">
              <h3 className="font-bold text-foreground text-lg">{adminUser.nombre}</h3>
              <p className="text-indigo-400 text-xs font-mono">@{adminUser.username}</p>
            </div>
            
            <div className="mt-6 pt-6 border-t border-border space-y-3">
               <div className="flex items-center gap-2 text-xs text-gray-500">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Acceso restringido a nivel ROOT</span>
               </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="bg-background border border-border rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-border bg-card/20">
               <h2 className="text-lg font-bold flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-400" /> Editar Credenciales
               </h2>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input 
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    className="w-full bg-card border border-border rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-foreground"
                    placeholder="Su nombre"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">Nueva Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input 
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full bg-card border border-border rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-foreground"
                      placeholder="Dejar en blanco para no cambiar"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">Confirmar Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input 
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className="w-full bg-card border border-border rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-foreground"
                      placeholder="Repita la nueva contraseña"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'Guardando...' : 'Actualizar Perfil'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
