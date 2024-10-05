import { Constants } from '../constants/Constants';
import { BundleEntry } from '../models/BundleEntry';
import { Measure } from '../models/Measure';
import { OutcomeTracker } from '../models/OutcomeTracker';
import { OutcomeTrackerUtils } from '../utils/OutcomeTrackerUtils';
import { StringUtils } from '../utils/StringUtils';
import { AbstractDataFetch, FetchType } from './AbstractDataFetch';

export class MeasureFetch extends AbstractDataFetch {

    type: FetchType;
    url: string = '';

    constructor(url: string) {
        super();

        if (!url || url === '') {
            throw new Error(StringUtils.format(Constants.missingProperty, 'url'));
        }

        this.type = FetchType.MEASURE;
        this.url = url;
    }

    public getUrl(): string {
        return this.url + Constants.measureUrlEnding;
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
        return OutcomeTrackerUtils.buildOutcomeTracker(data, 'Measure Fetch', this.url,
            measureList
        );
    }

}