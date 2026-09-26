import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'success') => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, message, type }]);
      window.setTimeout(() => removeToast(id), 3200);
    },
    [removeToast],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(90vw,22rem)] flex-col gap-2">
        {toasts.map(({ id, message, type }) => (
          <div
            key={id}
            className={`pointer-events-auto rounded-md border px-4 py-3 text-sm font-medium shadow-sm ${
              type === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : type === 'info'
                  ? 'border-slate-200 bg-slate-100 text-slate-700'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}
          >
            {message}
          </div>
        ))}
      </div>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
}
