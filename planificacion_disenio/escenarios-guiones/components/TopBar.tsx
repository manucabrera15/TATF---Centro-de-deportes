"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Constants } from "@/lib/constants";
import { exportData, exportDataPlainText } from "@/lib/exportData";
import { DataApi } from "@/lib/dataApi";
import { useToast } from "./ToastProvider";
import { useConfirmDialog } from "./ModalProvider";
import { DownloadIcon, EyeIcon, FilePlusIcon, FileTextIcon, HomeIcon, LogoIcon, TrashIcon } from "./icons";

const ROUTES = [
  { href: "/", label: "Inicio", Icon: HomeIcon },
  { href: "/escenarios/crear", label: "Crear escenario", Icon: FilePlusIcon },
  { href: "/funciones/crear", label: "Crear función auxiliar", Icon: FilePlusIcon },
  { href: "/escenarios", label: "Ver escenarios", Icon: EyeIcon },
  { href: "/funciones", label: "Ver funciones auxiliares", Icon: EyeIcon },
];

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const showToast = useToast();
  const confirmDialog = useConfirmDialog();

  function exportJson() {
    exportData(Constants.KEY_DATA_SCENARIO, Constants.KEY_DATA_SCENARIO);
    exportData(Constants.KEY_DATA_FUNCTION, Constants.KEY_DATA_FUNCTION);
    showToast("success", "Correcto", "Datos exportados correctamente");
  }

  function exportPlainText() {
    exportDataPlainText(Constants.KEY_DATA_SCENARIO, Constants.KEY_DATA_SCENARIO);
    exportDataPlainText(Constants.KEY_DATA_FUNCTION, Constants.KEY_DATA_FUNCTION);
    showToast("success", "Correcto", "Datos exportados correctamente");
  }

  async function wipeAll() {
    const ok = await confirmDialog({
      title: "Eliminar todos los datos",
      body: "Se eliminarán todos los escenarios y funciones auxiliares guardados. Esta acción no se puede deshacer.",
      confirmLabel: "Eliminar todo",
      danger: true,
    });
    if (!ok) return;
    try {
      DataApi.deleteData(Constants.KEY_DATA_SCENARIO);
      DataApi.deleteData(Constants.KEY_DATA_FUNCTION);
      showToast("success", "Aviso", "Datos eliminados correctamente");
      router.push("/");
    } catch {
      showToast("error", "Error", "Error eliminando datos");
    }
  }

  return (
    <header className="topbar">
      <Link href="/" className="brand">
        <span className="brand__mark">
          <LogoIcon />
        </span>
        <span>Escenarios y Guiones</span>
      </Link>

      <nav className="nav">
        {ROUTES.map((r) => (
          <Link key={r.href} href={r.href} className={"nav__link" + (pathname === r.href ? " is-active" : "")}>
            <r.Icon />
            <span>{r.label}</span>
          </Link>
        ))}
        <a className="nav__link" data-action="true" href="javascript:void(0)" onClick={exportJson}>
          <DownloadIcon />
          <span>Exportar JSON</span>
        </a>
        <a className="nav__link" data-action="true" href="javascript:void(0)" onClick={exportPlainText}>
          <FileTextIcon />
          <span>Exportar texto plano</span>
        </a>
      </nav>

      <div className="topbar__end">
        <button
          className="btn btn--icon btn--danger"
          aria-label="Eliminar datos guardados"
          title="Eliminar datos guardados"
          onClick={wipeAll}
        >
          <TrashIcon />
        </button>
      </div>
    </header>
  );
}
