"use client";

import { useEffect, useState } from "react";
import { Constants } from "@/lib/constants";
import { DataApi } from "@/lib/dataApi";
import { collectCalledFunctions, renderStepRichText } from "@/lib/tokens";
import type { AuxiliaryFunction, FunctionRef, Scenario, SavedItem, Variable } from "@/lib/types";
import { ChevronDownIcon, EditIcon, TrashIcon } from "./icons";

interface DataCardProps {
  data: Scenario | AuxiliaryFunction;
  kind: "scenario" | "function";
  onEdit: (data: SavedItem) => void;
  onDelete: (data: SavedItem) => void;
}

export function DataCard({ data, kind, onEdit, onDelete }: DataCardProps) {
  const [allFunctions, setAllFunctions] = useState<AuxiliaryFunction[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAllFunctions(DataApi.getData<AuxiliaryFunction>(Constants.KEY_DATA_FUNCTION));
  }, []);

  const tags = kind === "scenario" ? (data as Scenario).precondition : (data as AuxiliaryFunction).params;
  const tagsLabel = kind === "scenario" ? "Precondiciones" : "Parámetros";
  const emptyTagsLabel = kind === "scenario" ? "Sin precondiciones" : "Sin parámetros";

  const variables: Variable[] =
    kind === "scenario" ? (data as Scenario).variables || [] : ((data as AuxiliaryFunction).params || []).map((p) => ({ name: p }));

  const calledFunctions: FunctionRef[] = collectCalledFunctions(data, allFunctions, data.id);
  const steps = data.steps || [];

  const deleteLabel = kind === "scenario" ? "Eliminar escenario" : "Eliminar función";
  const editLabel = kind === "scenario" ? "Editar escenario" : "Editar función";
  const toggleLabel = expanded ? "Ocultar detalles" : "Ver más detalles";

  return (
    <div className="data-card">
      <div className="data-card__header">
        <div className="data-card__title">{data.name}</div>
        <div className="row gap-8">
          <button
            className="btn btn--sm btn--icon data-card__toggle"
            title={toggleLabel}
            aria-label={toggleLabel}
            aria-expanded={expanded}
            onClick={() => setExpanded((prev) => !prev)}
          >
            <ChevronDownIcon className={"data-card__toggle-icon" + (expanded ? " is-open" : "")} />
          </button>
          <button
            className="btn btn--sm btn--icon btn--accent"
            title={editLabel}
            aria-label={editLabel}
            onClick={() => onEdit(data)}
          >
            <EditIcon />
          </button>
          <button
            className="btn btn--sm btn--icon btn--danger"
            title={deleteLabel}
            aria-label={deleteLabel}
            onClick={() => onDelete(data)}
          >
            <TrashIcon />
          </button>
        </div>
      </div>
      <div className="data-card__body">
        <div>
          <div className="data-card__block-label">Descripción</div>
          <p className="data-card__desc">{data.description || "Sin descripción."}</p>
        </div>

        {expanded ? (
          <>
            <div>
              <div className="data-card__block-label">{tagsLabel}</div>
              {tags && tags.length ? (
                <div className="tag-row">
                  {tags.map((t, i) => (
                    <span className={"tag" + (kind === "function" ? " tag--param" : "")} key={t + i}>
                      {t}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="tag tag--empty">{emptyTagsLabel}</span>
              )}
            </div>

            {kind === "scenario" ? (
              <div>
                <div className="data-card__block-label">Variables</div>
                {variables.length ? (
                  <div className="tag-row">
                    {variables.map((v, i) => (
                      <span className="tag tag--var" key={v.name + i}>
                        <code>{"{{" + v.name + "}}"}</code>
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="tag tag--empty">Sin variables</span>
                )}
              </div>
            ) : null}

            <div>
              <div className="data-card__block-label">Funciones auxiliares</div>
              {calledFunctions.length ? (
                <div className="tag-row">
                  {calledFunctions.map((f, i) => (
                    <span
                      className={"tag " + (f.unknown ? "tag--aux-unknown" : "tag--aux")}
                      title={f.unknown ? "No se encontró una función guardada con este nombre" : "Función auxiliar"}
                      key={f.name + i}
                    >
                      {f.name}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="tag tag--empty">No llama funciones auxiliares</span>
              )}
            </div>

            <div>
              <div className="data-card__block-label">Guión ({steps.length})</div>
              {steps.length ? (
                <table className="mini-table">
                  <thead>
                    <tr>
                      <th className="col-id">ID</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {steps.map((s) => (
                      <tr key={s.id}>
                        <td className="col-id">{s.id}</td>
                        <td
                          dangerouslySetInnerHTML={{
                            __html: renderStepRichText(s.step, { variables, functions: allFunctions }),
                          }}
                        />
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <span className="tag tag--empty">Sin pasos</span>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
