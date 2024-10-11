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


        super(selectedMeasureEvaluation);

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
            this.selectedBaseServer);
    }

    submitData = async (): Promise<OutcomeTracker> => {

        //handle the OAuth flow if the selectedBaseServer has an authUrl:
        if (this.selectedBaseServer?.authUrl && this.selectedBaseServer?.authUrl.length > 0) {
            if (!await this.handleOAuth(this.selectedBaseServer)) {
                throw new Error('Authorization process for ' + this.selectedBaseServer.baseUrl + ' did not complete successfully.');
            }
        }

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/fhir+json',
                'Authorization': `Bearer ${this.getAccessToken()}`,
            },
            body: this.collectedData
        };

        let ret: any;

        // Call the FHIR server to submit the data
        let responseStatusText = '';

        await fetch(this.getUrl(), requestOptions)
            .then(response => this.handleResponse(response))  // Handle the response
            .then(response => response.json())                // Parse JSON after handling
            .then(data => {
                ret = this.processReturnedData(data);
            })
            .catch((error) => {
                let message = StringUtils.format(Constants.fetchError, this.getUrl(), this.type, error);
                if (responseStatusText.length > 0 && responseStatusText !== 'OK') {
                    message = StringUtils.format(Constants.fetchError, this.getUrl(), this.type, responseStatusText);
                }
                throw new Error(message);
            });

        return ret;
    }

    fetchData = async (): Promise<OutcomeTracker> => {
        return {
            outcomeMessage: Constants.functionNotImplemented,
            outcomeType: Outcome.NONE
        };
    }

}


