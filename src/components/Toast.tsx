import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
  };

  const borderStyles = {
    success: 'border-l-4 border-emerald-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100',
    warning: 'border-l-4 border-amber-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100',
    error: 'border-l-4 border-rose-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100',
    info: 'border-l-4 border-teal-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100'
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 transition-all transform translate-y-0 ${borderStyles[toast.type]}`}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold tracking-tight">{toast.title}</p>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 break-words">{toast.message}</p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
