"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChipsInput } from "@/components/ChipsInput";
import { StepsTable } from "@/components/StepsTable";
import { Field } from "@/components/Field";
import { Constants } from "@/lib/constants";
import { DataApi } from "@/lib/dataApi";
import { exportDataActual } from "@/lib/exportData";
import type { AuxiliaryFunction, Step, Variable } from "@/lib/types";
import { useToast } from "@/components/ToastProvider";
import { ExportIcon, FilePlusIcon, SaveIcon } from "@/components/icons";

export default function CrearFuncionPage() {
  return (
    <Suspense fallback={null}>
      <CrearFuncionForm />
    </Suspense>
  );
}

function CrearFuncionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showToast = useToast();
  const editId = searchParams.get("id");

  const [loaded, setLoaded] = useState(false);
  const [id, setId] = useState<string | undefined>(undefined);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [params, setParams] = useState<string[]>([]);
  const [initialSteps, setInitialSteps] = useState<Step[]>([]);
  const currentStepsRef = useRef<Step[]>([]);

  // Carga inicial desde localStorage (sólo existe en el cliente): se hace en
  // un efecto para no desincronizar el HTML renderizado en el servidor.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (editId) {
      const functions = DataApi.getData<AuxiliaryFunction>(Constants.KEY_DATA_FUNCTION);
      const found = functions.find((f) => f.id === editId);
      if (found) {
        setId(found.id);
        setName(found.name || "");
        setDescription(found.description || "");
        setParams(found.params ? found.params.slice() : []);
        const steps = found.steps ? found.steps.map((s) => ({ ...s })) : [];
        setInitialSteps(steps);
        currentStepsRef.current = steps;
      }
    }
    setLoaded(true);
  }, [editId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const editing = !!id;

  // Los parámetros de la función funcionan como sus variables: se pueden
  // referenciar dentro del guión con {{nombre}}.
  const paramVariables: Variable[] = params
    .filter((p) => p && p.trim())
    .map((p) => ({ name: p.trim(), value: "Parámetro de la función" }));

  function getData(): AuxiliaryFunction {
    return {
      id: id as string,
      name,
      description,
      params,
      steps: currentStepsRef.current,
    };
  }

  function handleExport() {
    try {
      exportDataActual(getData());
      showToast("success", "Correcto", "Datos exportados correctamente");
    } catch {
      showToast("error", "Error", "Error exportando datos");
    }
  }

  function handleSave() {
    if (!name.trim()) {
      showToast("warn", "Falta información", "Ingrese un nombre antes de guardar");
      return;
    }
    try {
      DataApi.saveData(Constants.KEY_DATA_FUNCTION, getData());
      showToast("success", "Correcto", editing ? "Datos actualizados correctamente" : "Datos guardados correctamente");
      router.push("/funciones");
    } catch {
      showToast("error", "Error", "Error guardando datos");
    }
  }

  if (!loaded) return null;

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-head__title">{editing ? "Editar función auxiliar" : "Crear función auxiliar"}</h1>
          <p className="page-head__subtitle">
            {editing
              ? "Modificá los datos de la función y su guión de pasos."
              : "Documentá una función reutilizable con sus parámetros y su guión de pasos."}
          </p>
        </div>
      </div>

      <div className="workbench">
        <div className="panel">
          <div className="panel__header">
            <div className="panel__title">
              <FilePlusIcon />
              <span>Datos de la función</span>
            </div>
          </div>
          <div className="panel__body">
            <Field label="Nombre">
              <input
                className="input"
                type="text"
                placeholder="Nombre de la función"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field label="Parámetros" hint="Usalos en los pasos con {{parámetro}}">
              <ChipsInput values={params} onChange={setParams} placeholder="Agregar parámetro…" />
            </Field>
            <Field label="Descripción">
              <textarea
                className="textarea"
                placeholder="Describa el propósito y uso de la función…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
          </div>
          <div className="panel__footer">
            <button className="btn" onClick={handleExport}>
              <ExportIcon />
              <span>Exportar</span>
            </button>
            <button className="btn btn--primary" onClick={handleSave}>
              <SaveIcon />
              <span>{editing ? "Guardar cambios" : "Guardar"}</span>
            </button>
          </div>
        </div>

        <div className="panel">
          <div className="panel__body">
            <StepsTable
              initialSteps={initialSteps}
              variables={paramVariables}
              excludeFunctionId={id}
              onChange={(steps) => {
                currentStepsRef.current = steps;
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
