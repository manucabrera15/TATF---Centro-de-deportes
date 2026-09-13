/**
 * Capa de datos sobre localStorage. Sólo funciona en el cliente: cualquier
 * llamada durante un render de servidor devuelve un valor "vacío" seguro.
 */

function isBrowser() {
  return typeof window !== "undefined";
}

export const DataApi = {
  getData<T>(key: string): T[] {
    if (!isBrowser()) return [];
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T[]) : [];
    } catch (err) {
      console.error("Error obteniendo datos de localStorage:", err);
      return [];
    }
  },

  saveData<T extends { id?: string }>(key: string, newData: T): T {
    if (!isBrowser()) return newData;
    try {
      const existing = this.getData<T>(key) || [];

      if (newData.id) {
        const idx = existing.findIndex((item) => item.id === newData.id);
        if (idx > -1) {
          const updated = { ...newData };
          existing[idx] = updated;
          window.localStorage.setItem(key, JSON.stringify(existing));
          return updated;
        }
      }

      const withId = { ...newData, id: newData.id || crypto.randomUUID() };
      const combined = [...existing, withId];
      window.localStorage.setItem(key, JSON.stringify(combined));
      return withId;
    } catch (err) {
      console.error("Error guardando datos en localStorage:", err);
      throw err;
    }
  },

  deleteItem(id: string, key: string) {
    if (!isBrowser()) return;
    try {
      const data = this.getData<{ id: string }>(key);
      const updated = data.filter((item) => item.id !== id);
      window.localStorage.setItem(key, JSON.stringify(updated));
    } catch (err) {
      console.error("Error eliminando " + id + ":", err);
      throw err;
    }
  },

  deleteData(key: string) {
    if (!isBrowser()) return;
    try {
      window.localStorage.removeItem(key);
    } catch (err) {
      console.error("Error eliminando datos de localStorage:", err);
      throw err;
    }
  },
};
