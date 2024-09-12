import { GroupElement } from "./Scoring";

export type EvaluateMeasureResult = {
    jsonBody: string;
    popNames: string[];
    counts: number[];
    measureGroups?: GroupElement[];
  };