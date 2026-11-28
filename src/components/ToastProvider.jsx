import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    setToast({ message, type });
    if (duration > 0) {
      setTimeout(() => {
        setToast((prev) => (prev?.message === message ? null : prev));
      }, duration);
    }
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  const styles = {
    success: {
      border: 'border-emerald-500/30',
      badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      icon: '✓',
      title: 'Berhasil',
    },
    error: {
      border: 'border-rose-500/30',
      badge: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      icon: '✕',
      title: 'Perhatian',
    },
    info: {
      border: 'border-sky-500/30',
      badge: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
      icon: 'i',
      title: 'Informasi',
    },
  };

  const currentStyle = styles[toast?.type] || styles.success;

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}

      {toast && (
        <div className="fixed top-5 right-5 z-[9999] max-w-sm w-[calc(100%-2.5rem)] animate-fade-in">
          <div
            className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-[#0f172a]/95 backdrop-blur-md border ${currentStyle.border} shadow-2xl text-left`}
          >
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-extrabold border shrink-0 mt-0.5 ${currentStyle.badge}`}
            >
              {currentStyle.icon}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider m-0">
                {currentStyle.title}
              </p>
              <p className="text-xs font-medium text-white m-0 mt-0.5 leading-relaxed">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={hideToast}
              className="text-slate-500 hover:text-white text-xs transition-colors cursor-pointer bg-transparent border-0 p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast harus digunakan di dalam <ToastProvider>');
  }
  return ctx;
}
