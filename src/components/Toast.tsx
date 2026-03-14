"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

type ToastContextType = {
  toast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const icons = {
    success: <CheckCircleIcon className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
    error: <XCircleIcon className="w-5 h-5 text-rose-400 flex-shrink-0" />,
    info: <InformationCircleIcon className="w-5 h-5 text-brand-400 flex-shrink-0" />,
  };

  const borders = {
    success: "border-emerald-500/30",
    error: "border-rose-500/30",
    info: "border-brand-500/30",
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}

      <div className="fixed top-20 right-4 z-[100] space-y-3 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 bg-slate-900/95 backdrop-blur-xl border ${borders[t.type]} rounded-xl shadow-2xl min-w-[300px] max-w-[420px] transition-all duration-300 animate-[slideIn_0.3s_ease-out]`}
          >
            {icons[t.type]}
            <p className="text-white text-sm font-medium flex-1">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="text-gray-500 hover:text-white transition-colors flex-shrink-0"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
