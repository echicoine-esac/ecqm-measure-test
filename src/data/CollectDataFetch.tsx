import { Constants } from '../constants/Constants';
import { Patient } from '../models/Patient';
import { PatientGroup } from '../models/PatientGroup';
import { Server } from '../models/Server';
import { JsonUtils } from '../utils/JsonUtils';
import { OutcomeTrackerUtils } from '../utils/OutcomeTrackerUtils';
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
        useSubject: boolean,
        selectedPatient?: Patient,
        patientGroup?: PatientGroup | undefined
    ) {

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
        this.useSubject = useSubject;

        if (selectedPatient) this.selectedPatient = selectedPatient;
        if (patientGroup) this.patientGroup = patientGroup;

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
        return OutcomeTrackerUtils.buildOutcomeTracker(
            JsonUtils.makeJsonDataSubmittable(data), 
            'Collect Data', 
            this.selectedDataRepo?.baseUrl);
    }

    
}