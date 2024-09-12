import { PatientGroup } from "./PatientGroup";

export type Patient = {
    display: string;
    id: string;
    group?: PatientGroup;
  };