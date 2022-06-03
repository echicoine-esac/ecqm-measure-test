export class Constants {

    public static appDataMissingSelectedServer = 'Missing Selected Server';
    public static appDataMissingSelectedMeasure = 'Missing Selected Measure';
    public static appDataMissingStartDate = 'Missing Start Date';
    public static appDataMissingEndDate = 'Missing End Data';

    public static fetchError = 'Using {0} to retrieve {1} caused: {2}';
    public static error_selectTestServer = 'Please select a Test Server to use';
    public static error_selectMeasure = 'Please select a Measure to evaluate';

    public static fetchData = '{0}Measure/{1}/$evaluate-measure?periodStart={2}&periodEnd={3}&reportType=subject-list';
    public static fetchDataWithPatient = '{0}Measure/{1}/$evaluate-measure?subject={2}&periodStart={3}&periodEnd={4}';

    public static defaultStartDate = '2019-01-01';
    public static defaultEndDate = '2019-12-31';

    public static patientUrlEnding = 'Patient?_count=200';
    public static measureUrlEnding = 'Measure?_count=200';

    private static serverUrls: string[] = ['https://cloud.alphora.com/sandbox/r4/cqm/fhir/',
        'https://cqf-ruler.ecqm.icfcloud.com/fhir/']

    //central location for retrieving server URLS (could be updated with fetch?)
    public static getServerUrls(): string[] {
        return Constants.serverUrls;
    }

    public static addToServerUrls(url: string) {
        Constants.serverUrls.push(url);
    }
}

export enum FetchType {
    PATIENT = "Patients",
    MEASURE = "Measures"
};