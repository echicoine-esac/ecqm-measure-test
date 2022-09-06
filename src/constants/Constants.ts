export class Constants {
    public static missingProperty = 'Missing required property: {0}';

    public static fetchError = 'Using {0} to retrieve {1} caused: {2}';
    public static error_receivingSystemServer = 'Please select a Receiving System server to use';
    public static error_selectTestServer = 'Please select a Test Server to use';
    public static error_selectMeasure = 'Please select a Measure to evaluate';
    public static error_selectMeasureDR = 'Please select a Measure to get the data requirements for';
    public static error_selectDataRepository = 'Please select a Data Repository server to use';
    public static error_selectMeasureDataCollection = 'Please select a Measure to collect the data for';

    public static error_selectReceivingSystemServer = 'Please select a Data Repository server to use';
    public static error_selectMeasureToSubmit = 'Please select a Measure to collect the data for';

    public static evaluateMeasureFetchURL = '{0}/{1}/$evaluate-measure?periodStart={2}&periodEnd={3}&reportType=subject-list';
    public static evaluateMeasureWithPatientFetchURL = '{0}/{1}/$evaluate-measure?subject={2}&periodStart={3}&periodEnd={4}';

    public static defaultStartDate = '2019-01-01';
    public static defaultEndDate = '2019-12-31';

    public static patientUrlEnding = '/Patient?_count=200';
    public static measureUrlEnding = '/Measure?_count=200';

    public static error_selectKnowledgeRepository = 'Please select a Knowledge Repository server to use';

    public static dataSubmitted = 'Data Submitted';
    public static submitDataFetchDataError = 'This function has not been implemented into SubmitDataFetch.  Use submitData instead.'
    
}

