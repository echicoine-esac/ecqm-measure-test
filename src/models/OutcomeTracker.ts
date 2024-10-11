/**
 * Used in processing responses from fhir servers and providing uniform responses types
 * from all fetch classes that extend AbstractDataFetch. 
 * See OutcomeTrackerUtils for processing of OperationOutcome resourceType
 */
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
