import { Constants } from '../constants/Constants';
import { Patient } from '../models/Patient';
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

    constructor(selectedServer: Server | undefined,
        selectedPatient: Patient | undefined,
        selectedMeasure: string,
        startDate: string,
        endDate: string) {

        super();
        this.type = FetchType.EVALUATE_MEASURE;

        if (!selectedServer || selectedServer.baseUrl === '') {
            throw new Error(StringUtils.format(Constants.missingProperty, 'selectedServer'));
        }

        if (selectedMeasure === '') {
            throw new Error(StringUtils.format(Constants.missingProperty, 'selectedMeasure'));
        }

        if (!startDate || startDate === '') {
            throw new Error(StringUtils.format(Constants.missingProperty, 'startDate'));
        }

        if (!endDate || endDate === '') {
            throw new Error(StringUtils.format(Constants.missingProperty, 'endDate'));
        }

        if (selectedServer) this.selectedServer = selectedServer;
        if (selectedPatient) this.selectedPatient = selectedPatient;
        if (selectedMeasure) this.selectedMeasure = selectedMeasure;
        if (startDate) this.startDate = startDate;
        if (endDate) this.endDate = endDate;
    }

    public getUrl(): string {
        if (this.selectedPatient?.id) {
            return StringUtils.format(Constants.evaluateMeasureWithPatientFetchURL,
                this.selectedServer?.baseUrl, this.selectedMeasure,
                this.selectedPatient.id, this.startDate, this.endDate);
        } else {
            return StringUtils.format(Constants.evaluateMeasureFetchURL,
                this.selectedServer?.baseUrl, this.selectedMeasure,
                this.startDate, this.endDate);
        }
    }

    protected processReturnedData(data: any) {
        let measureData: EvaluateMeasureResult = {
            jsonBody: data,
            measureGroups: data.group
        }
        return measureData;
    }

}
