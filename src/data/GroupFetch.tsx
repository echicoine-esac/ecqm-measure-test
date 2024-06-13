import { Constants } from '../constants/Constants';
import { Group } from '../models/Group';
import { StringUtils } from '../utils/StringUtils';
import { AbstractDataFetch, FetchType } from './AbstractDataFetch';


export class GroupFetch extends AbstractDataFetch {

    type: FetchType;
    url: string = '';

    constructor(url: string) {
        super();

        if (!url || url === '') {
            throw new Error(StringUtils.format(Constants.missingProperty, 'url'));
        }

        this.type = FetchType.GROUP;
        this.url = url;
    }

    public getUrl(): string {
        return this.url + Constants.groupUrlEnding;
    }

    protected processReturnedData(data: any): Map<string, Group> {
        let groupMap = new Map<string, Group>;

        let entries = data.entry;
        if (!entries || entries.length === 0) {
            console.log('GroupFetch: No group entries found in return bundle');
            return groupMap;
        }

        for (let entry of entries) {
            if (entry.resource.resourceType == "Group") {
                let url: string = entry.resource.extension[0].valueCanonical;
                let measureName: string = url.split('/')[url.split('/').length - 1]

                let group = {
                    id: entry.resource.id,
                    extension: entry.resource.extension,
                    member: entry.resource.member
                }

                groupMap.set(measureName, group)
            }
        }

        return groupMap;
    }

}
