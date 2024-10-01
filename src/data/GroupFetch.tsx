import { Constants } from '../constants/Constants';
import { PatientGroup } from '../models/PatientGroup';
import { StringUtils } from '../utils/StringUtils';
import { AbstractDataFetch, FetchType } from './AbstractDataFetch';


export class GroupFetch extends AbstractDataFetch {

    type: FetchType;
    url: string = '';

    UNKNOWN_MEASURE: string = '#unknown_measure#';

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

    protected processReturnedData(data: any): Map<string, PatientGroup> {
        let groupMap = new Map<string, PatientGroup>();

        let entries = data.entry;

        if (!entries || entries.length === 0) {
            return groupMap;
        }

        for (let entry of entries) {
            if (entry.resource.resourceType === "Group" && entry.resource.type === 'person') {

                //It is possible the server returns a Patient Group file, but with no measure information. 
                let measureName = '';

                //establish measure name:
                if (entry.resource.extension && entry.resource.extension.length > 0) {
                    //possible format:
                    // "extension": [ {
                    //     "url": "http://hl7.org/fhir/StructureDefinition/artifact-testArtifact",
                    //     "valueCanonical": "http://ecqi.healthit.gov/ecqms/Measure/HIVViralSuppressionFHIR"
                    //   } ],
                    const url: string = entry.resource.extension[0].valueCanonical;
                    measureName = url.split('/')[url.split('/').length - 1]
                } else {
                    //couldn't determine measure to match this entry with
                    return groupMap;
                }

                if (entry?.resource?.id && entry?.resource?.extension && entry?.resource?.member) {
                    // console.log(measureName + ' has a Group file.')
                    groupMap.set(measureName, {
                        id: entry.resource.id,
                        extension: entry.resource.extension,
                        member: entry.resource.member
                    })
                } else {
                    return groupMap;
                }
            }
        }

        return groupMap;
    }

}
