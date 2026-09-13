import { Constants } from "./constants";
import { DataApi } from "./dataApi";
import { collectCalledFunctions } from "./tokens";
import type { AuxiliaryFunction, SavedItem, Scenario } from "./types";

function downloadBlob(data: BlobPart, filename: string, mime: string) {
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function isFunction(item: SavedItem): item is AuxiliaryFunction {
  return (item as AuxiliaryFunction).params !== undefined;
}

export function createTxtFile(data: SavedItem[]): string {
  let content = "";
  const allFunctions = DataApi.getData<AuxiliaryFunction>(Constants.KEY_DATA_FUNCTION);

  data.forEach((item, index) => {
    content += "Nombre: " + (item.name || "Sin nombre") + "\n";
    content += "Descripción: " + (item.description || "Sin descripción") + "\n";

    if (isFunction(item)) {
      if (item.params && item.params.length > 0) {
        content += "Parámetros (variables): " + item.params.join(", ") + "\n";
      }
    } else {
      const scenario = item as Scenario;
      if (scenario.precondition && scenario.precondition.length > 0) {
        content += "Precondiciones: " + scenario.precondition.join(", ") + "\n";
      }
      if (scenario.variables && scenario.variables.length > 0) {
        content += "Variables: " + scenario.variables.map((v) => v.name).join(", ") + "\n";
      }
    }

    const called = collectCalledFunctions(item, allFunctions, item.id);
    if (called.length > 0) {
      content += "Funciones auxiliares: " + called.map((f) => f.name).join(", ") + "\n";
    }

    content += "Pasos:\n";
    (item.steps || []).forEach((step) => {
      content += "  - Paso " + step.id + ": " + step.step + "\n";
    });

    if (index < data.length - 1) content += "\n--------------------\n\n";
  });

  return content;
}

export function exportData(key: string, filename: string) {
  const data = DataApi.getData<SavedItem>(key);
  downloadBlob(JSON.stringify(data, null, 2), filename + ".json", "application/json");
}

export function exportDataActual(dataSaved: SavedItem) {
  downloadBlob(JSON.stringify(dataSaved, null, 2), (dataSaved.name || "dato") + ".json", "application/json");
}

export function exportDataPlainText(key: string, filename: string) {
  const data = DataApi.getData<SavedItem>(key);
  const content = createTxtFile(data);
  downloadBlob(content, filename + ".txt", "text/plain");
}
