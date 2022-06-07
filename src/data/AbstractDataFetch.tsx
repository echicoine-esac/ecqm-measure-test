import { Constants } from "../constants/Constants";
import { StringUtils } from "../utils/StringUtils";

export enum FetchType {
    DEFAULT = "",
    PATIENT = "Patients",
    MEASURE = "Measures",
    EVALUATE_MEASURE = "Evaluate Measure",
    DATA_REQUIREMENTS = "Data Requirements",
    COLLECT_DATA = "Collect Data",
    SUBMIT_DATA = "Submit Data"
};

export abstract class AbstractDataFetch {
    type: FetchType = FetchType.DEFAULT;

    abstract getUrl(): string;
    protected abstract processReturnedData(data: any): any;

    fetchData = async (): Promise<any> => {
        let ret: any;
        await fetch(this.getUrl())
            .then((response) => {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json()
            })
            .then((data) => {
                ret = this.processReturnedData(data);
            })
            .catch((error) => {
                let message = StringUtils.format(Constants.fetchError,
                    this.getUrl(), this.type, error);
                throw new Error(message);
            })
        return ret;
    };
}


