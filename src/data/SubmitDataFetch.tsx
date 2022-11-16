import { Constants } from '../constants/Constants';
import { StringUtils } from '../utils/StringUtils';
import { Server } from '../models/Server';
import { AbstractDataFetch, FetchType } from './AbstractDataFetch';

export class SubmitDataFetch extends AbstractDataFetch {
    type: FetchType;

    selectedReceiving: Server | undefined;
    selectedMeasure: string = '';
    collectedData: string = '';

    constructor(selectedReceiving: Server | undefined,
        selectedMeasure: string,
        collectedData: string) {

        super();
        this.type = FetchType.SUBMIT_DATA;

        if (!selectedReceiving || selectedReceiving.baseUrl === '') {
            throw new Error(StringUtils.format(Constants.missingProperty, 'selectedReceiving'));
        }

        if (!selectedMeasure || selectedMeasure === '') {
            throw new Error(StringUtils.format(Constants.missingProperty, 'selectedMeasure'));
        }

        if (!collectedData || collectedData === '') {
            throw new Error(StringUtils.format(Constants.missingProperty, 'collectedData'));
        }

        this.selectedReceiving = selectedReceiving;
        this.selectedMeasure = selectedMeasure;
        this.collectedData = collectedData;
    }

    public getUrl(): string {
        return this.selectedReceiving?.baseUrl + 'Measure/' + this.selectedMeasure + '/$submit-data';
    }

    protected processReturnedData(data: any) {
        return Constants.dataSubmitted;
    }

    submitData = async (token: string): Promise<string> => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/fhir+json',
                "Authorization": `Bearer ${token}`},
            body: this.collectedData
        };

        let ret = '';

        // Call the FHIR server to submit the data
        let responseStatusText = '';

        await fetch(this.getUrl(), requestOptions)
            .then((response) => {
                responseStatusText = response?.statusText;
                return response.json()
            })
            .then((data) => {
                ret = this.processReturnedData(data);
            })
            .catch((error) => {
                let message = StringUtils.format(Constants.fetchError, this.getUrl(), this.type, error);
                if (responseStatusText.length > 0 && responseStatusText !== 'OK' ){
                    message = StringUtils.format(Constants.fetchError, this.getUrl(), this.type, responseStatusText);
                }
                throw new Error(message);
            });
        return ret;
    }

    fetchData = async (): Promise<string> => {
        return Constants.submitDataFetchDataError;
    }
}


