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
                responseStatusText = response?.statusText;
                return response.json()
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
            outcomeMessage: 'This function has not been implemented into PostMeasureReportFetch.  Use submitData instead.',
            outcomeType: Outcome.NONE
        }
    }
}


