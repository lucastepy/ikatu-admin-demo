import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  confirmText = "Confirmar", 
  cancelText = "Cancelar", 
  onConfirm, 
  onCancel 
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-accent/20 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-sm rounded-3xl shadow-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-1">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground leading-tight">{title}</h3>
            <p className="text-sm text-muted-foreground mt-2">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-8">
          <button 
            onClick={onCancel} 
            className="px-4 py-2.5 text-sm font-bold text-gray-400 hover:text-foreground transition-colors"
          >
            {cancelText}
          </button>
          <button 
            onClick={() => {
              onConfirm();
            }} 
            className="px-6 py-2.5 text-sm font-bold bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-lg shadow-red-500/20 transition-all"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
