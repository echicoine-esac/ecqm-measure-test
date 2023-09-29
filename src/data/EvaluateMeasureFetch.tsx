import { Constants } from '../constants/Constants';
import { MeasureData } from '../models/MeasureData';
import { MeasureReport } from '../models/MeasureReport';
import { MeasureReportGroup } from '../models/MeasureReportGroup';
import { Population } from '../models/Population';
import { StringUtils } from '../utils/StringUtils';
import { AbstractDataFetch, FetchType } from './AbstractDataFetch';
import {Server} from '../models/Server';

export class EvaluateMeasureFetch extends AbstractDataFetch {
    type: FetchType;

    selectedServer: Server | undefined;
    selectedPatient: string = '';
    selectedMeasure: string = '';
    startDate: string = '';
    endDate: string = '';

    constructor(selectedServer: Server | undefined,
        selectedPatient: string,
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
        if (selectedPatient) this.selectedPatient =  StringUtils.getPatId(selectedPatient);
        if (selectedMeasure) this.selectedMeasure = selectedMeasure;
        if (startDate) this.startDate = startDate;
        if (endDate) this.endDate = endDate;
    }

    public getUrl(): string {
        if (this.selectedPatient === '') {
            return StringUtils.format(Constants.evaluateMeasureFetchURL,
                this.selectedServer?.baseUrl, this.selectedMeasure,
                this.startDate, this.endDate);
        } else {
            return StringUtils.format(Constants.evaluateMeasureWithPatientFetchURL,
                this.selectedServer?.baseUrl, this.selectedMeasure,
                this.selectedPatient, this.startDate, this.endDate);
        }
    }

    protected processReturnedData(data: any) {
        const jsonData = data;

        // Handle the error condition where we get an OperationOutcome response
        if (jsonData.resourceType === 'OperationOutcome') {
            return jsonData;
        }

        let report: MeasureReport = data;
        let groups = report.group;
        let populations = groups.map((group: MeasureReportGroup) => {
            return group.population;
        });
        let pop = populations[0];
        let popNames = pop.map((pop: Population) => {
            return pop.code.coding[0].code;
        });
        let counts = pop.map((pop: Population) => {
            return pop.count;
        });

        const popNamesData = popNames;
        const countsData = counts;

        let measureData: MeasureData = {
            jsonBody: jsonData,
            popNames: popNamesData,
            counts: countsData
        }
        return measureData;
    }

}
 