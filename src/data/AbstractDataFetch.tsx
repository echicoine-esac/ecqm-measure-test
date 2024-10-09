import { Constants } from '../constants/Constants';
import { Section } from '../enum/Section.enum';
import { OutcomeTracker } from '../models/OutcomeTracker';
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
                try {
                    return this.handleResponse(response);
                } catch (error: any) {
                    throw new Error(error.message);
                }
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



    protected handleResponse(response: Response): any {
        if (response?.status >= Constants.fetch_STATUS_OK && response?.status < 300) {
            return response.json();
        } else if (response?.status === Constants.fetch_STATUS_GATEWAY_TIMEOUT) {
            throw new Error(Constants.fetch_GATEWAY_TIMEOUT);
        } else if (response?.status === Constants.fetch_STATUS_BAD_REQUEST) {
            throw new Error(Constants.fetch_BAD_REQUEST);
        } else if (response?.status === Constants.fetch_STATUS_UNAUTHORIZED) {
            throw new Error(Constants.fetch_UNAUTHORIZED);
        } else if (response?.status === Constants.fetch_STATUS_FORBIDDEN) {
            throw new Error(Constants.fetch_FORBIDDEN);
        } else if (response?.status === Constants.fetch_STATUS_NOT_FOUND) {
            throw new Error(Constants.fetch_NOT_FOUND);
        } else if (response?.status === Constants.fetch_STATUS_INTERNAL_SERVER_ERROR) {
            throw new Error(Constants.fetch_INTERNAL_SERVER_ERROR);
        } else if (response?.status === Constants.fetch_STATUS_SERVICE_UNAVAILABLE) {
            throw new Error(Constants.fetch_SERVICE_UNAVAILABLE);
        } else {
            throw new Error(response.status + ' - ' + Constants.fetch_UNEXPECTED_STATUS);
        }
    }
}


