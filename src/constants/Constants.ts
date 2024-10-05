import { Outcome, OutcomeTracker } from '../models/OutcomeTracker';
import { Server } from '../models/Server';

export class Constants {
    public static readonly operationOutcomeResourceType = 'OperationOutcome';
    public static readonly upArrow = '↑';
    public static readonly preFetchMessage = 'Fetching data from:\n\r';

    public static readonly missingProperty = 'Missing required property: {0}';
    public static readonly unreachableURL = 'The target URL is unreachable: '
    public static readonly fetchError = 'Using {0} to retrieve {1} caused: {2}';
    public static readonly error_receivingSystemServer = 'Please select a Receiving System server to use';
    public static readonly error_measureEvaluationServer = 'Please select a Measure Evaluation server to use';
    public static readonly error_selectTestServer = 'Please select a Test Server to use';
    public static readonly error_selectMeasure = 'Please select a Measure to evaluate';
    public static readonly error_selectMeasureDR = 'Please select a Measure to get the data requirements for';
    public static readonly error_selectDataRepository = 'Please select a Data Repository server to use';
    public static readonly error_selectPatient = 'Please select a Patient to use';
    public static readonly error_selectMeasureDataCollection = 'Please select a Measure to collect the data for';
    public static readonly error_generateMeasureReport = 'Please evaluate a Measure to generate a MeasureReport to post';

    public static readonly error_url = 'Please provide a valid URL: ';
    public static readonly error_urlStartsWith = 'Must start with http:// or https://';
    public static readonly error_urlEndsWith = 'Must end with /';

    public static readonly error_selectReceivingSystemServer = 'Please select a Data Repository server to use';
    public static readonly error_selectMeasureToSubmit = 'Please select a Measure to collect the data for';

    public static readonly collectDataWithSubjectFetchURL = '{0}Measure/{1}/$collect-data?periodStart={2}&periodEnd={3}&subject={4}&reportType=subject-list';

    public static readonly evaluateMeasureWithSubjectFetchURL = '{0}Measure/{1}/$evaluate-measure?periodStart={2}&periodEnd={3}&subject={4}&reportType=subject-list';

    public static readonly measureReportFetchURL_byEvaluatedResource = '{0}MeasureReport?evaluated-resource=Patient/{1}';

    public static readonly measureReportFetchURL_byMeasure = '{0}MeasureReport?evaluated-resource=Patient/{1}&measure=Measure/{2}';

    public static readonly defaultStartDate = '2025-01-01';
    public static readonly defaultEndDate = '2025-12-31';

    public static readonly patientUrlEnding = 'Patient?_count=';
    public static readonly patientTotalCountUrlEnding = 'Patient?_summary=count';

    public static readonly measureUrlEnding = 'Measure?_count=200';

    public static readonly groupUrlEnding = 'Group?type=person';

    public static readonly error_selectKnowledgeRepository = 'Please select a Knowledge Repository server to use';

    public static readonly submitDataFetchDataError = 'This function has not been implemented into SubmitDataFetch.  Use submitData instead.';

    public static readonly measurePosted = 'Measure Posted';

    public static readonly measurePostedFetchDataError = 'There was an error posting the measure report.';

    public static readonly evaluateMeasure_noGroupFound = 'When no Patient is selected, this operation attempts to use Group data. No Patient Group data could be established for the selected Measure. Select an individual Patient from the Patient dropdown and attempt operation again.';
    public static readonly testComparisonInstruction = 'This utility compares real-time Measure evaluations with existing MeasureReports and displays a summary of discrepancies and matches. To begin, verify the following items are established:';

    public static readonly largeDataNOTE = ' NOTE: Without subject, ALL Patient data is analyzed. Complexity may cause 504 Timeout'

     
    //testing purposes:
    public static readonly serverTestData: Server[] = [
        {
            id: 'ec2345-1',
            baseUrl: 'http://localhost:8080/1/',
            authUrl: '',
            tokenUrl: '',
            callbackUrl: '',
            clientID: '',
            clientSecret: '',
            scope: ''
        },
        {
            id: 'ec2345-2',
            baseUrl: 'http://localhost:8080/2/',
            authUrl: '',
            tokenUrl: '',
            callbackUrl: '',
            clientID: '',
            clientSecret: '',
            scope: ''
        },
        {
            id: 'ec2345-3',
            baseUrl: 'http://localhost:8080/3/',
            authUrl: '',
            tokenUrl: '',
            callbackUrl: '',
            clientID: '',
            clientSecret: '',
            scope: ''
        },
        {
            id: 'ec2345-4',
            baseUrl: 'http://localhost:8080/4/',
            authUrl: 'http://localhost:8080/4/authorize/',
            tokenUrl: 'http://localhost:8080/4/token/',
            callbackUrl: 'http://localhost:8080/4/',
            clientID: 'SKeK4PfHWPFSFzmy0CeD-pe8',
            clientSecret: 'Q_s6HeMPpzjZfNNbtqwFZjvhoXmiw8CPBLp_4tiRiZ_wQLQW',
            scope: 'photo+offline_access'
        }
    ];

    public static readonly testOauthServer = Constants.serverTestData[3];
    static readonly submitPostTestBody = `{'prop1': 'val1', 'prop2': 'val2'}`
}