"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChipsInput } from "@/components/ChipsInput";
import { VariablesTable } from "@/components/VariablesTable";
import { StepsTable } from "@/components/StepsTable";
import { Field } from "@/components/Field";
import { Constants } from "@/lib/constants";
import { DataApi } from "@/lib/dataApi";
import { exportDataActual } from "@/lib/exportData";
import type { AuxiliaryFunction, FunctionRef, Scenario, Step, Variable } from "@/lib/types";
import { useToast } from "@/components/ToastProvider";
import { ExportIcon, FilePlusIcon, SaveIcon } from "@/components/icons";

export default function CrearEscenarioPage() {
  return (
    <Suspense fallback={null}>
      <CrearEscenarioForm />
    </Suspense>
  );
}

function CrearEscenarioForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showToast = useToast();
  const editId = searchParams.get("id");

  const [loaded, setLoaded] = useState(false);
  const [id, setId] = useState<string | undefined>(undefined);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [precondition, setPrecondition] = useState<string[]>([]);
  const [auxiliaryFunctions, setAuxiliaryFunctions] = useState<FunctionRef[]>([]);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [initialSteps, setInitialSteps] = useState<Step[]>([]);
  const currentStepsRef = useRef<Step[]>([]);

  // Carga inicial desde localStorage (sólo existe en el cliente): se hace en
  // un efecto para no desincronizar el HTML renderizado en el servidor.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (editId) {
      const scenarios = DataApi.getData<Scenario>(Constants.KEY_DATA_SCENARIO);
      const found = scenarios.find((s) => s.id === editId);
      if (found) {
        setId(found.id);
        setName(found.name || "");
        setDescription(found.description || "");
        setPrecondition(found.precondition ? found.precondition.slice() : []);
        setAuxiliaryFunctions(found.auxiliaryFunctions ? found.auxiliaryFunctions.slice() : []);
        setVariables(found.variables ? found.variables.map((v) => ({ ...v })) : []);
        const steps = found.steps ? found.steps.map((s) => ({ ...s })) : [];
        setInitialSteps(steps);
        currentStepsRef.current = steps;
      }
    }
    setLoaded(true);
  }, [editId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const editing = !!id;

  function getData(): Scenario {
    return {
      id: id as string,
      name,
      description,
      precondition,
      auxiliaryFunctions,
      variables,
      steps: currentStepsRef.current,
    };
  }

  function handleFunctionInserted(fnName: string) {
    if (auxiliaryFunctions.some((f) => f.name === fnName)) return;
    const fn = DataApi.getData<AuxiliaryFunction>(Constants.KEY_DATA_FUNCTION).find((f) => f.name === fnName);
    if (!fn) return;
    setAuxiliaryFunctions((prev) => [...prev, { id: fn.id, name: fn.name }]);
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
      DataApi.saveData(Constants.KEY_DATA_SCENARIO, getData());
      showToast("success", "Correcto", editing ? "Datos actualizados correctamente" : "Datos guardados correctamente");
      router.push("/escenarios");
    } catch {
      showToast("error", "Error", "Error guardando datos");
    }
  }

  if (!loaded) return null;

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-head__title">{editing ? "Editar escenario" : "Crear escenario"}</h1>
          <p className="page-head__subtitle">
            {editing
              ? "Modificá los datos del escenario y su guión de pasos."
              : "Definí el escenario, sus precondiciones y el guión de pasos a ejecutar."}
          </p>
        </div>
      </div>

      <div className="workbench">
        <div className="panel">
          <div className="panel__header">
            <div className="panel__title">
              <FilePlusIcon />
              <span>Datos del escenario</span>
            </div>
          </div>
          <div className="panel__body">
            <Field label="Nombre">
              <input
                className="input"
                type="text"
                placeholder="Nombre del escenario"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field label="Descripción">
              <textarea
                className="textarea"
                placeholder="Describa el propósito y alcance del escenario…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
            <Field label="Precondiciones" hint="Enter para agregar">
              <ChipsInput values={precondition} onChange={setPrecondition} placeholder="Agregar precondición…" />
            </Field>
            <Field label="Variables" hint="Usalas en los pasos con {{nombre}}">
              <VariablesTable variables={variables} onChange={setVariables} />
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
              variables={variables}
              onChange={(steps) => {
                currentStepsRef.current = steps;
              }}
              onFunctionInserted={handleFunctionInserted}
            />
          </div>
        </div>
      </div>
    </>
  );
}
