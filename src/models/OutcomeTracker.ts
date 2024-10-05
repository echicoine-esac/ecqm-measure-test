export type OutcomeTracker = {
  outcomeType: Outcome;
  outcomeMessage: string;
  jsonFormattedString?: string;
  jsonRawData?: any;
  operationData?: any;
};
export enum Outcome {
  NONE,
  WARNING,
  FAIL,
  SUCCESS,
  INFO
}
