import { Constants } from '../constants/Constants';
import { StringUtils } from '../utils/StringUtils';
import { Server } from '../models/Server';
import { AbstractDataFetch, FetchType } from './AbstractDataFetch';
import { OutcomeTrackerUtils } from '../utils/OutcomeTrackerUtils';
import { Outcome, OutcomeTracker } from '../models/OutcomeTracker';

export class PostMeasureReportFetch extends AbstractDataFetch {
    type: FetchType;

    selectedReceiving: Server | undefined;
    measureReport: string = '';

    constructor(selectedReceiving: Server | undefined,
        measureReport: string) {

        super();
        this.type = FetchType.POST_MEASURE;

        if (!selectedReceiving || selectedReceiving.baseUrl === '') {
            throw new Error(StringUtils.format(Constants.missingProperty, 'selectedReceiving'));
        }

        if (!measureReport || measureReport === '') {
            throw new Error(StringUtils.format(Constants.missingProperty, 'measureReport'));
        }

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
            this.selectedReceiving?.baseUrl);
    }

    submitData = async (token: string): Promise<OutcomeTracker> => {

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/fhir+json',
                "Authorization": `Bearer ${token}`
            },
            body: this.measureReport
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
        }
    }
}


