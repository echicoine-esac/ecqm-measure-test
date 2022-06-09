import { Constants } from "../constants/Constants";
import { BundleEntry } from "../models/BundleEntry";
import { Measure } from "../models/Measure";
import { StringUtils } from "../utils/StringUtils";
import { AbstractDataFetch, FetchType } from "./AbstractDataFetch";

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

    protected processReturnedData(data: any) {
        let entries = data.entry;
        let measureList: Measure[] = entries.map((entry: BundleEntry) => {
            return {
                "name": entry.resource.id,
                "scoring": entry.resource.scoring
            }
        });
        return measureList;
    }

}