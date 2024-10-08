import { Constants } from '../constants/Constants';
import { OutcomeTracker } from '../models/OutcomeTracker';
import { Section } from '../utils/OutcomeTrackerUtils';
import { StringUtils } from '../utils/StringUtils';

export enum FetchType {
    DEFAULT = '',
    PATIENT = 'Patients',
    MEASURE = 'Measures',
    EVALUATE_MEASURE = 'Evaluate Measure',
    DATA_REQUIREMENTS = 'Data Requirements',
    COLLECT_DATA = 'Collect Data',
    SUBMIT_DATA = 'Submit Data',
    POST_MEASURE = 'Post Measure Report',
    MEASURE_REPORT = 'Measure Report',
    GROUP = 'Group'
};

export abstract class AbstractDataFetch {
    type: FetchType = FetchType.DEFAULT;
    requestOptions: any;

    abstract getUrl(): string;
    protected abstract processReturnedData(data: any): OutcomeTracker;

    fetchData = async (token: string, setSectionalResults?: CallableFunction, section?: Section): Promise<OutcomeTracker> => {

        //let the user know as much as we can about the fetch:
        if (setSectionalResults && section) {
            setSectionalResults(Constants.preFetchMessage + this.getUrl(), section);
        }

        let ret: any;

        // Add any token provided to the header
        this.requestOptions = {
            headers: { "Authorization": `Bearer ${token}` }
        };


        let responseStatusText = '';

        await fetch(this.getUrl(), this.requestOptions)
            .then((response) => {
                if (response?.status === 504) {
                    throw new Error('504 (Gateway Timeout)')
                }

                responseStatusText = response?.statusText;
                return response.json();
            })
            .then((data) => {
                ret = this.processReturnedData(data);
            })
            .catch((error) => {
                let message = StringUtils.format(Constants.fetchError, this.getUrl(), this.type, error);
                if (responseStatusText.length > 0 && responseStatusText !== 'OK') {
                    message = StringUtils.format(Constants.fetchError, this.getUrl(), this.type, responseStatusText);
                }
                throw new Error(message);
            })


        //reset output:
        if (setSectionalResults) {
            setSectionalResults('', section)
        }

        return ret;
    };

}


