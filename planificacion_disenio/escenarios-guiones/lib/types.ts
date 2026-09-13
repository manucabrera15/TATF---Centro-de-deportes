export interface Variable {
  name: string;
}

export interface Step {
  id: number;
  step: string;
}

export interface FunctionRef {
  id: string | null;
  name: string;
  unknown?: boolean;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  precondition: string[];
  auxiliaryFunctions: FunctionRef[];
  variables: Variable[];
  steps: Step[];
}

export interface AuxiliaryFunction {
  id: string;
  name: string;
  description: string;
  params: string[];
  steps: Step[];
}

export type SavedItem = Scenario | AuxiliaryFunction;
