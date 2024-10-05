import { Constants } from "../constants/Constants";
import { OperationOutcome } from "../models/OperationOutcome";
import { Outcome, OutcomeTracker } from "../models/OutcomeTracker";

export class OutcomeTrackerUtils {
    public static buildOutcomeTracker(jsonData: any, operationName: string, serverUrl: string | undefined, optionalData?: any): OutcomeTracker {

        try {
            let jsonString = '';

            // Check if jsonData is a string, if so, parse it
            let data = jsonData;
            if (typeof jsonData === 'string') {
                data = JSON.parse(jsonData)
                jsonString = jsonData;
            } else {
                jsonString = JSON.stringify(jsonData, undefined, 2);
            }

            const outcome = OutcomeTrackerUtils.getOutcome(data);

            const operationMessage = OutcomeTrackerUtils.getOutcomeMessage(outcome, operationName, serverUrl);

            return {
                outcomeMessage: operationMessage,
                outcomeType: outcome,
                jsonString: jsonString,
                jsonData: data,
                operationData: optionalData
            }
        } catch (error: any) {
            return {
                outcomeMessage: operationName + ' using ' + serverUrl + ' recieved non-json response.',
                outcomeType: Outcome.FAIL
            }
        }
    }

    private static getOutcomeMessage(outcome: Outcome, operationName: string, serverUrl: string | undefined): string {
        if (outcome === Outcome.SUCCESS) {
            return operationName + ' using ' + serverUrl + ' successfully returned with:';
        } else if (outcome === Outcome.INFO) {
            return operationName + ' using ' + serverUrl + ' returned with:';
        } else if (outcome === Outcome.WARNING) {
            return operationName + ' using ' + serverUrl + ' had a warning:';
        } else if (outcome === Outcome.FAIL) {
            return operationName + ' using ' + serverUrl + ' failed and returned with:';
        }
        return '';
    }

    static getOutcome(data: any): Outcome {
        let outcome = Outcome.SUCCESS;
        //check for OperationOutcome
        if (data?.resourceType?.toString() === Constants.operationOutcomeResourceType) {
            const opOutcome: OperationOutcome = data;
            for (const entry of opOutcome.issue) {
                //'fatal' | 'error' | 'warning' | 'information';
                if (entry.severity === 'fatal' || entry.severity === 'error') {
                    outcome = Outcome.FAIL;
                } else if (entry.severity === 'warning') {
                    outcome = Outcome.WARNING;
                } else if (entry.severity === 'information') {
                    outcome = Outcome.INFO;
                }
            }
        }

        return outcome;
    }

}