export class JsonUtils {
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
    public static makeJsonDataSubmittable(jsonData: any): string {
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

        console.log( JSON.stringify(jsonData, null, 2));
        return JSON.stringify(jsonData, null, 2);
    }
}