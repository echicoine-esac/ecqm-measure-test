import { Constants } from '../constants/Constants';
import { Patient } from '../models/Patient';
import { Server } from '../models/Server';
import { OutcomeTrackerUtils } from '../utils/OutcomeTrackerUtils';
import { StringUtils } from '../utils/StringUtils';
import { AbstractDataFetch, FetchType } from './AbstractDataFetch';

export class MeasureReportFetch extends AbstractDataFetch {
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

        super(selectedServer);

        this.type = FetchType.MEASURE_REPORT;

        if (!selectedServer || selectedServer.baseUrl === '') {
            throw new Error(StringUtils.format(Constants.missingProperty, 'selectedServer'));
        }

        if (!selectedServer || selectedServer.baseUrl === '') {
            throw new Error(StringUtils.format(Constants.missingProperty, 'selectedPatient'));
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
        return StringUtils.format(Constants.fetch_measureReportByMeasure,
            this.selectedServer?.baseUrl,
            this.selectedPatient?.id,
            this.selectedMeasure);
    }

    /**
     * Filter the report to narrow it down by start/end date 
     * @param data 
     * @returns 
     */
    protected processReturnedData(data: any) {

        const optionalData = data.entry?.filter((entry: any) => {
            const entryStartDate = new Date(entry.resource.period?.start);
            const entryEndDate = new Date(entry.resource.period?.end);
            const filterStartDate = new Date(this.startDate);
            const filterEndDate = new Date(this.endDate);

            const dateCondition = (entryStartDate >= filterStartDate) &&
                (entryEndDate <= filterEndDate);

            return dateCondition;
        });

        return OutcomeTrackerUtils.buildOutcomeTracker(
            this.getUrl(),
            data,
            'MeasureReport Fetch',
            this.selectedBaseServer,
            optionalData
        );
    }
}
