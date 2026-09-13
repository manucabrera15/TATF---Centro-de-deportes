"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AlertIcon, CheckIcon, InfoIcon, XIcon } from "./icons";

type Severity = "success" | "error" | "info" | "warn";

interface Toast {
  id: number;
  severity: Severity;
  summary: string;
  detail?: string;
  leaving?: boolean;
}

type ShowToast = (severity: Severity, summary: string, detail?: string) => void;

const ToastContext = createContext<ShowToast | null>(null);

const META: Record<Severity, { icon: typeof CheckIcon; className: string }> = {
  success: { icon: CheckIcon, className: "toast--success" },
  error: { icon: XIcon, className: "toast--error" },
  info: { icon: InfoIcon, className: "toast--info" },
  warn: { icon: AlertIcon, className: "toast--warn" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200);
  }, []);

  const showToast = useCallback<ShowToast>(
    (severity, summary, detail) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, severity, summary, detail }]);
      setTimeout(() => dismiss(id), 4200);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => {
          const meta = META[t.severity];
          const Icon = meta.icon;
          return (
            <div key={t.id} className={"toast " + meta.className + (t.leaving ? " is-leaving" : "")} role="status">
              <span className="toast__icon">
                <Icon />
              </span>
              <div className="toast__text">
                <div className="toast__title">{t.summary}</div>
                {t.detail ? <div className="toast__detail">{t.detail}</div> : null}
              </div>
              <button className="toast__close" aria-label="Cerrar notificación" onClick={() => dismiss(t.id)}>
                <XIcon />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ShowToast {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}
