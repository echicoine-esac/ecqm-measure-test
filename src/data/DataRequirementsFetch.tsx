import { Constants } from '../constants/Constants';
import { StringUtils } from '../utils/StringUtils';
import { AbstractDataFetch, FetchType } from './AbstractDataFetch';
import { Server } from '../models/Server';
import { OutcomeTrackerUtils } from '../utils/OutcomeTrackerUtils';

export class DataRequirementsFetch extends AbstractDataFetch {
    type: FetchType;

    selectedKnowledgeRepo: Server | undefined;
    selectedMeasure: string = '';
    startDate: string = '';
    endDate: string = '';

    constructor(selectedKnowledgeRepo: Server | undefined,
        selectedMeasure: string,
        startDate: string,
        endDate: string) {

        super(selectedKnowledgeRepo);

        this.type = FetchType.DATA_REQUIREMENTS;

        if (!selectedKnowledgeRepo) {
            throw new Error(StringUtils.format(Constants.missingProperty, 'selectedKnowledgeRepo'));
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

        if (selectedKnowledgeRepo) this.selectedKnowledgeRepo = selectedKnowledgeRepo;
        if (selectedMeasure) this.selectedMeasure = selectedMeasure;
        if (startDate) this.startDate = startDate;
        if (endDate) this.endDate = endDate;
    }

    public getUrl(): string {
        return this.selectedKnowledgeRepo?.baseUrl + 'Measure/' + this.selectedMeasure +
            '/$data-requirements?periodStart=' + this.startDate + '&periodEnd=' + this.endDate;
    }

    protected processReturnedData(data: any) {
        return OutcomeTrackerUtils.buildOutcomeTracker(
            data,
            'Data Requirements',
            this.selectedBaseServer);
    }

}