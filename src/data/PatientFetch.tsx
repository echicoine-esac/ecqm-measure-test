import { Constants } from '../constants/Constants';
import { BundleEntry } from '../models/BundleEntry';
import { StringUtils } from '../utils/StringUtils';
import { AbstractDataFetch, FetchType } from './AbstractDataFetch';


export class PatientFetch extends AbstractDataFetch {

    type: FetchType;
    url: string = '';

    constructor(url: string) {
        super();

        if (!url || url === '') {
            throw new Error(StringUtils.format(Constants.missingProperty, 'url'));
        }

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