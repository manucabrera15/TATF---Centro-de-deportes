"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

interface ConfirmOptions {
  title: string;
  body: string;
  confirmLabel?: string;
  danger?: boolean;
}

type ConfirmDialog = (options: ConfirmOptions) => Promise<boolean>;

const ModalContext = createContext<ConfirmDialog | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((result: boolean) => void) | null>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  const confirmDialog = useCallback<ConfirmDialog>((opts) => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setOptions(opts);
    });
  }, []);

  const close = useCallback((result: boolean) => {
    setOptions(null);
    if (resolveRef.current) {
      resolveRef.current(result);
      resolveRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!options) return;
    confirmBtnRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [options, close]);

  return (
    <ModalContext.Provider value={confirmDialog}>
      {children}
      <div className="modal-overlay" hidden={!options}>
        {options ? (
          <div className="modal" role="alertdialog" aria-modal="true" aria-labelledby="modal-title">
            <h3 className="modal__title" id="modal-title">
              {options.title}
            </h3>
            <p className="modal__body">{options.body}</p>
            <div className="modal__actions">
              <button className="btn btn--ghost" onClick={() => close(false)}>
                Cancelar
              </button>
              <button
                ref={confirmBtnRef}
                className={"btn " + (options.danger ? "btn--danger" : "btn--primary")}
                onClick={() => close(true)}
              >
                {options.confirmLabel || "Confirmar"}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </ModalContext.Provider>
  );
}

export function useConfirmDialog(): ConfirmDialog {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useConfirmDialog debe usarse dentro de <ModalProvider>");
  return ctx;
}
