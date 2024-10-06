import { Constants } from '../constants/Constants';
import { BundleEntry } from '../models/BundleEntry';
import { Patient } from '../models/Patient';
import { OutcomeTrackerUtils } from '../utils/OutcomeTrackerUtils';
import { PatientGroupUtils } from '../utils/PatientGroupUtils';
import { StringUtils } from '../utils/StringUtils';
import { AbstractDataFetch, FetchType } from './AbstractDataFetch';


export class PatientFetch extends AbstractDataFetch {

    type: FetchType;
    url: string = '';

    totalPatients: number = 5;

    private constructor(url: string) {
        super();

        if (!url || url === '') {
            throw new Error(StringUtils.format(Constants.missingProperty, 'url'));
        }

        this.type = FetchType.PATIENT;
        this.url = url;
    }

    // Use this static method to create an instance and wait for totalPatients to be populated
    public static async createInstance(url: string): Promise<PatientFetch> {
        const instance = new PatientFetch(url);
        await instance.initializeTotalPatients(url);
        return instance;
    }

    private async initializeTotalPatients(url: string): Promise<void> {
        // Wait for the fetch call to finish
        this.totalPatients = await this.getPatientTotalCount(url);
    }

    public getUrl(): string {
        return this.url + Constants.fetch_patients + this.totalPatients;
    }

    private async getPatientTotalCount(url: string): Promise<number> {
        let patientCount = 0;
        await fetch(url + Constants.fetch_patientTotalCount, this.requestOptions)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                patientCount = data?.total;
            })
        return patientCount;
    }

    protected processReturnedData(data: any) {
        let patients: Patient[] = [];
        if (Array.isArray(data?.entry) && data?.entry?.length > 0) {

            for (const entry of data.entry) {
                const displayName = this.getDisplayName(entry);

                if (displayName.length > 0 && entry?.resource?.id) {
                    patients.push({
                        display: displayName,
                        id: entry.resource.id,
                    });
                }
            }

            patients.sort((a, b) => {
                const patientA = PatientGroupUtils.buildUniquePatientIdentifier(a) + '';
                const patientB = PatientGroupUtils.buildUniquePatientIdentifier(b) + '';
                return patientA.localeCompare(patientB);
            });

        }
        return OutcomeTrackerUtils.buildOutcomeTracker(data, 'Patient Fetch', this.url,
            patients
        );
    }

    protected getDisplayName(entry: BundleEntry) {
        if (!entry) return '';

        let firstName = '';
        let lastName = '';

        if (Array.isArray(entry?.resource?.name) && entry.resource.name.length > 0) {
            if (entry.resource.name[0]?.given?.length > 0) {
                firstName = entry.resource.name[0].given[0];
            }

            if (entry.resource.name[0]?.family) {
                lastName = entry.resource.name[0].family;
            }
        }

        let displayName = '';
        if (!firstName && !lastName) {
            return '';
        } else if (firstName && lastName) {
            displayName = `${firstName} ${lastName}`;
        } else {
            displayName = firstName || lastName;
        }

        return displayName;
    }

}
