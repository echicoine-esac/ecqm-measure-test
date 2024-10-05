import { Constants } from '../constants/Constants';
import { Patient } from '../models/Patient';
import { PatientGroup } from '../models/PatientGroup';
import { Server } from '../models/Server';
import { OutcomeTrackerUtils } from '../utils/OutcomeTrackerUtils';
import { StringUtils } from '../utils/StringUtils';
import { AbstractDataFetch, FetchType } from './AbstractDataFetch';

export class CollectDataFetch extends AbstractDataFetch {
    type: FetchType;

    selectedDataRepo: Server | undefined;
    selectedMeasure: string = '';
    startDate: string = '';
    endDate: string = '';
    selectedPatient: Patient | undefined;
    patientGroup: PatientGroup | undefined;
    useSubject: boolean = false;

    constructor(selectedDataRepo: Server | undefined,
        selectedMeasure: string,
        startDate: string,
        endDate: string,
        useSubject: boolean,
        selectedPatient?: Patient,
        patientGroup?: PatientGroup | undefined
    ) {

        super();
        this.type = FetchType.COLLECT_DATA;

        if (!selectedDataRepo || selectedDataRepo.baseUrl === '') {
            throw new Error(StringUtils.format(Constants.missingProperty, 'selectedDataRepo'));
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

        if (useSubject) {
            if (!selectedPatient || selectedPatient.id === '') {
                if (!patientGroup || patientGroup.id === '') {
                    throw new Error(StringUtils.format(Constants.missingProperty, 'Patient or Group'));
                }
            }
        }

        this.selectedDataRepo = selectedDataRepo;
        this.selectedMeasure = selectedMeasure;
        this.startDate = startDate;
        this.endDate = endDate;
        this.useSubject = useSubject;

        if (selectedPatient) this.selectedPatient = selectedPatient;
        if (patientGroup) this.patientGroup = patientGroup;

    }

    public getUrl(): string {

        let subject = '';
        if (this.useSubject) {
            if (this.selectedPatient?.id) {
                subject = 'Patient/' + this.selectedPatient.id;
            } else if (this.patientGroup) {
                subject = 'Group/' + this.patientGroup.id;
            }
            return StringUtils.format(Constants.fetchURL_collectDataWithSubject,
                this.selectedDataRepo?.baseUrl,
                this.selectedMeasure,
                this.startDate,
                this.endDate,
                subject
            );
        }

        //useSubject not true, return url without subject line
        return StringUtils.format(Constants.fetchURL_collectDataWithSubject.replace('&subject={4}', ''),
            this.selectedDataRepo?.baseUrl,
            this.selectedMeasure,
            this.startDate,
            this.endDate
        );

    }

    protected processReturnedData(data: any) {
        return OutcomeTrackerUtils.buildOutcomeTracker(
            this.makeJsonDataSubmittable(data), 
            'Collect Data', 
            this.selectedDataRepo?.baseUrl);
    }

      /**
     * Current bugs in hapi-fhir: 
     * - Data returned using $collect-data associates ids in the name entry for each resource. These names are used in 
     *   SubmitDataProvider as 'OperationParam' identifiers, which are validating by whole string only, which means 
     *   'measureReport-1234' will not be found but 'measureReport' will.
     * 
     *   Example:   "name": "measureReport-e8029124-d760-40eb-b25a-703e447a3e4d"
     *               will convert to
     *              "name": "measureReport"
     * 
     * - Measure identification in the data returned by $collect-data includes version.
     *      
     *   Example:   "measure": "https://madie.cms.gov/Measure/AlaraCTClinicalFHIR|0.4.000"
     *              will convert to
     *              "measure": "https://madie.cms.gov/Measure/AlaraCTClinicalFHIR"
     * @param jsonString 
     * @returns 
     */
      private makeJsonDataSubmittable(jsonData: any): string {
        if (jsonData.parameter && Array.isArray(jsonData.parameter)) {
            jsonData.parameter.forEach((entry: any) => {

                //strip the id in the name field:
                if (entry.name && typeof entry.name === 'string') {
                    if (entry.name.startsWith('measureReport-')) {
                        entry.name = 'measureReport';
                    }
                    if (entry.name.startsWith('resource-')) {
                        entry.name = 'resource';
                    }
                }

                //strip measure version if present:
                if (entry.resource && entry.resource.resourceType === 'Measure') {
                    if (entry.resource.id && typeof entry.resource.id === 'string') {
                        const measureIdParts = entry.resource.id.split('|');
                        if (measureIdParts.length > 1) {
                            entry.resource.id = measureIdParts[0];
                        }
                    }
                }
            });
        }

        return JSON.stringify(jsonData, null, 2);
    }
}