import { Constants } from "./constants";
import { DataApi } from "./dataApi";
import { renderStepRichText } from "./tokens";
import type { AuxiliaryFunction, Step, Variable } from "./types";

/* Íconos SVG en línea usados dentro del controlador imperativo (sin JSX). */
const SVG = {
  listCheck:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m4 6 1.5 1.5L8 5"/><path d="M11 6h9"/><path d="m4 12 1.5 1.5L8 11"/><path d="M11 12h9"/><path d="m4 18 1.5 1.5L8 17"/><path d="M11 18h9"/></svg>',
  plusCircle:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8.5v7M8.5 12h7"/></svg>',
  trash:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M6.5 7 7.2 19a2 2 0 0 0 2 1.8h5.6a2 2 0 0 0 2-1.8L17.5 7"/><path d="M10 11v6M14 11v6"/></svg>',
};

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Record<string, string | undefined>,
  children?: (Node | string | null)[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (attrs) {
    Object.entries(attrs).forEach(([key, value]) => {
      if (value === undefined) return;
      if (key === "html") node.innerHTML = value;
      else if (key === "text") node.textContent = value;
      else if (key === "class") node.className = value;
      else node.setAttribute(key, value);
    });
  }
  (children || []).forEach((child) => {
    if (child == null) return;
    node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
  });
  return node;
}

/** Devuelve la posición del cursor (en caracteres) dentro de un elemento editable. */
function getCaretCharOffset(cell: HTMLElement): number | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  if (!cell.contains(range.startContainer)) return null;
  const preRange = range.cloneRange();
  preRange.selectNodeContents(cell);
  preRange.setEnd(range.startContainer, range.startOffset);
  return preRange.toString().length;
}

/** Ubica el cursor en la posición (en caracteres) indicada dentro de un elemento editable. */
function setCaretCharOffset(cell: HTMLElement, offset: number) {
  const sel = window.getSelection();
  if (!sel) return;
  const range = document.createRange();
  let remaining = offset;
  let targetNode: Text | null = null;
  let targetOffset = 0;

  function walk(node: Node) {
    for (const child of Array.from(node.childNodes)) {
      if (targetNode) return;
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child as Text;
        if (remaining <= text.length) {
          targetNode = text;
          targetOffset = remaining;
          return;
        }
        remaining -= text.length;
      } else {
        walk(child);
      }
    }
  }
  walk(cell);

  if (!targetNode) {
    range.selectNodeContents(cell);
    range.collapse(false);
  } else {
    range.setStart(targetNode, targetOffset);
    range.collapse(true);
  }
  sel.removeAllRanges();
  sel.addRange(range);
}

interface SavedContext {
  step: Step;
  field: "step";
  cell: HTMLElement;
  range: Range | null;
}

interface SuggestItem {
  name: string;
  params?: string[];
}

/** Arma el token [[Nombre]] o, si la función tiene parámetros, [[Nombre(param1, param2)]]. */
function formatFnCallToken(fn: { name: string; params?: string[] }): string {
  const params = (fn.params || []).map((p) => p.trim()).filter(Boolean);
  return "[[" + fn.name + (params.length ? "(" + params.join(", ") + ")" : "") + "]]";
}

interface SuggestState {
  cell: HTMLElement;
  step: Step;
  field: "step";
  kind: "var" | "fn";
  triggerStart: number;
  items: SuggestItem[];
  activeIndex: number;
}

export interface StepsTableOptions {
  steps: Step[];
  variables: Variable[];
  excludeFunctionId?: string | null;
  onChange: (steps: Step[]) => void;
  onFunctionInserted?: (name: string) => void;
  onWarn?: (summary: string, detail?: string) => void;
}

export interface StepsTableController {
  setVariables: (variables: Variable[]) => void;
  destroy: () => void;
}

export function mountStepsTable(container: HTMLElement, options: StepsTableOptions): StepsTableController {
  const { steps, onChange, excludeFunctionId, onFunctionInserted, onWarn } = options;
  let variables = options.variables;

  let savedContext: SavedContext | null = null;

  const varSelect = el("select", { class: "input steps__var-select", title: "Insertar variable en el paso seleccionado" });
  const fnSelect = el("select", { class: "input steps__var-select", title: "Insertar llamado a función auxiliar" });

  function functionsForHighlight(): AuxiliaryFunction[] {
    return DataApi.getData<AuxiliaryFunction>(Constants.KEY_DATA_FUNCTION).filter((f) => f.id !== excludeFunctionId);
  }

  function refreshVarOptions() {
    varSelect.innerHTML = "";
    const vars = (variables || []).filter((v) => v.name && v.name.trim());
    varSelect.appendChild(el("option", { value: "", text: vars.length ? "Insertar variable…" : "Sin variables" }));
    vars.forEach((v) => {
      varSelect.appendChild(el("option", { value: v.name.trim(), text: "{{" + v.name.trim() + "}}" }));
    });
  }

  function refreshFnOptions() {
    fnSelect.innerHTML = "";
    const available = functionsForHighlight();
    fnSelect.appendChild(el("option", { value: "", text: available.length ? "Insertar función…" : "Sin funciones" }));
    available.forEach((f) => {
      fnSelect.appendChild(el("option", { value: f.name, text: "[[" + f.name + "]]" }));
    });
  }

  varSelect.addEventListener("mousedown", refreshVarOptions);
  varSelect.addEventListener("focus", refreshVarOptions);
  varSelect.addEventListener("change", () => {
    const name = varSelect.value;
    varSelect.value = "";
    if (!name) return;
    insertToken("{{" + name + "}}", "una variable");
  });

  fnSelect.addEventListener("mousedown", refreshFnOptions);
  fnSelect.addEventListener("focus", refreshFnOptions);
  fnSelect.addEventListener("change", () => {
    const name = fnSelect.value;
    fnSelect.value = "";
    if (!name) return;
    const fn = functionsForHighlight().find((f) => f.name === name) || { name };
    requestFunctionInsert(fn);
  });

  interface InsertContext {
    cell: HTMLElement;
    step: Step;
    field: "step";
    range: Range;
  }

  function insertToken(token: string, whatLabel: string, ctx?: InsertContext) {
    const context: InsertContext | null =
      ctx || (savedContext && savedContext.range && savedContext.cell.isConnected
        ? { cell: savedContext.cell, step: savedContext.step, field: savedContext.field, range: savedContext.range }
        : null);
    if (!context) {
      if (onWarn) onWarn("Seleccioná un paso", "Hacé clic en un paso o resultado antes de insertar " + whatLabel + ".");
      return;
    }
    const { step, field: stepField, cell, range } = context;
    cell.focus();
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(range);
    range.deleteContents();
    const textNode = document.createTextNode(token);
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    sel.removeAllRanges();
    sel.addRange(range);

    const caretAfter = getCaretCharOffset(cell);
    const text = cell.textContent || "";
    step[stepField] = text;
    cell.innerHTML = text ? renderStepRichText(text, { variables, functions: functionsForHighlight() }) : "";
    if (caretAfter != null) setCaretCharOffset(cell, caretAfter);
    onChange(steps.slice());
    closeSuggest();
  }

  /**
   * Al elegir una función auxiliar con parámetros (desde el selector), en vez de
   * insertarla directamente se abre un bloque flotante para completar los valores
   * de cada parámetro antes de insertarla en la fila.
   */
  function requestFunctionInsert(fn: SuggestItem) {
    const params = (fn.params || []).map((p) => p.trim()).filter(Boolean);
    if (!savedContext || !savedContext.range || !savedContext.cell.isConnected) {
      if (onWarn) onWarn("Seleccioná un paso", "Hacé clic en un paso o resultado antes de insertar una función auxiliar.");
      return;
    }
    const { cell, step, field, range } = savedContext;
    if (!params.length) {
      insertToken(formatFnCallToken(fn), "una función auxiliar", { cell, step, field, range });
      if (onFunctionInserted) onFunctionInserted(fn.name);
      return;
    }
    openParamPopup(fn, { mode: "range", cell, step, field, range: range.cloneRange() });
  }

  /** Arma el token final [[Nombre(...)]] usando los valores completados en el bloque de parámetros. */
  function buildFnTokenWithValues(fn: SuggestItem, values: string[]): string {
    const params = (fn.params || []).map((p) => p.trim()).filter(Boolean);
    if (!params.length) return "[[" + fn.name + "]]";
    const parts = params.map((p, idx) => {
      const value = (values[idx] || "").trim();
      return value ? '"' + value + '"' : p;
    });
    return "[[" + fn.name + "(" + parts.join(", ") + ")]]";
  }

  /* ---- Bloque flotante para completar los parámetros de una función auxiliar ---- */
  type ParamPopupCtx =
    | { mode: "range"; cell: HTMLElement; step: Step; field: "step"; range: Range }
    | { mode: "replace"; cell: HTMLElement; step: Step; field: "step"; before: string; after: string };

  interface ParamPopupState {
    fn: SuggestItem;
    ctx: ParamPopupCtx;
    inputs: HTMLInputElement[];
  }

  const paramPopup = el("div", { class: "steps__param-popup" });
  paramPopup.hidden = true;
  let paramPopupState: ParamPopupState | null = null;

  function onParamPopupOutsideClick(e: MouseEvent) {
    if (paramPopup.contains(e.target as Node)) return;
    closeParamPopup();
  }

  function closeParamPopup() {
    if (!paramPopupState) return;
    paramPopupState = null;
    paramPopup.hidden = true;
    paramPopup.innerHTML = "";
    document.removeEventListener("mousedown", onParamPopupOutsideClick, true);
  }

  function positionParamPopup(cell: HTMLElement) {
    const containerRect = container.getBoundingClientRect();
    const caretRect = getCaretClientRect();
    const anchor = caretRect || cell.getBoundingClientRect();
    const top = anchor.bottom - containerRect.top + 4;
    const left = anchor.left - containerRect.left;
    paramPopup.style.top = Math.max(0, top) + "px";
    paramPopup.style.left = Math.max(0, left) + "px";
  }

  function confirmParamPopup() {
    if (!paramPopupState) return;
    const { fn, ctx, inputs } = paramPopupState;
    const values = inputs.map((input) => input.value);
    const token = buildFnTokenWithValues(fn, values);
    closeParamPopup();
    if (ctx.mode === "range") {
      insertToken(token, "una función auxiliar", { cell: ctx.cell, step: ctx.step, field: ctx.field, range: ctx.range });
    } else {
      const newText = ctx.before + token + ctx.after;
      ctx.step[ctx.field] = newText;
      onChange(steps.slice());
      ctx.cell.focus();
      ctx.cell.innerHTML = newText ? renderStepRichText(newText, { variables, functions: functionsForHighlight() }) : "";
      setCaretCharOffset(ctx.cell, ctx.before.length + token.length);
    }
    if (onFunctionInserted) onFunctionInserted(fn.name);
  }

  function openParamPopup(fn: SuggestItem, ctx: ParamPopupCtx) {
    closeSuggest();
    closeParamPopup();
    const params = (fn.params || []).map((p) => p.trim()).filter(Boolean);
    const inputs: HTMLInputElement[] = [];

    paramPopup.innerHTML = "";
    paramPopup.appendChild(
      el("div", { class: "steps__param-popup-title", text: "Completar parámetros" })
    );
    params.forEach((paramName) => {
      const input = el("input", {
        class: "input steps__param-popup-input",
        placeholder: paramName,
      }) as HTMLInputElement;
      inputs.push(input);
      paramPopup.appendChild(
        el("label", { class: "steps__param-popup-field" }, [
          el("span", { class: "steps__param-popup-label", text: paramName }),
          input,
        ])
      );
    });
    const cancelBtn = el("button", { class: "btn btn--sm btn--ghost", type: "button", text: "Cancelar" });
    const insertBtn = el("button", { class: "btn btn--sm btn--primary", type: "button", text: "Insertar" });
    cancelBtn.addEventListener("click", () => closeParamPopup());
    insertBtn.addEventListener("click", () => confirmParamPopup());
    paramPopup.appendChild(el("div", { class: "steps__param-popup-actions" }, [cancelBtn, insertBtn]));

    paramPopup.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        confirmParamPopup();
      } else if (e.key === "Escape") {
        e.preventDefault();
        closeParamPopup();
      }
    });

    paramPopupState = { fn, ctx, inputs };
    positionParamPopup(ctx.cell);
    paramPopup.hidden = false;
    document.addEventListener("mousedown", onParamPopupOutsideClick, true);
    window.setTimeout(() => inputs[0]?.focus(), 0);
  }

  /* ---- Autocompletado: sugiere variables ({{) o funciones ([[) mientras se escribe ---- */
  const suggestBox = el("div", { class: "steps__suggest" });
  suggestBox.hidden = true;
  let suggestState: SuggestState | null = null;

  function closeSuggest() {
    suggestState = null;
    suggestBox.hidden = true;
    suggestBox.innerHTML = "";
  }

  function getCaretClientRect(): DOMRect | null {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0).cloneRange();
    range.collapse(true);
    const rect = range.getBoundingClientRect();
    if (rect && (rect.width || rect.height || rect.top || rect.left)) return rect;
    return null;
  }

  function positionSuggest(cell: HTMLElement) {
    const containerRect = container.getBoundingClientRect();
    const caretRect = getCaretClientRect();
    const anchor = caretRect || cell.getBoundingClientRect();
    const top = anchor.bottom - containerRect.top + 4;
    const left = anchor.left - containerRect.left;
    suggestBox.style.top = Math.max(0, top) + "px";
    suggestBox.style.left = Math.max(0, left) + "px";
  }

  function renderSuggestList() {
    if (!suggestState) return;
    suggestBox.innerHTML = "";
    suggestState.items.forEach((item, idx) => {
      const row = el("div", {
        class: "steps__suggest-item" + (idx === suggestState!.activeIndex ? " is-active" : ""),
        "data-kind": suggestState!.kind,
      });
      row.appendChild(
        el("span", {
          class: "steps__suggest-token",
          text: suggestState!.kind === "var" ? "{{" + item.name + "}}" : "[[" + item.name + "]]",
        })
      );
      row.addEventListener("mousedown", (e) => {
        e.preventDefault();
        acceptSuggestion(idx);
      });
      row.addEventListener("mouseenter", () => {
        if (suggestState) {
          suggestState.activeIndex = idx;
          renderSuggestList();
        }
      });
      suggestBox.appendChild(row);
    });
    if (!suggestState.items.length) {
      suggestBox.appendChild(
        el("div", {
          class: "steps__suggest-empty",
          text: suggestState.kind === "var" ? "Sin variables que coincidan" : "Sin funciones que coincidan",
        })
      );
    }
  }

  function openSuggest(kind: "var" | "fn", cell: HTMLElement, step: Step, field: "step", triggerStart: number, query: string) {
    const pool: SuggestItem[] =
      kind === "var" ? (variables || []).filter((v) => v.name && v.name.trim()) : functionsForHighlight();
    const q = query.toLowerCase();
    const items = pool.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 8);
    suggestState = { cell, step, field, kind, triggerStart, items, activeIndex: 0 };
    renderSuggestList();
    positionSuggest(cell);
    suggestBox.hidden = false;
  }

  function acceptSuggestion(idx?: number) {
    if (!suggestState) return;
    const item = suggestState.items[idx != null ? idx : suggestState.activeIndex];
    if (!item) {
      closeSuggest();
      return;
    }
    const { cell, step, field, kind, triggerStart } = suggestState;
    const text = cell.textContent || "";
    const caret = getCaretCharOffset(cell);
    const before = text.slice(0, triggerStart);
    const after = text.slice(caret == null ? text.length : caret);

    if (kind === "fn") {
      const params = (item.params || []).map((p) => p.trim()).filter(Boolean);
      closeSuggest();
      if (!params.length) {
        const token = formatFnCallToken(item);
        const newText = before + token + after;
        step[field] = newText;
        onChange(steps.slice());
        cell.focus();
        cell.innerHTML = newText ? renderStepRichText(newText, { variables, functions: functionsForHighlight() }) : "";
        setCaretCharOffset(cell, before.length + token.length);
        if (onFunctionInserted) onFunctionInserted(item.name);
        return;
      }
      openParamPopup(item, { mode: "replace", cell, step, field, before, after });
      return;
    }

    const token = "{{" + item.name + "}}";
    const newText = before + token + after;
    step[field] = newText;
    onChange(steps.slice());
    cell.focus();
    cell.innerHTML = newText ? renderStepRichText(newText, { variables, functions: functionsForHighlight() }) : "";
    setCaretCharOffset(cell, before.length + token.length);
    closeSuggest();
  }

  function updateSuggestFromCaret(cell: HTMLElement, step: Step, field: "step") {
    const caret = getCaretCharOffset(cell);
    if (caret == null) {
      closeSuggest();
      return;
    }
    const text = cell.textContent || "";
    const before = text.slice(0, caret);
    const openVar = before.lastIndexOf("{{");
    const closeVar = before.lastIndexOf("}}");
    const openFn = before.lastIndexOf("[[");
    const closeFn = before.lastIndexOf("]]");

    if (openVar > closeVar && openVar >= 0) {
      const query = before.slice(openVar + 2);
      if (!/[{}[\]]/.test(query)) {
        openSuggest("var", cell, step, field, openVar, query);
        return;
      }
    }
    if (openFn > closeFn && openFn >= 0) {
      const query = before.slice(openFn + 2);
      if (!/[{}[\]]/.test(query)) {
        openSuggest("fn", cell, step, field, openFn, query);
        return;
      }
    }
    closeSuggest();
  }

  /* ---- Atajo Ctrl+Enter (⌘+Enter en Mac): agrega una fila nueva ---- */
  const isMac =
    typeof navigator !== "undefined" &&
    (/Mac|iPod|iPhone|iPad/.test(navigator.platform || "") || /Mac/.test(navigator.userAgent || ""));
  const addRowShortcutLabel = isMac ? "⌘ + Enter" : "Ctrl + Enter";

  const shortcutHint = el("div", { class: "steps__shortcut-hint" }, [
    el("kbd", { text: isMac ? "⌘" : "Ctrl" }),
    el("span", { text: "+" }),
    el("kbd", { text: "Enter" }),
    el("span", { class: "steps__shortcut-hint-label", text: "agrega una fila" }),
  ]);
  shortcutHint.hidden = true;

  let shortcutHintShowTimer: ReturnType<typeof setTimeout> | null = null;
  let shortcutHintHideTimer: ReturnType<typeof setTimeout> | null = null;

  function hideShortcutHint() {
    if (shortcutHintShowTimer) {
      clearTimeout(shortcutHintShowTimer);
      shortcutHintShowTimer = null;
    }
    if (shortcutHintHideTimer) {
      clearTimeout(shortcutHintHideTimer);
      shortcutHintHideTimer = null;
    }
    shortcutHint.hidden = true;
  }

  function showShortcutHint(cell: HTMLElement) {
    if (!cell.isConnected) return;
    const containerRect = container.getBoundingClientRect();
    const cellRect = cell.getBoundingClientRect();
    const top = cellRect.bottom - containerRect.top + 6;
    const left = cellRect.left - containerRect.left;
    shortcutHint.style.top = Math.max(0, top) + "px";
    shortcutHint.style.left = Math.max(0, left) + "px";
    shortcutHint.hidden = false;
    if (shortcutHintHideTimer) clearTimeout(shortcutHintHideTimer);
    shortcutHintHideTimer = setTimeout(() => {
      shortcutHint.hidden = true;
    }, 3200);
  }

  function scheduleShortcutHint(cell: HTMLElement) {
    if (shortcutHintShowTimer) clearTimeout(shortcutHintShowTimer);
    if (shortcutHintHideTimer) clearTimeout(shortcutHintHideTimer);
    shortcutHint.hidden = true;
    shortcutHintShowTimer = setTimeout(() => {
      showShortcutHint(cell);
    }, 1800);
  }

  function addRowAfter(referenceStep: Step) {
    const idx = steps.indexOf(referenceStep);
    const insertAt = idx > -1 ? idx + 1 : steps.length;
    steps.splice(insertAt, 0, { id: insertAt + 1, step: "" });
    renumber();
    renderRows();
    onChange(steps.slice());
    const newRow = tbody.children[insertAt] as HTMLElement | undefined;
    const newCell = newRow?.children[1]?.firstChild as HTMLElement | undefined;
    if (newCell) {
      newCell.focus();
      setCaretCharOffset(newCell, 0);
    }
  }

  const countBadge = el("span", { class: "steps__count" });
  const head = el("div", { class: "steps__head" }, [
    el("div", { class: "steps__title" }, [
      el("span", { html: SVG.listCheck }),
      el("h3", { text: "Guión" }),
      countBadge,
    ]),
    el("div", { class: "row gap-8" }, [
      varSelect,
      fnSelect,
      el("button", {
        class: "btn btn--sm btn--icon",
        html: SVG.plusCircle,
        title: "Agregar fila (" + addRowShortcutLabel + ")",
        type: "button",
      }),
    ]),
  ]);
  const headAddBtn = head.querySelector("button") as HTMLButtonElement;
  headAddBtn.addEventListener("click", () => addRow());

  const table = el("table", { class: "steps-table" });
  const thead = el("thead", {}, [
    el("tr", {}, [
      el("th", { class: "col-id", text: "ID" }),
      el("th", { text: "Paso funcional" }),
      el("th", { class: "col-actions" }),
    ]),
  ]);
  const tbody = el("tbody");
  table.appendChild(thead);
  table.appendChild(tbody);

  const footAddBtn = el("button", {
    class: "btn btn--sm",
    html: SVG.plusCircle + "<span>Agregar fila</span>",
    title: "Agregar fila (" + addRowShortcutLabel + ")",
    type: "button",
  });
  footAddBtn.addEventListener("click", () => addRow());
  const footAdd = el("div", { class: "steps__foot" }, [footAddBtn]);

  function renumber() {
    steps.forEach((s, idx) => (s.id = idx + 1));
  }

  function editableCell(step: Step, fieldName: "step", placeholder: string) {
    const cell = el("div", {
      class: "cell-editable",
      contenteditable: "true",
      "data-placeholder": placeholder,
    });
    const initial = step[fieldName] || "";
    cell.innerHTML = initial ? renderStepRichText(initial, { variables, functions: functionsForHighlight() }) : "";

    cell.addEventListener("input", () => {
      const text = cell.textContent || "";
      const caret = getCaretCharOffset(cell);
      step[fieldName] = text;
      onChange(steps.slice());

      cell.innerHTML = text ? renderStepRichText(text, { variables, functions: functionsForHighlight() }) : "";
      if (caret != null) setCaretCharOffset(cell, caret);
      updateSuggestFromCaret(cell, step, fieldName);
      scheduleShortcutHint(cell);
    });

    cell.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.key === "NumpadEnter") && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        closeSuggest();
        hideShortcutHint();
        addRowAfter(step);
        return;
      }
      if (suggestState && suggestState.cell === cell && !suggestBox.hidden) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          suggestState.activeIndex = Math.min(suggestState.items.length - 1, suggestState.activeIndex + 1);
          renderSuggestList();
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          suggestState.activeIndex = Math.max(0, suggestState.activeIndex - 1);
          renderSuggestList();
          return;
        }
        if ((e.key === "Enter" || e.key === "Tab") && suggestState.items.length) {
          e.preventDefault();
          acceptSuggestion();
          return;
        }
        if (e.key === "Escape") {
          e.preventDefault();
          closeSuggest();
          return;
        }
      }
      if (e.key === "Enter") {
        e.preventDefault();
        cell.blur();
      }
    });

    cell.addEventListener("focus", () => {
      savedContext = { step, field: fieldName, cell, range: null };
    });
    function captureSelection() {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && cell.contains(sel.anchorNode)) {
        savedContext = { step, field: fieldName, cell, range: sel.getRangeAt(0).cloneRange() };
      }
    }
    cell.addEventListener("keyup", captureSelection);
    cell.addEventListener("mouseup", captureSelection);
    cell.addEventListener("blur", () => {
      captureSelection();
      if (suggestState && suggestState.cell === cell) closeSuggest();
      hideShortcutHint();
    });
    return cell;
  }

  function renderRows() {
    tbody.innerHTML = "";
    countBadge.textContent = steps.length + (steps.length === 1 ? " paso" : " pasos");
    steps.forEach((step) => {
      const deleteBtn = el("button", {
        class: "btn btn--sm btn--icon btn--ghost",
        html: SVG.trash,
        title: "Eliminar paso",
        type: "button",
      });
      deleteBtn.addEventListener("click", () => {
        const idx = steps.indexOf(step);
        if (idx > -1) steps.splice(idx, 1);
        renumber();
        renderRows();
        onChange(steps.slice());
      });
      const tr = el("tr", {}, [
        el("td", { class: "col-id", text: String(step.id) }),
        el("td", {}, [editableCell(step, "step", "Ingrese paso")]),
        el("td", { class: "col-actions" }, [deleteBtn]),
      ]);
      tbody.appendChild(tr);
    });
  }

  function addRow() {
    steps.push({ id: steps.length + 1, step: "" });
    renderRows();
    onChange(steps.slice());
  }

  if (steps.length === 0) addRow();
  else renderRows();

  refreshVarOptions();
  refreshFnOptions();
  container.appendChild(head);
  container.appendChild(table);
  container.appendChild(footAdd);
  container.appendChild(suggestBox);
  container.appendChild(shortcutHint);
  container.appendChild(paramPopup);

  return {
    setVariables(nextVariables: Variable[]) {
      variables = nextVariables;
      refreshVarOptions();
    },
    destroy() {
      closeSuggest();
      hideShortcutHint();
      closeParamPopup();
      container.innerHTML = "";
    },
  };
}
