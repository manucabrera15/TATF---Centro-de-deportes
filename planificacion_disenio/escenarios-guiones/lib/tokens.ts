import type { AuxiliaryFunction, FunctionRef, SavedItem, Step, Variable } from "./types";

export const VAR_TOKEN_RE = /\{\{\s*([^{}]+?)\s*\}\}/g;
export const FN_TOKEN_RE = /\[\[\s*([^[\]]+?)\s*\]\]/g;

function escapeHtml(str: string | null | undefined): string {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface RenderContext {
  variables?: Variable[];
  functions?: { id: string; name: string }[];
}

/**
 * Separa el nombre de una función del texto de sus parámetros dentro de un
 * token [[Nombre(param1, param2)]]. Si no hay paréntesis, paramsText es null.
 */
function parseFnToken(raw: string): { name: string; paramsText: string | null } {
  const match = raw.match(/^(.*?)\(([^()]*)\)$/);
  if (match) return { name: match[1].trim(), paramsText: match[2] };
  return { name: raw, paramsText: null };
}

/**
 * Convierte un texto plano en HTML seguro, resaltando:
 *  - referencias a variables/parámetros: {{nombre}}
 *  - llamados a funciones auxiliares: [[Nombre función]]
 */
export function renderStepRichText(text: string | null | undefined, { variables, functions }: RenderContext = {}): string {
  let escaped = escapeHtml(text || "");

  const varNames: Record<string, boolean> = {};
  (variables || []).forEach((v) => {
    if (v && v.name) varNames[v.name.trim()] = true;
  });
  escaped = escaped.replace(VAR_TOKEN_RE, (match, rawName) => {
    const name = rawName.trim();
    const known = Object.prototype.hasOwnProperty.call(varNames, name);
    const cls = "var-token" + (known ? "" : " var-token--unknown");
    const title = known ? "Variable definida" : "Variable no definida";
    return '<span class="' + cls + '" title="' + escapeHtml(title) + '">' + match + "</span>";
  });

  const fnNames: Record<string, boolean> = {};
  (functions || []).forEach((f) => {
    if (f && f.name) fnNames[f.name.trim()] = true;
  });
  escaped = escaped.replace(FN_TOKEN_RE, (match, rawName) => {
    const trimmed = rawName.trim();
    const { name, paramsText } = parseFnToken(trimmed);
    const known = Object.prototype.hasOwnProperty.call(fnNames, name);
    const cls = "fn-token" + (known ? "" : " fn-token--unknown");
    // paramsText ya viene escapado (proviene de `escaped`, que ya pasó por escapeHtml),
    // así que se concatena tal cual para no escapar dos veces.
    const title = !known
      ? "Función auxiliar no encontrada"
      : paramsText && paramsText.trim()
        ? "Llama a la función auxiliar (parámetros: " + paramsText.trim() + ")"
        : "Llama a la función auxiliar";
    // Si el usuario ya escribió un valor (queda envuelto en comillas dobles), se muestra
    // con estilo normal; si todavía son los nombres de parámetro sin completar, en itálica.
    // paramsText ya pasó por escapeHtml, así que las comillas llegan como &quot;.
    const isFilled = paramsText != null && /^\s*&quot;.*&quot;\s*$/.test(paramsText);
    const paramsCls = "fn-token__params" + (isFilled ? " fn-token__params--filled" : "");
    const inner = paramsText != null ? name + '<span class="' + paramsCls + '">(' + paramsText + ")</span>" : trimmed;
    return '<span class="' + cls + '" title="' + title + '">[[' + inner + "]]</span>";
  });

  return escaped;
}

/** Nombres únicos referenciados como [[Nombre]] en los pasos de un ítem. */
export function extractCalledFunctionNames(steps: Step[] | undefined): string[] {
  const names: string[] = [];
  const seen: Record<string, boolean> = {};
  (steps || []).forEach((step) => {
    [step.step].forEach((text) => {
      if (!text) return;
      let match: RegExpExecArray | null;
      FN_TOKEN_RE.lastIndex = 0;
      while ((match = FN_TOKEN_RE.exec(text))) {
        const { name } = parseFnToken(match[1].trim());
        if (name && !seen[name]) {
          seen[name] = true;
          names.push(name);
        }
      }
    });
  });
  return names;
}

/**
 * Combina las funciones auxiliares elegidas explícitamente (si las hay, en
 * escenarios) con las referenciadas dentro de los pasos vía [[Nombre]],
 * resolviendo cada nombre contra la biblioteca de funciones guardadas.
 */
export function collectCalledFunctions(
  item: SavedItem,
  allFunctions: AuxiliaryFunction[],
  excludeId?: string | null
): FunctionRef[] {
  const result: FunctionRef[] = [];
  const seen: Record<string, boolean> = {};

  const explicit = (item as { auxiliaryFunctions?: FunctionRef[] }).auxiliaryFunctions;
  (explicit || []).forEach((f) => {
    if (f && f.name && !seen[f.name]) {
      seen[f.name] = true;
      result.push({ id: f.id || null, name: f.name });
    }
  });

  extractCalledFunctionNames(item.steps).forEach((name) => {
    if (seen[name]) return;
    seen[name] = true;
    const match = (allFunctions || []).find((f) => f.name === name && f.id !== excludeId);
    result.push(match ? { id: match.id, name: match.name } : { id: null, name, unknown: true });
  });

  return result;
}
