import { Constants } from "../constants/Constants";
import { BundleEntry } from "../models/BundleEntry";
import { AbstractDataFetch, FetchType } from "./AbstractDataFetch";


export class PatientFetch extends AbstractDataFetch {

    type: FetchType;
    url: string = '';

    constructor(url: string) {
        super();
        this.type = FetchType.PATIENT;
        this.url = url;
    }

    public getUrl(): string {
        return this.url + Constants.patientUrlEnding;
    }

    protected processReturnedData(data: any) {
        let entries = data.entry;
        let ids = entries.map((entry: BundleEntry) => {
            return entry.resource.id
        });
        return ids;
    }

}