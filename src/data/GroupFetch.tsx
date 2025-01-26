import { Constants } from '../constants/Constants';
import { OutcomeTracker } from '../models/OutcomeTracker';
import { PatientGroup } from '../models/PatientGroup';
import { Server } from '../models/Server';
import { OutcomeTrackerUtils } from '../utils/OutcomeTrackerUtils';
import { StringUtils } from '../utils/StringUtils';
import { AbstractDataFetch, FetchType } from './AbstractDataFetch';


export class GroupFetch extends AbstractDataFetch {

    type: FetchType;

    UNKNOWN_MEASURE: string = '#unknown_measure#';

    constructor(server: Server) {
        super(server);

        if (!server || server.baseUrl === '') {
            throw new Error(StringUtils.format(Constants.missingProperty, 'server.baseUrl'));
        }

        this.type = FetchType.GROUP;
    }

    public getUrl(): string {
        return this.selectedBaseServer?.baseUrl + Constants.fetch_groups;
    }

    protected processReturnedData(data: any): OutcomeTracker {
        return OutcomeTrackerUtils.buildOutcomeTracker(
            this.getUrl(),
            data,
            'Group Data',
            this.selectedBaseServer,
            this.buildGroupMap(data.entry));
    }

    private buildGroupMap(entries: any): Map<string, PatientGroup> {
        let groupMap = new Map<string, PatientGroup>();
        if (entries && entries.length > 0) {

            for (let entry of entries) {
                if (entry.resource.resourceType === "Group" && entry.resource.type === 'person') {
                    //It is possible the server returns a Patient Group file, but with no measure information. 
                    let measureName = this.extractMeasureNameFromEntry(entry);

                    if (measureName.length > 0 &&
                        (entry?.resource?.id && entry?.resource?.extension && entry?.resource?.member)) {
                        // console.log(measureName + ' has a Group file.')
                        groupMap.set(measureName, {
                            id: entry.resource.id,
                            extension: entry.resource.extension,
                            member: entry.resource.member
                        })
                    }
                }

            }
        }
        return groupMap;
    }

    /**
     * possible format:
        "extension": [ {
            "url": "http://hl7.org/fhir/StructureDefinition/artifact-testArtifact",
            "valueCanonical": "http://ecqi.healthit.gov/ecqms/Measure/HIVViralSuppressionFHIR"
            } ],
     * @param entry 
     * @returns 
     */
    private extractMeasureNameFromEntry(entry: any) {
        let measureName = '';
        //establish measure name:
        if (entry.resource.extension && entry.resource.extension.length > 0) {
            const url: string = entry.resource.extension[0].valueCanonical;
            measureName = url.split('/')[url.split('/').length - 1]
        } else {
            //couldn't determine measure to match this entry with
            return '';
        }

        return measureName;
    }
}
