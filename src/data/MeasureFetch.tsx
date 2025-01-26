import { Constants } from '../constants/Constants';
import { BundleEntry } from '../models/BundleEntry';
import { Measure } from '../models/Measure';
import { OutcomeTracker } from '../models/OutcomeTracker';
import { Server } from '../models/Server';
import { OutcomeTrackerUtils } from '../utils/OutcomeTrackerUtils';
import { StringUtils } from '../utils/StringUtils';
import { AbstractDataFetch, FetchType } from './AbstractDataFetch';

export class MeasureFetch extends AbstractDataFetch {

    type: FetchType;

    constructor(server: Server) {
        super(server);

        if (!this.selectedBaseServer?.baseUrl || this.selectedBaseServer?.baseUrl === '') {
            throw new Error(StringUtils.format(Constants.missingProperty, 'url'));
        }

        this.type = FetchType.MEASURE;
    }

    public getUrl(): string {
        return this.selectedBaseServer?.baseUrl + Constants.fetch_measures;
    }

    protected processReturnedData(data: any): OutcomeTracker {
        let measureList: Measure[] = [];

        if (data.entry) {
            measureList = data.entry.map((entry: BundleEntry) => {
                return {
                    'name': entry.resource.id,
                    'scoring': entry.resource.scoring ? entry.resource.scoring : ''
                }
            });

            measureList.sort((a, b) => {
                const measureA = a.name + '';
                const measureB = b.name + '';
                return measureA.localeCompare(measureB);
            });
        }
        return OutcomeTrackerUtils.buildOutcomeTracker(
            this.getUrl(),
            data,
            'Measure Fetch',
            this.selectedBaseServer,
            measureList
        );
    }

}