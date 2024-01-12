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

    public getUrl(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let urlString: string = this.url + Constants.patientUrlEnding + '200';

            this.getPatientTotalCount(this.url)
                .then((result: number) => {
                    console.log('Total patient count at ' + this.url + ': ' + result);
                    if (result === 0) {
                        urlString = this.url + Constants.patientUrlEnding + '200';
                    } else {
                        urlString = this.url + Constants.patientUrlEnding + result;
                    }
                    console.log('PatientFetch getUrl(): ' + urlString);
                    resolve(urlString);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    private async getPatientTotalCount(url: string): Promise<number> {
        let patientCount = 0;
        await fetch(url + "/Patient?_summary=count", this.requestOptions)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                patientCount = data?.total;
            })
        return patientCount;
    }

    protected processReturnedData(data: any) {
        let patients: Patient[];

        if (this.isGroup(data)) {
            patients = this.processAsGroup(data);
        } else {
            let entries = data.entry;
            patients = entries.map((entry: BundleEntry) => {
                return { display: entry.resource.name[0].given[0] + ' ' + entry.resource.name[0].family, id: entry.resource.id };
            });
        }

        return patients.sort((a, b) => {
            const patientA = PatientFetch.buildUniquePatientIdentifier(a) + '';
            const patientB = PatientFetch.buildUniquePatientIdentifier(b) + '';
            return patientA.localeCompare(patientB);
        });
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
                if (member.entity?.display) {
                    result.push({ display: member.entity.display, id: member.entity.reference.split("Patient/")[1] });
                }
            });
        }

        return result;
    }

    public static buildUniquePatientIdentifier(patient: Patient | undefined) {
        if (patient) {
            if (patient.id?.length >= 6) {
                return patient.display + " - " + patient.id.substring(0, 6) + "...";
            } else {
                return patient.display + " - " + patient.id;
            }
        }
    };

}
