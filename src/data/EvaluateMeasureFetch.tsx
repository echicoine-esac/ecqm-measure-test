import { Constants } from '../constants/Constants';
import { Outcome, OutcomeTracker } from '../models/OutcomeTracker';
import { Patient } from '../models/Patient';
import { PatientGroup } from '../models/PatientGroup';
import { GroupElement } from '../models/Scoring';
import { Server } from '../models/Server';
import { OutcomeTrackerUtils } from '../utils/OutcomeTrackerUtils';
import { StringUtils } from '../utils/StringUtils';
import { AbstractDataFetch, FetchType } from './AbstractDataFetch';

export class EvaluateMeasureFetch extends AbstractDataFetch {
    type: FetchType;

    selectedMeasureEvaluationServer: Server | undefined;
    selectedPatient: Patient | undefined;
    selectedMeasure: string = '';
    startDate: string = '';
    endDate: string = '';
    patientGroup: PatientGroup | undefined;
    useSubject: boolean = false;

    constructor(selectedMeasureEvaluationServer: Server | undefined,
        selectedMeasure: string,
        startDate: string,
        endDate: string,
        useSubject: boolean,
        selectedPatient?: Patient,
        patientGroup?: PatientGroup | undefined,
    ) {

        super();
        this.type = FetchType.EVALUATE_MEASURE;

        if (!selectedMeasureEvaluationServer || selectedMeasureEvaluationServer.baseUrl === '') {
            throw new Error(StringUtils.format(Constants.missingProperty, 'selectedServer'));
        }

        if (!selectedMeasure) {
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

        this.selectedMeasureEvaluationServer = selectedMeasureEvaluationServer;
        this.selectedMeasure = selectedMeasure;
        this.startDate = startDate;
        this.endDate = endDate;
        this.useSubject = useSubject;

        if (patientGroup) this.patientGroup = patientGroup;
        if (selectedPatient) this.selectedPatient = selectedPatient;

    }



    public getUrl(): string {

        let subject = '';
        if (this.useSubject) {
            if (this.selectedPatient?.id) {
                subject = 'Patient/' + this.selectedPatient.id;
            } else if (this.patientGroup) {
                subject = 'Group/' + this.patientGroup.id;
            }
            return StringUtils.format(Constants.evaluateMeasureWithSubjectFetchURL,
                this.selectedMeasureEvaluationServer?.baseUrl,
                this.selectedMeasure,
                this.startDate,
                this.endDate,
                subject
            );
        }

        //useSubject not true, return url without subject line
        return StringUtils.format(Constants.evaluateMeasureWithSubjectFetchURL.replace('&subject={4}', ''),
            this.selectedMeasureEvaluationServer?.baseUrl,
            this.selectedMeasure,
            this.startDate,
            this.endDate
        );

    }

    protected processReturnedData(data: any): OutcomeTracker {
        const measureGroups = Array.isArray(data?.group) ? data.group : undefined;
        return OutcomeTrackerUtils.buildOutcomeTracker(data, 'Measure Evaluation', this.selectedMeasureEvaluationServer?.baseUrl, measureGroups);
    }

}
