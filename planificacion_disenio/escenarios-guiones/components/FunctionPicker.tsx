"use client";

import { useEffect, useState } from "react";
import { Constants } from "@/lib/constants";
import { DataApi } from "@/lib/dataApi";
import type { AuxiliaryFunction, FunctionRef } from "@/lib/types";
import { SearchIcon, XIcon } from "./icons";

interface FunctionPickerProps {
  selected: FunctionRef[];
  onChange: (selected: FunctionRef[]) => void;
}

export function FunctionPicker({ selected, onChange }: FunctionPickerProps) {
  const [available, setAvailable] = useState<AuxiliaryFunction[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAvailable(DataApi.getData<AuxiliaryFunction>(Constants.KEY_DATA_FUNCTION));
  }, []);

  function isSelected(fn: AuxiliaryFunction) {
    return selected.some((s) => s.id === fn.id);
  }

  function toggle(fn: AuxiliaryFunction) {
    const idx = selected.findIndex((s) => s.id === fn.id);
    if (idx > -1) {
      const next = selected.slice();
      next.splice(idx, 1);
      onChange(next);
    } else {
      onChange([...selected, { id: fn.id, name: fn.name }]);
    }
  }

  function removeSelected(id: string | null) {
    onChange(selected.filter((s) => s.id !== id));
  }

  const q = query.trim().toLowerCase();
  const filtered = available.filter((fn) => fn.name.toLowerCase().includes(q));

  return (
    <div>
      <div className="picker">
        <div className="picker__search">
          <SearchIcon />
          <input
            type="text"
            placeholder="Buscar función auxiliar…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="picker__list">
          {available.length === 0 ? (
            <div className="picker__empty">No hay funciones auxiliares creadas todavía.</div>
          ) : filtered.length === 0 ? (
            <div className="picker__empty">Sin coincidencias.</div>
          ) : (
            filtered.map((fn) => {
              const checkboxId = "fn-opt-" + fn.id;
              return (
                <label className="picker__option" htmlFor={checkboxId} key={fn.id}>
                  <input
                    type="checkbox"
                    id={checkboxId}
                    checked={isSelected(fn)}
                    onChange={() => toggle(fn)}
                  />
                  <span>
                    <span className="picker__option-name">{fn.name}</span>
                    <div className="picker__option-meta">{fn.params && fn.params.length ? fn.params.join(", ") : "sin parámetros"}</div>
                  </span>
                </label>
              );
            })
          )}
        </div>
      </div>
      <div className="picker__selected">
        {selected.map((s) => (
          <span className="chip chip--aux" key={s.id || s.name}>
            <span>{s.name}</span>
            <button
              className="chip__remove"
              type="button"
              aria-label={"Quitar " + s.name}
              onClick={() => removeSelected(s.id)}
            >
              <XIcon />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
