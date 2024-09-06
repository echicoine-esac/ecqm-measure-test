import { Constants } from '../constants/Constants';
import { Patient } from '../models/Patient';
import { Server } from '../models/Server';
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

        super();
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
        return StringUtils.format(Constants.measureReportFetchURL_byMeasure,
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

        let x = data.entry?.filter((entry: any) => {
            const entryStartDate = new Date(entry.resource.period?.start);
            const entryEndDate = new Date(entry.resource.period?.end);
            const filterStartDate = new Date(this.startDate);
            const filterEndDate = new Date(this.endDate);

            // // Log each entry's start and end dates
            // console.log("Entry Start Date:", entry.resource.period?.start);
            // console.log("Entry End Date:", entry.resource.period?.end);
            // console.log("Filter Start Date:", this.startDate);
            // console.log("Filter End Date:", this.endDate);

            const dateCondition = (entryStartDate >= filterStartDate) &&
                (entryEndDate <= filterEndDate);

            // // Log the result of the date condition check
            // console.log("Date condition result:", dateCondition);

            return dateCondition;
        });

        // console.log(x);
        return x;
         
    }
}
