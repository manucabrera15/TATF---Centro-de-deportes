"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DataCard } from "@/components/DataCard";
import { EmptyState } from "@/components/EmptyState";
import { Constants } from "@/lib/constants";
import { DataApi } from "@/lib/dataApi";
import type { AuxiliaryFunction } from "@/lib/types";
import { useToast } from "@/components/ToastProvider";
import { useConfirmDialog } from "@/components/ModalProvider";

export default function VerFuncionesPage() {
  const router = useRouter();
  const showToast = useToast();
  const confirmDialog = useConfirmDialog();
  const [items, setItems] = useState<AuxiliaryFunction[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(DataApi.getData<AuxiliaryFunction>(Constants.KEY_DATA_FUNCTION));
    setLoaded(true);
  }, []);

  async function handleDelete(item: AuxiliaryFunction) {
    const ok = await confirmDialog({
      title: "Eliminar función auxiliar",
      body: "¿Eliminar la función “" + item.name + "”? Los escenarios que la referencian conservarán su nombre pero perderán el vínculo.",
      confirmLabel: "Eliminar",
      danger: true,
    });
    if (!ok) return;
    try {
      DataApi.deleteItem(item.id, Constants.KEY_DATA_FUNCTION);
      showToast("success", "Aviso", "Función eliminada correctamente");
      setItems(DataApi.getData<AuxiliaryFunction>(Constants.KEY_DATA_FUNCTION));
    } catch {
      showToast("error", "Error", "Error eliminando función");
    }
  }

  if (!loaded) return null;

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-head__title">Funciones auxiliares</h1>
          <p className="page-head__subtitle">Funciones reutilizables disponibles para llamar desde cualquier escenario.</p>
        </div>
        <span className="page-head__meta">
          {items.length} guardada{items.length === 1 ? "" : "s"}
        </span>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Todavía no hay funciones auxiliares"
          desc="Creá funciones reutilizables para referenciarlas luego desde tus escenarios."
        />
      ) : (
        <div className="grid-cards">
          {items.map((data) => (
            <DataCard
              key={data.id}
              data={data}
              kind="function"
              onEdit={(item) => router.push(`/funciones/crear?id=${item.id}`)}
              onDelete={(item) => handleDelete(item as AuxiliaryFunction)}
            />
          ))}
        </div>
      )}
    </>
  );
}
