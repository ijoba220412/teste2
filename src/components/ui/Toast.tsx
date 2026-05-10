import React, { createContext, useContext, useState, useCallback } from 'react';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface ToastContextType {
  showToast: (type: ToastMessage['type'], message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de um ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  }, []);

  const success = useCallback((message: string) => showToast('success', message), [showToast]);
  const error = useCallback((message: string) => showToast('error', message), [showToast]);
  const info = useCallback((message: string) => showToast('info', message), [showToast]);
  const warning = useCallback((message: string) => showToast('warning', message), [showToast]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2 print:hidden">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`
              flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg border-l-4 
              transform transition-all duration-300 animate-slide-in max-w-md
              ${toast.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' : ''}
              ${toast.type === 'error' ? 'bg-red-50 border-red-500 text-red-800' : ''}
              ${toast.type === 'info' ? 'bg-blue-50 border-blue-500 text-blue-800' : ''}
              ${toast.type === 'warning' ? 'bg-yellow-50 border-yellow-500 text-yellow-800' : ''}
            `}
          >
            <span className="font-bold uppercase text-sm">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-auto hover:opacity-70 transition-opacity"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
