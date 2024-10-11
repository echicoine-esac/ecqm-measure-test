import { Constants } from '../constants/Constants';
import { Outcome, OutcomeTracker } from '../models/OutcomeTracker';
import { Server } from '../models/Server';
import { OutcomeTrackerUtils } from '../utils/OutcomeTrackerUtils';
import { StringUtils } from '../utils/StringUtils';
import { AbstractDataFetch, FetchType } from './AbstractDataFetch';

export class PostMeasureReportFetch extends AbstractDataFetch {
    type: FetchType;

    selectedReceiving: Server | undefined;
    measureReport: string = '';

    constructor(selectedReceiving: Server | undefined,
        measureReport: string) {

        super(selectedReceiving);

        this.type = FetchType.POST_MEASURE;

        if (!selectedReceiving || selectedReceiving.baseUrl === '') {
            throw new Error(StringUtils.format(Constants.missingProperty, 'selectedReceiving'));
        }

        if (!measureReport || measureReport === '') {
            throw new Error(StringUtils.format(Constants.missingProperty, 'measureReport'));
        }

        this.selectedBaseServer = selectedReceiving;

        this.selectedReceiving = selectedReceiving;
        this.measureReport = measureReport;
    }

    public getUrl(): string {
        return this.selectedReceiving?.baseUrl + 'MeasureReport/';
    }

    protected processReturnedData(data: any) {
        return OutcomeTrackerUtils.buildOutcomeTracker(
            data,
            'Post Measure Report',
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
                "Authorization": `Bearer ${this.getAccessToken()}`
            },
            body: this.measureReport
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
        }
    }
}