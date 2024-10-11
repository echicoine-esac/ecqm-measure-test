import { CodeableConcept } from "./CodeableConcept";

export type OperationOutcome = {
    resourceType: 'OperationOutcome';
    issue: OperationOutcomeIssue[];
};

export type OperationOutcomeIssue = {
    severity: 'fatal' | 'error' | 'warning' | 'information';
    code: string;
    details?: CodeableConcept;
    diagnostics?: string;
    location?: string[];
};


