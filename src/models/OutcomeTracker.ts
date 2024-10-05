export type OutcomeTracker = {
  outcomeType: Outcome;
  outcomeMessage: string;
  jsonString?: string;
  jsonData?: any;
  operationData?: any;
};
export enum Outcome {
  NONE,
  WARNING,
  FAIL,
  SUCCESS,
  INFO
}
