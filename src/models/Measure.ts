import { CodeableConcept } from "./CodeableConcept";

export type Measure = {
  name: string;
  scoring: CodeableConcept;
};