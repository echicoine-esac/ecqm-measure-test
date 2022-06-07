import { Constants } from "../constants/Constants";
import { AbstractDataFetch, FetchType } from "./AbstractDataFetch";

export class CollectDataFetch extends AbstractDataFetch {
    type: FetchType;

    selectedDataRepo: string = '';
    selectedMeasure: string = '';
    startDate: string = '';
    endDate: string = '';
    selectedPatient: string = '';

    constructor(selectedDataRepo: string,
        selectedMeasure: string,
        startDate: string,
        endDate: string,
        selectedPatient: string) {

        super();
        this.type = FetchType.COLLECT_DATA;

        if (!selectedDataRepo || selectedDataRepo === '') {
            throw new Error(Constants.appDataMissingSelectedServer);
        }

        if (!selectedMeasure || selectedMeasure === '') {
            throw new Error(Constants.appDataMissingSelectedMeasure);
        }

        if (!startDate || startDate === '') {
            throw new Error(Constants.appDataMissingStartDate);
        }

        if (!endDate || endDate === '') {
            throw new Error(Constants.appDataMissingEndDate);
        }

        this.selectedDataRepo = selectedDataRepo;
        this.selectedMeasure = selectedMeasure;
        this.startDate = startDate;
        this.endDate = endDate;
        this.selectedPatient = selectedPatient;
    }

    public getUrl(): string {
        let ret = this.selectedDataRepo + 'Measure/' + this.selectedMeasure +
            '/$collect-data?periodStart=' + this.startDate + '&periodEnd=' + this.endDate;

        if (this.selectedPatient !== '') {
            ret = ret + '&subject=' + this.selectedPatient;
        }
        return ret;
    }

    protected processReturnedData(data: any) {
        const ret: string = JSON.stringify(data, undefined, 2)
        return ret;
    }

}