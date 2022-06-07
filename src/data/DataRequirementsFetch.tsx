import { Constants } from "../constants/Constants";
import { AbstractDataFetch, FetchType } from "./AbstractDataFetch";

export class DataRequirementsFetch extends AbstractDataFetch {
    type: FetchType;

    selectedKnowledgeRepo: string = '';
    selectedMeasure: string = '';
    startDate: string = '';
    endDate: string = '';

    constructor(selectedKnowledgeRepo: string,
        selectedMeasure: string,
        startDate: string,
        endDate: string) {

        super();
        this.type = FetchType.DATA_REQUIREMENTS;

        if (!selectedKnowledgeRepo || selectedKnowledgeRepo === '') {
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

        if (selectedKnowledgeRepo) this.selectedKnowledgeRepo = selectedKnowledgeRepo;
        if (selectedMeasure) this.selectedMeasure = selectedMeasure;
        if (startDate) this.startDate = startDate;
        if (endDate) this.endDate = endDate;
    }

    public getUrl(): string {
        return this.selectedKnowledgeRepo + 'Measure/' + this.selectedMeasure +
        '/$data-requirements?periodStart=' + this.startDate + '&periodEnd=' + this.endDate;
    }

    protected processReturnedData(data: any) {
        const ret: string = JSON.stringify(data, undefined, 2)
        return ret;
    }

}