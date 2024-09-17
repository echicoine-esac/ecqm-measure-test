import { Constants } from '../constants/Constants';
import { Measure } from '../models/Measure';
import { Patient } from '../models/Patient';
import { PatientGroup } from '../models/PatientGroup';
import { GroupElement } from '../models/Scoring';
import { Server } from '../models/Server';
import { StringUtils } from '../utils/StringUtils';
import { AbstractDataFetch, FetchType } from './AbstractDataFetch';

export type EvaluateMeasureResult = {
    jsonBody: string;
    measureGroups?: GroupElement[];
};

export class EvaluateMeasureFetch extends AbstractDataFetch {
    type: FetchType;

    selectedServer: Server | undefined;
    selectedPatient: Patient | undefined;
    selectedMeasure: string = '';
    startDate: string = '';
    endDate: string = '';
    patientGroup: PatientGroup | undefined;
    bypassGroupCheck: boolean = false;

    constructor(selectedServer: Server | undefined,
        selectedPatient: Patient | undefined,
        selectedMeasure: string,
        startDate: string,
        endDate: string,
        patientGroup?: PatientGroup | undefined,
        bypassGroupCheck?: boolean) {

        super();
        this.type = FetchType.EVALUATE_MEASURE;

        if (!selectedServer || selectedServer.baseUrl === '') {
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

        if (!bypassGroupCheck) {
            if (!selectedPatient || selectedPatient.id === '') {
                if (!patientGroup || patientGroup.id === '') {
                    throw new Error(StringUtils.format(Constants.missingProperty, 'Patient or Group'));
                }
            }
        }
        if (selectedServer) this.selectedServer = selectedServer;
        if (selectedPatient) this.selectedPatient = selectedPatient;
        if (selectedMeasure) this.selectedMeasure = selectedMeasure;
        if (startDate) this.startDate = startDate;
        if (endDate) this.endDate = endDate;
        if (patientGroup) this.patientGroup = patientGroup;
        if (bypassGroupCheck) this.bypassGroupCheck = bypassGroupCheck;

    }

    public getUrl(): string {
        // '{0}/Measure/{1}/$evaluate-measure?periodStart={2}&periodEnd={3}&reportType=subject-list';

        let subject = '';
        if (this.selectedPatient?.id) {
            subject = 'Patient/' + this.selectedPatient.id;
        } else if (this.patientGroup) {
            subject = 'Group/' + this.patientGroup.id;
        }

        if (this.bypassGroupCheck && !this.selectedPatient?.id) {
            return StringUtils.format(Constants.evaluateMeasureWithSubjectFetchURL.replace('&subject={4}', ''),
                this.selectedServer?.baseUrl,
                this.selectedMeasure,
                this.startDate,
                this.endDate,
                subject
            );
        }


        return StringUtils.format(Constants.evaluateMeasureWithSubjectFetchURL,
            this.selectedServer?.baseUrl,
            this.selectedMeasure,
            this.startDate,
            this.endDate,
            subject
        );
    }

    protected processReturnedData(data: any) {
        let measureData: EvaluateMeasureResult = {
            jsonBody: data,
            measureGroups: data.group
        }
        return measureData;
    }

}
