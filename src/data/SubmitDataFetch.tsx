import { Constants } from "../constants/Constants";
import { StringUtils } from "../utils/StringUtils";
import { AbstractDataFetch, FetchType } from "./AbstractDataFetch";

export class SubmitDataFetch extends AbstractDataFetch {
    type: FetchType;

    selectedReceiving: string = '';
    selectedMeasure: string = '';
    collectedData: string = '';

    constructor(selectedReceiving: string,
        selectedMeasure: string,
        collectedData: string) {

        super();
        this.type = FetchType.SUBMIT_DATA;

        if (!selectedReceiving || selectedReceiving === '') {
            throw new Error(Constants.appDataMissingSelectedServer);
        }

        if (!selectedMeasure || selectedMeasure === '') {
            throw new Error(Constants.appDataMissingSelectedMeasure);
        }

        if (!collectedData || collectedData === '') {
            throw new Error(Constants.appDataMissingStartDate);
        }

        this.selectedReceiving = selectedReceiving;
        this.selectedMeasure = selectedMeasure;
        this.collectedData = collectedData;
    }

    public getUrl(): string {
        return this.selectedReceiving + 'Measure/' + this.selectedMeasure + '/$submit-data';
    }

    protected processReturnedData(data: any) {
        return '';
    }

    submitData = async (): Promise<string> => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/fhir+json' },
            body: JSON.stringify(this.collectedData)
        };

        let ret = '';

        // Call the FHIR server to submit the data
        await fetch(this.getUrl(), requestOptions)
            .then((response) => {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json()
            })
            .then((data) => {
                ret = Constants.dataSubmitted;
            })
            .catch((error) => {
                let message = StringUtils.format(Constants.fetchError,
                    this.getUrl(), this.type, error);
                throw new Error(message);
            });
        return ret;
    }
}


