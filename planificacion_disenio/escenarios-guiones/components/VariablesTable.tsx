"use client";

import { useEffect, useRef, useState } from "react";
import { Constants } from "@/lib/constants";
import { DataApi } from "@/lib/dataApi";
import type { AuxiliaryFunction, Scenario, Variable } from "@/lib/types";
import { PlusCircleIcon, TrashIcon } from "./icons";

interface VariablesTableProps {
  variables: Variable[];
  onChange: (variables: Variable[]) => void;
}

export function VariablesTable({ variables, onChange }: VariablesTableProps) {
  const lastNameRef = useRef<HTMLInputElement>(null);
  const shouldFocusLast = useRef(false);
  const isMac =
    typeof navigator !== "undefined" &&
    (/Mac|iPod|iPhone|iPad/.test(navigator.platform || "") || /Mac/.test(navigator.userAgent || ""));
  const shortcutLabel = isMac ? "⌘ + Enter" : "Ctrl + Enter";

  // Nombres de variables ya usados en otros escenarios (y parámetros de funciones
  // auxiliares, que funcionan igual) — se ofrecen como predictivo al escribir,
  // igual que el selector de funciones auxiliares.
  const [pool, setPool] = useState<string[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  // Tooltip flotante que recuerda el atajo Ctrl/⌘+Enter, igual que en la tabla de guión
  const [hintIndex, setHintIndex] = useState<number | null>(null);
  const hintShowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function hideHint() {
    if (hintShowTimer.current) {
      clearTimeout(hintShowTimer.current);
      hintShowTimer.current = null;
    }
    if (hintHideTimer.current) {
      clearTimeout(hintHideTimer.current);
      hintHideTimer.current = null;
    }
    setHintIndex(null);
  }

  function scheduleHint(idx: number) {
    if (hintShowTimer.current) clearTimeout(hintShowTimer.current);
    if (hintHideTimer.current) clearTimeout(hintHideTimer.current);
    setHintIndex(null);
    hintShowTimer.current = setTimeout(() => {
      setHintIndex(idx);
      hintHideTimer.current = setTimeout(() => setHintIndex(null), 3200);
    }, 1800);
  }

  useEffect(() => {
    const names = new Set<string>();
    DataApi.getData<Scenario>(Constants.KEY_DATA_SCENARIO).forEach((s) => {
      (s.variables || []).forEach((v) => v && v.name && names.add(v.name.trim()));
    });
    DataApi.getData<AuxiliaryFunction>(Constants.KEY_DATA_FUNCTION).forEach((f) => {
      (f.params || []).forEach((p) => p && names.add(p.trim()));
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPool(Array.from(names).sort((a, b) => a.localeCompare(b)));
  }, []);

  function updateAt(idx: number, patch: Partial<Variable>) {
    const next = variables.map((v, i) => (i === idx ? { ...v, ...patch } : v));
    onChange(next);
  }

  function removeAt(idx: number) {
    const next = variables.slice();
    next.splice(idx, 1);
    onChange(next);
  }

  function addRow() {
    onChange([...variables, { name: "" }]);
    shouldFocusLast.current = true;
  }

  function suggestionsFor(idx: number, query: string): string[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const usedElsewhere = new Set(
      variables.filter((_, i) => i !== idx).map((v) => (v.name || "").trim().toLowerCase())
    );
    return pool
      .filter((name) => name.toLowerCase() !== q && name.toLowerCase().includes(q) && !usedElsewhere.has(name.toLowerCase()))
      .slice(0, 6);
  }

  function chooseSuggestion(idx: number, name: string) {
    updateAt(idx, { name });
    setOpenIndex(null);
  }

  useEffect(() => {
    if (shouldFocusLast.current) {
      shouldFocusLast.current = false;
      lastNameRef.current?.focus();
    }
  }, [variables.length]);

  return (
    <div className="variables">
      <div className="variables__rows">
        {variables.length === 0 ? (
          <div className="variables__empty">
            Sin variables definidas. Agregá una para poder referenciarla en los pasos con <code>{"{{nombre}}"}</code>.
          </div>
        ) : (
          variables.map((v, idx) => {
            const suggestions = openIndex === idx ? suggestionsFor(idx, v.name) : [];
            return (
              <div className="variables__row" key={idx}>
                <input
                  ref={idx === variables.length - 1 ? lastNameRef : undefined}
                  className="variables__name"
                  type="text"
                  placeholder="nombre"
                  value={v.name}
                  autoComplete="off"
                  onChange={(e) => {
                    updateAt(idx, { name: e.target.value });
                    setOpenIndex(idx);
                    setActiveIdx(0);
                    scheduleHint(idx);
                  }}
                  onFocus={() => {
                    setOpenIndex(idx);
                    setActiveIdx(0);
                    scheduleHint(idx);
                  }}
                  onKeyDown={(e) => {
                    const list = openIndex === idx ? suggestionsFor(idx, v.name) : [];
                    if (list.length) {
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setActiveIdx((n) => Math.min(n + 1, list.length - 1));
                        return;
                      }
                      if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setActiveIdx((n) => Math.max(n - 1, 0));
                        return;
                      }
                      if (e.key === "Enter" && !e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        chooseSuggestion(idx, list[activeIdx] || list[0]);
                        return;
                      }
                      if (e.key === "Escape") {
                        e.preventDefault();
                        setOpenIndex(null);
                        return;
                      }
                    }
                    if ((e.key === "Enter" || e.key === "NumpadEnter") && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      setOpenIndex(null);
                      hideHint();
                      addRow();
                    }
                  }}
                  onBlur={() => {
                    hideHint();
                    window.setTimeout(() => {
                      setOpenIndex((cur) => (cur === idx ? null : cur));
                    }, 120);
                  }}
                />
                <button
                  className="variables__remove"
                  type="button"
                  title="Eliminar variable"
                  onClick={() => removeAt(idx)}
                >
                  <TrashIcon />
                </button>
                {suggestions.length > 0 ? (
                  <div className="variables__suggest">
                    {suggestions.map((name, sIdx) => (
                      <div
                        key={name}
                        className={"variables__suggest-item" + (sIdx === activeIdx ? " is-active" : "")}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          chooseSuggestion(idx, name);
                        }}
                        onMouseEnter={() => setActiveIdx(sIdx)}
                      >
                        {name}
                      </div>
                    ))}
                  </div>
                ) : (
                  hintIndex === idx && (
                    <div className="variables__hint">
                      <kbd>{isMac ? "⌘" : "Ctrl"}</kbd>
                      <span>+</span>
                      <kbd>Enter</kbd>
                      <span className="variables__hint-label">agrega variable</span>
                    </div>
                  )
                )}
              </div>
            );
          })
        )}
      </div>
      <button className="btn btn--sm" type="button" title={"Agregar variable (" + shortcutLabel + ")"} onClick={addRow}>
        <PlusCircleIcon />
        <span>Agregar variable</span>
      </button>
    </div>
  );
}
