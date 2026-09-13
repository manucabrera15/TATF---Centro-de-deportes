"use client";

import { useEffect, useRef } from "react";
import { mountStepsTable, type StepsTableController } from "@/lib/stepsTableController";
import type { Step, Variable } from "@/lib/types";
import { useToast } from "./ToastProvider";

interface StepsTableProps {
  initialSteps: Step[];
  variables: Variable[];
  excludeFunctionId?: string | null;
  onChange: (steps: Step[]) => void;
  onFunctionInserted?: (name: string) => void;
}

export function StepsTable({ initialSteps, variables, excludeFunctionId, onChange, onFunctionInserted }: StepsTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<StepsTableController | null>(null);
  const stepsRef = useRef<Step[]>(initialSteps.map((s) => ({ ...s })));
  const showToast = useToast();

  const onChangeRef = useRef(onChange);
  const onFunctionInsertedRef = useRef(onFunctionInserted);
  const showToastRef = useRef(showToast);

  useEffect(() => {
    onChangeRef.current = onChange;
    onFunctionInsertedRef.current = onFunctionInserted;
    showToastRef.current = showToast;
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const controller = mountStepsTable(containerRef.current, {
      steps: stepsRef.current,
      variables,
      excludeFunctionId,
      onChange: (steps) => onChangeRef.current(steps),
      onFunctionInserted: (name) => onFunctionInsertedRef.current?.(name),
      onWarn: (summary, detail) => showToastRef.current("warn", summary, detail),
    });
    controllerRef.current = controller;
    return () => {
      controller.destroy();
      controllerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    controllerRef.current?.setVariables(variables);
  }, [variables]);

  return <div className="steps" ref={containerRef} />;
}
