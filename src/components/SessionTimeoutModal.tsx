import React from 'react';
import { AlertTriangle, LogOut, Clock } from 'lucide-react';

interface SessionTimeoutModalProps {
  isOpen: boolean;
  timeLeft: number;
  onStayLoggedIn: () => void;
  onLogout: () => void;
}

const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({
  isOpen,
  timeLeft,
  onStayLoggedIn,
  onLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop con Blur (Glassmorphism) */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity" />
      
      {/* Contenedor del Modal */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        
        {/* Encabezado */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Sesión Inactiva</h2>
            <p className="text-sm text-muted-foreground">Tu sesión está a punto de expirar.</p>
          </div>
        </div>

        {/* Cuenta Regresiva */}
        <div className="my-6 flex flex-col items-center justify-center rounded-xl bg-muted/50 py-6">
          <div className="flex items-center justify-center gap-2 text-4xl font-extrabold text-foreground">
            <Clock className="h-8 w-8 text-primary animate-pulse" />
            <span>00:{timeLeft.toString().padStart(2, '0')}</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Se cerrará automáticamente si no respondes.
          </p>
        </div>

        {/* Botones */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
          <button
            onClick={onLogout}
            className="inline-flex items-center justify-center rounded-lg border border-border bg-transparent px-4 py-2.5 text-sm font-medium transition-colors hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 focus:outline-none focus:ring-2 focus:ring-destructive/50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </button>
          
          <button
            onClick={onStayLoggedIn}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            Permanecer Conectado
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default SessionTimeoutModal;
