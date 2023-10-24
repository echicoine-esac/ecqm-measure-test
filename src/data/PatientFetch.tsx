import { Constants } from '../constants/Constants';
import { BundleEntry } from '../models/BundleEntry';
import { Patient } from '../models/Patient';
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
        if (this.isGroup(data)) {
            return this.processAsGroup(data);
        } else {
            let entries = data.entry;
            let ids = entries.map((entry: BundleEntry) => {
                return { display: entry.resource.name[0].given[0] + ' ' + entry.resource.name[0].family, id: entry.resource.id };
            });
            return ids;
        }
    }

    protected isGroup(data: any): boolean {
        if (data && data.resourceType === "Group") {
            return true;
        }
        return false;
    }

    protected processAsGroup(data: any): Patient[] {
        const result: Patient[] = [];

        if (data && data.resourceType === "Group" && Array.isArray(data.member)) {
            data.member.forEach((member: { entity: { display: any; reference: string; }; }) => {
                if (member.entity && member.entity.display) {
                    result.push({ display: member.entity.display, id: member.entity.reference.split("Patient/")[1] });
                }
            });
        }

        return result;
    }


}
