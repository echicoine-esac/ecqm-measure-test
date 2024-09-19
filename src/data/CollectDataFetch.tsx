import { Constants } from '../constants/Constants';
import { Patient } from '../models/Patient';
import { PatientGroup } from '../models/PatientGroup';
import { Server } from '../models/Server';
import { StringUtils } from '../utils/StringUtils';
import { AbstractDataFetch, FetchType } from './AbstractDataFetch';

export class CollectDataFetch extends AbstractDataFetch {
    type: FetchType;

    selectedDataRepo: Server | undefined;
    selectedMeasure: string = '';
    startDate: string = '';
    endDate: string = '';
    selectedPatient: Patient | undefined;
    patientGroup: PatientGroup | undefined;
    useSubject: boolean = false;

    constructor(selectedDataRepo: Server | undefined,
        selectedMeasure: string,
        startDate: string,
        endDate: string,
        selectedPatient?: Patient,
        patientGroup?: PatientGroup | undefined,
        useSubject?: boolean) {

        super();
        this.type = FetchType.COLLECT_DATA;

        if (!selectedDataRepo || selectedDataRepo.baseUrl === '') {
            throw new Error(StringUtils.format(Constants.missingProperty, 'selectedDataRepo'));
        }

        if (!selectedMeasure || selectedMeasure === '') {
            throw new Error(StringUtils.format(Constants.missingProperty, 'selectedMeasure'));
        }

        if (!startDate || startDate === '') {
            throw new Error(StringUtils.format(Constants.missingProperty, 'startDate'));
        }

        if (!endDate || endDate === '') {
            throw new Error(StringUtils.format(Constants.missingProperty, 'endDate'));
        }

        if (useSubject) {
            if (!selectedPatient || selectedPatient.id === '') {
                if (!patientGroup || patientGroup.id === '') {
                    throw new Error(StringUtils.format(Constants.missingProperty, 'Patient or Group'));
                }
            }
        }

        this.selectedDataRepo = selectedDataRepo;
        this.selectedMeasure = selectedMeasure;
        this.startDate = startDate;
        this.endDate = endDate;
        if (selectedPatient) this.selectedPatient = selectedPatient;
        if (patientGroup) this.patientGroup = patientGroup;
        if (useSubject) this.useSubject = useSubject;

    }

    public getUrl(): string {

        let subject = '';
        if (this.useSubject) {
            if (this.selectedPatient?.id) {
                subject = 'Patient/' + this.selectedPatient.id;
            } else if (this.patientGroup) {
                subject = 'Group/' + this.patientGroup.id;
            }
            return StringUtils.format(Constants.collectDataWithSubjectFetchURL,
                this.selectedDataRepo?.baseUrl,
                this.selectedMeasure,
                this.startDate,
                this.endDate,
                subject
            );
        }

        //useSubject not true, return url without subject line
        return StringUtils.format(Constants.collectDataWithSubjectFetchURL.replace('&subject={4}', ''),
            this.selectedDataRepo?.baseUrl,
            this.selectedMeasure,
            this.startDate,
            this.endDate
        );

    }

    protected processReturnedData(data: any) {
        try {
            const ret: string = JSON.stringify(data, undefined, 2)
            return ret;
        } catch (error: any) {
            return data;
        }
    }

}