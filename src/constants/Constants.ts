import { Server } from '../models/Server';

export class Constants {
    public static missingProperty = 'Missing required property: {0}';
    public static unreachableURL = 'The target URL is unreachable: '
    public static fetchError = 'Using {0} to retrieve {1} caused: {2}';
    public static error_receivingSystemServer = 'Please select a Receiving System server to use';
    public static error_selectTestServer = 'Please select a Test Server to use';
    public static error_selectMeasure = 'Please select a Measure to evaluate';
    public static error_selectMeasureDR = 'Please select a Measure to get the data requirements for';
    public static error_selectDataRepository = 'Please select a Data Repository server to use';
    public static error_selectMeasureDataCollection = 'Please select a Measure to collect the data for';
    
    public static error_url = 'Please provide a valid URL: ';
    public static error_urlStartsWith = 'Must start with http:// or https://';
    public static error_urlEndsWith = 'Must end with /';
    
    public static error_selectReceivingSystemServer = 'Please select a Data Repository server to use';
    public static error_selectMeasureToSubmit = 'Please select a Measure to collect the data for';

    public static evaluateMeasureFetchURL = '{0}Measure/{1}/$evaluate-measure?periodStart={2}&periodEnd={3}&reportType=subject-list';
    public static evaluateMeasureWithPatientFetchURL = '{0}Measure/{1}/$evaluate-measure?subject={2}&periodStart={3}&periodEnd={4}';

    public static defaultStartDate = '2019-01-01';
    public static defaultEndDate = '2019-12-31';

    public static patientUrlEnding = 'Patient?_count=';
    public static patientTotalCountUrlEnding = 'Patient?_summary=count';
    
    public static measureUrlEnding = 'Measure?_count=200';

    public static error_selectKnowledgeRepository = 'Please select a Knowledge Repository server to use';

    public static dataSubmitted = 'Data Submitted';
    public static submitDataFetchDataError = 'This function has not been implemented into SubmitDataFetch.  Use submitData instead.'

    //testing purposes:
    public static serverTestData: Server[] = [
        {
            id: 'ec2345-1',
            baseUrl: 'http://localhost:8123/1/',
            authUrl: '',
            tokenUrl: '',
            callbackUrl: '',
            clientID: '',
            clientSecret: '',
            scope: ''
        },
        {
            id: 'ec2345-2',
            baseUrl: 'http://localhost:8123/2/',
            authUrl: '',
            tokenUrl: '',
            callbackUrl: '',
            clientID: '',
            clientSecret: '',
            scope: ''
        },
        {
            id: 'ec2345-3',
            baseUrl: 'http://localhost:8123/3/',
            authUrl: '',
            tokenUrl: '',
            callbackUrl: '',
            clientID: '',
            clientSecret: '',
            scope: ''
        },
        {
            id: 'ec2345-4',
            baseUrl: 'http://localhost:8123/4/',
            authUrl: 'http://localhost:8123/4/authorize/',
            tokenUrl: 'http://localhost:8123/4/token/',
            callbackUrl: 'http://localhost:8123/4/',
            clientID: 'SKeK4PfHWPFSFzmy0CeD-pe8',
            clientSecret: 'Q_s6HeMPpzjZfNNbtqwFZjvhoXmiw8CPBLp_4tiRiZ_wQLQW',
            scope: 'photo+offline_access'
        }
    ];

    public static testOauthServer = Constants.serverTestData[3];
    static submitPostTestBody = `{'prop1': 'val1', 'prop2': 'val2'}`
}