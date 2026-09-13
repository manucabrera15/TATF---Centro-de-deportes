"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DataCard } from "@/components/DataCard";
import { EmptyState } from "@/components/EmptyState";
import { Constants } from "@/lib/constants";
import { DataApi } from "@/lib/dataApi";
import type { Scenario } from "@/lib/types";
import { useToast } from "@/components/ToastProvider";
import { useConfirmDialog } from "@/components/ModalProvider";

export default function VerEscenariosPage() {
  const router = useRouter();
  const showToast = useToast();
  const confirmDialog = useConfirmDialog();
  const [items, setItems] = useState<Scenario[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(DataApi.getData<Scenario>(Constants.KEY_DATA_SCENARIO));
    setLoaded(true);
  }, []);

  async function handleDelete(item: Scenario) {
    const ok = await confirmDialog({
      title: "Eliminar escenario",
      body: "¿Eliminar el escenario “" + item.name + "”? Esta acción no se puede deshacer.",
      confirmLabel: "Eliminar",
      danger: true,
    });
    if (!ok) return;
    try {
      DataApi.deleteItem(item.id, Constants.KEY_DATA_SCENARIO);
      showToast("success", "Aviso", "Escenario eliminado correctamente");
      setItems(DataApi.getData<Scenario>(Constants.KEY_DATA_SCENARIO));
    } catch {
      showToast("error", "Error", "Error eliminando escenario");
    }
  }

  if (!loaded) return null;

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-head__title">Escenarios</h1>
          <p className="page-head__subtitle">Escenarios guardados localmente en este navegador.</p>
        </div>
        <span className="page-head__meta">
          {items.length} guardado{items.length === 1 ? "" : "s"}
        </span>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Todavía no hay escenarios guardados"
          desc="Creá tu primer escenario para empezar a documentar guiones de prueba."
        />
      ) : (
        <div className="grid-cards">
          {items.map((data) => (
            <DataCard
              key={data.id}
              data={data}
              kind="scenario"
              onEdit={(item) => router.push(`/escenarios/crear?id=${item.id}`)}
              onDelete={(item) => handleDelete(item as Scenario)}
            />
          ))}
        </div>
      )}
    </>
  );
}
