import { Constants } from '../constants/Constants';
import { Outcome, OutcomeTracker } from '../models/OutcomeTracker';
import { Server } from '../models/Server';
import { OutcomeTrackerUtils } from '../utils/OutcomeTrackerUtils';
import { StringUtils } from '../utils/StringUtils';
import { AbstractDataFetch, FetchType } from './AbstractDataFetch';

export class SubmitDataFetch extends AbstractDataFetch {
    type: FetchType;

    selectedMeasureEvaluation: Server | undefined;
    selectedMeasure: string = '';
    collectedData: string = '';

    constructor(selectedMeasureEvaluation: Server | undefined,
        selectedMeasure: string,
        collectedData: string) {


        super();
        this.type = FetchType.SUBMIT_DATA;

        if (!selectedMeasureEvaluation || selectedMeasureEvaluation.baseUrl === '') {
            throw new Error(StringUtils.format(Constants.missingProperty, 'selectedMeasureEvaluation'));
        }

        if (!selectedMeasure || selectedMeasure === '') {
            throw new Error(StringUtils.format(Constants.missingProperty, 'selectedMeasure'));
        }

        if (!collectedData || collectedData === '') {
            throw new Error(StringUtils.format(Constants.missingProperty, 'collectedData'));
        }

        this.selectedMeasureEvaluation = selectedMeasureEvaluation;
        this.selectedMeasure = selectedMeasure;
        this.collectedData = collectedData;
    }

    public getUrl(): string {
        return this.selectedMeasureEvaluation?.baseUrl + 'Measure/' + this.selectedMeasure + '/$submit-data';
    }

    protected processReturnedData(data: any) {
        return OutcomeTrackerUtils.buildOutcomeTracker(
            data,
            'Submit Data',
            this.selectedMeasureEvaluation?.baseUrl);
    }

    submitData = async (token: string): Promise<OutcomeTracker> => {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/fhir+json',
                'Authorization': `Bearer ${token}`,
            },
            body: this.collectedData
        };

        let ret: any;

        // Call the FHIR server to submit the data
        let responseStatusText = '';

        await fetch(this.getUrl(), requestOptions)
            .then((response) => {
                if (response?.status === 504) {
                    throw new Error('504 (Gateway Timeout)');
                } else if (response?.status >= 200 && response?.status < 300) {
                    responseStatusText = response?.statusText;
                } else if (response?.status === 400) {
                    throw new Error('400 (Bad Request)');
                } else if (response?.status === 401) {
                    throw new Error('401 (Unauthorized)');
                } else if (response?.status === 403) {
                    throw new Error('403 (Forbidden)');
                } else if (response?.status === 404) {
                    throw new Error('404 (Not Found)');
                } else if (response?.status === 500) {
                    throw new Error('500 (Internal Server Error)');
                } else if (response?.status === 503) {
                    throw new Error('503 (Service Unavailable)');
                } else {
                    throw new Error(`${response.status} - Unexpected status encountered`);
                }
                return response.json();
            })
            .then((data) => {
                ret = data;
            })
            .catch((error) => {
                let message = StringUtils.format(Constants.fetchError, this.getUrl(), this.type, error);
                if (responseStatusText.length > 0 && responseStatusText !== 'OK') {
                    message = StringUtils.format(Constants.fetchError, this.getUrl(), this.type, responseStatusText);
                }
                throw new Error(message);
            });
        return this.processReturnedData(ret);
    }

    fetchData = async (): Promise<OutcomeTracker> => {
        return {
            outcomeMessage: Constants.functionNotImplemented,
            outcomeType: Outcome.NONE
        };
    }

}


