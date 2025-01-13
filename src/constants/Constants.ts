import { Section } from '../enum/Section.enum';
import { Outcome, OutcomeTracker } from '../models/OutcomeTracker';
import { Server } from '../models/Server';

export class Constants {
    public static readonly title_knowledge_repo = 'Knowledge Repository';
    public static readonly title_data_repo = 'Data Extraction Service/Data Repository';
    public static readonly title_measure_evaluation = 'Measure Evaluation Service';
    public static readonly title_receiving_system = 'Receiving System';
    public static readonly title_test_comparator = 'Test Comparator';
    public static readonly title_reportingPeriod = 'Reporting Period';

    public static readonly id_knowledge_repo = 'knowledge-repo';
    public static readonly id_data_repo = 'data-repo';
    public static readonly id_measure_evaluation = 'mea-eva';
    public static readonly id_receiving_system = 'rec-sys';
    public static readonly id_test_comparator = 'test-compare';
    public static readonly id_reportingPeriod = 'reporting-period';

    public static readonly sectionIDs: Map<Section, string> = new Map([
        [Section.REPORTING_PERIOD, Constants.id_reportingPeriod],
        [Section.KNOWLEDGE_REPO, Constants.id_knowledge_repo],
        [Section.DATA_REPO, Constants.id_data_repo],
        [Section.MEASURE_EVAL, Constants.id_measure_evaluation],
        [Section.REC_SYS, Constants.id_receiving_system],
        [Section.TEST_COMPARE, Constants.id_test_comparator],
    ]);

    public static readonly sectionTitles: Map<Section, string> = new Map([
        [Section.REPORTING_PERIOD, Constants.title_reportingPeriod],
        [Section.KNOWLEDGE_REPO, Constants.title_knowledge_repo],
        [Section.DATA_REPO, Constants.title_data_repo],
        [Section.MEASURE_EVAL, Constants.title_measure_evaluation],
        [Section.REC_SYS, Constants.title_receiving_system],
        [Section.TEST_COMPARE, Constants.title_test_comparator],
    ]);

    public static readonly operationOutcomeResourceType = 'OperationOutcome';
    public static readonly upArrow = '↑';
    public static readonly preFetchMessage = 'Fetching data from:\n\r';

    public static readonly missingProperty = 'Missing required property: {0}';
    public static readonly unreachableURL = 'The target URL is unreachable: '
    public static readonly fetchError = 'Using {0} for {1} caused: {2}';

    //Reporting Period
    public static readonly defaultStartDate = '2025-01-01';
    public static readonly defaultEndDate = '2025-12-31';

    //Measure Evaluation:
    public static readonly error_measureEvaluationServer = 'Please select a Measure Evaluation server';
    public static readonly error_selectMeasure = 'Please select a Measure in the Knowledge Repository panel to perform a Measure Evaluation';
    public static readonly error_submitData_selectMeasure = 'Please select a Measure from the Knowledge Repository panel';
    public static readonly error_submitData_collectData = 'Please Collect Data for selected Measure using the Data Extraction Service/Data Repository panel';

    //Knowledge Repository:
    public static readonly error_selectMeasureDR = 'Please select a Measure to get the data requirements for';
    public static readonly error_selectKnowledgeRepository = 'Please select a Knowledge Repository server';

    //Data Repository:
    public static readonly error_selectDataRepository = 'Please select a Data Repository server';
    public static readonly error_collectData_selectMeasure = 'Please select a Measure from the Knowledge Repository panel to collect the data for';

    //Receiving System:
    public static readonly error_generateMeasureReport = 'Please generate a MeasureReport using the Evaluate Measure function in the Measure Evaluation panel';
    public static readonly error_selectReceivingSystemServer = 'Please select a Data Repository server in the Data Extraction Service/Data Repository panel';
    public static readonly error_receivingSystemServer = 'Please select a Receiving System server';

    //server modal
    public static readonly error_url = 'Please provide a valid URL: ';
    public static readonly error_urlStartsWith = 'Must start with http:// or https://';
    public static readonly error_urlEndsWith = 'Must end with /';

    //Test Comparator
    public static readonly testComparisonInstruction = `This utility compares current Measure evaluations done in real-time with previous MeasureReports from MADiE (<a href='https://ecqi.healthit.gov/tool/madie' target='_blank' rel='noreferrer'>https://ecqi.healthit.gov/tool/madie ↗</a>) and displays a summary of discrepancies and matches. The existing MeasureReports are pulled from the Data Repository server, and the current Measure Evaluation will be executed against the selected Measure Evaluation Server. To begin, verify the following items are established:`;
    public static readonly renderWidthInfo: string = 'For optimal viewing, please ensure your display window is at least 725px wide. This will allow the report to render correctly and ensure all content is visible and properly formatted.';
    
    //Other
    public static readonly error_patientGroup = 'No Patient Group data could be established for the selected Measure. Select an individual Patient from the Patient dropdown and attempt operation again';
    public static readonly label_largeDataNOTE = ' NOTE: Without subject, ALL Patient data is analyzed. Complexity may cause 504 Timeout.'
    public static readonly label_selectServer = 'Select a Server...';

    //fetch urls
    public static readonly fetch_evaluateMeasureWithSubject = '{0}Measure/{1}/$evaluate-measure?periodStart={2}&periodEnd={3}&subject={4}&reportType=subject-list';
    public static readonly fetch_measureReportByEvaluatedResource = '{0}MeasureReport?evaluated-resource=Patient/{1}';
    public static readonly fetch_measureReportByMeasure = '{0}MeasureReport?evaluated-resource=Patient/{1}&measure=https://madie.cms.gov/Measure/{2}';
    public static readonly fetch_collectDataWithSubject = '{0}Measure/{1}/$collect-data?periodStart={2}&periodEnd={3}&subject={4}&reportType=subject-list';
    public static readonly fetch_patients = 'Patient?_count=';
    public static readonly fetch_patientTotalCount = 'Patient?_summary=count';
    public static readonly fetch_measures = 'Measure?_count=200';
    public static readonly fetch_groups = 'Group?type=person';

    //fetch response:
    public static readonly fetch_STATUS_OK = 200;
    public static readonly fetch_STATUS_BAD_REQUEST = 400;
    public static readonly fetch_STATUS_UNAUTHORIZED = 401;
    public static readonly fetch_STATUS_FORBIDDEN = 403;
    public static readonly fetch_STATUS_NOT_FOUND = 404;
    public static readonly fetch_STATUS_INTERNAL_SERVER_ERROR = 500;
    public static readonly fetch_STATUS_SERVICE_UNAVAILABLE = 503;
    public static readonly fetch_STATUS_GATEWAY_TIMEOUT = 504;

    public static readonly fetch_GATEWAY_TIMEOUT = Constants.fetch_STATUS_GATEWAY_TIMEOUT + ' (Gateway Timeout)';
    public static readonly fetch_BAD_REQUEST = Constants.fetch_STATUS_BAD_REQUEST + ' (Bad Request)';
    public static readonly fetch_UNAUTHORIZED = Constants.fetch_STATUS_UNAUTHORIZED + ' (Unauthorized)';
    public static readonly fetch_FORBIDDEN = Constants.fetch_STATUS_FORBIDDEN + ' (Forbidden)';
    public static readonly fetch_NOT_FOUND = Constants.fetch_STATUS_NOT_FOUND + ' (Not Found)';
    public static readonly fetch_INTERNAL_SERVER_ERROR = Constants.fetch_STATUS_INTERNAL_SERVER_ERROR + ' (Internal Server Error)';
    public static readonly fetch_SERVICE_UNAVAILABLE = Constants.fetch_STATUS_SERVICE_UNAVAILABLE + ' (Service Unavailable)';
    public static readonly fetch_UNEXPECTED_STATUS = 'Unexpected status encountered';

    public static readonly functionNotImplemented = 'This function has not been implemented';

    public static readonly serverDefault: Server = {
        id: '',
        baseUrl: '',
        authUrl: '',
        tokenUrl: '',
        callbackUrl: '',
        clientID: '',
        clientSecret: '',
        scope: ''
    };

    public static readonly outcomeTrackerDefault: OutcomeTracker = {
        outcomeMessage: '',
        outcomeType: Outcome.NONE
    };

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