"use client";

import { useRef, useState } from "react";
import { XIcon } from "./icons";

interface ChipsInputProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export function ChipsInput({ values, onChange, placeholder }: ChipsInputProps) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function addValue(raw: string) {
    const value = raw.trim();
    if (!value) return;
    onChange([...values, value]);
    setDraft("");
  }

  function removeAt(idx: number) {
    const next = values.slice();
    next.splice(idx, 1);
    onChange(next);
  }

  return (
    <div className="chips" tabIndex={-1} onClick={() => inputRef.current?.focus()}>
      {values.map((value, idx) => (
        <span className="chip" key={value + idx}>
          <span>{value}</span>
          <button
            className="chip__remove"
            type="button"
            aria-label={"Quitar " + value}
            onClick={(e) => {
              e.stopPropagation();
              removeAt(idx);
            }}
          >
            <XIcon />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        className="chips__input"
        type="text"
        placeholder={placeholder || "Escriba y presione Enter"}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addValue(draft);
          } else if (e.key === "Backspace" && !draft && values.length) {
            removeAt(values.length - 1);
          }
        }}
        onBlur={() => {
          if (draft.trim()) addValue(draft);
        }}
      />
    </div>
  );
}
