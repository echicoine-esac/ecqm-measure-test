import { Constants } from '../constants/Constants';
import { OperationOutcome } from '../models/OperationOutcome';
import { Outcome, OutcomeTracker } from '../models/OutcomeTracker';


export enum Section {
    REPORTING_PERIOD,
    KNOWLEDGE_REPO,
    DATA_REPO,
    MEASURE_EVAL,
    REC_SYS,
    TEST_COMPARE
}

export class OutcomeTrackerUtils {
    /**
     * Builds an OutcomeTracker given specific data.
     * jsonData can either be the raw data returned from the fetch, or a formatted json string
     * @param jsonData 
     * @param operationName 
     * @param serverUrl 
     * @param optionalData 
     * @returns 
     */
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
                jsonFormattedString: jsonString,
                jsonRawData: data,
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
            return operationName + ' with ' + serverUrl + ' completed successfully:';
        } else if (outcome === Outcome.INFO) {
            return operationName + ' with ' + serverUrl + ':';
        } else if (outcome === Outcome.WARNING) {
            return operationName + ' with ' + serverUrl + ' had warning(s):';
        } else if (outcome === Outcome.FAIL) {
            return operationName + ' with ' + serverUrl + ' returned with error(s):';
        }
        return '';
    }

    private static getOutcome(data: any): Outcome {
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

                if (outcome !== Outcome.SUCCESS) {
                    break;
                }
            }
        }

        return outcome;
    }

}