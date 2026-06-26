import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

// Global toast event bus
const toastListeners = [];

export const toast = {
  success: (message) => dispatchToast("success", message),
  error: (message) => dispatchToast("error", message),
  info: (message) => dispatchToast("info", message)
};

function dispatchToast(type, message) {
  const event = { id: Date.now(), type, message };
  toastListeners.forEach((cb) => cb(event));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (event) => {
      setToasts((prev) => [...prev, event]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== event.id));
      }, 4000);
    };
    toastListeners.push(handler);
    return () => {
      const idx = toastListeners.indexOf(handler);
      if (idx > -1) toastListeners.splice(idx, 1);
    };
  }, []);

  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const icons = {
    success: <CheckCircle size={18} className="text-emerald-500 shrink-0" />,
    error: <XCircle size={18} className="text-red-500 shrink-0" />,
    info: <Info size={18} className="text-blue-500 shrink-0" />
  };

  const borders = {
    success: "border-l-emerald-500",
    error: "border-l-red-500",
    info: "border-l-blue-500"
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999] grid gap-3 w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 rounded-lg border border-slate-100 bg-white px-4 py-3 shadow-lg border-l-4 ${borders[t.type]} animate-slide-in`}
        >
          {icons[t.type]}
          <p className="flex-1 text-sm font-medium text-slate-800">{t.message}</p>
          <button onClick={() => remove(t.id)} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
