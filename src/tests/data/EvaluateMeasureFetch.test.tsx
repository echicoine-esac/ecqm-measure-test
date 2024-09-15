import fetchMock from 'fetch-mock';
import { Constants } from '../../constants/Constants';
import { EvaluateMeasureFetch, EvaluateMeasureResult } from '../../data/EvaluateMeasureFetch';
import { Server } from '../../models/Server';
import { ServerUtils } from '../../utils/ServerUtils';
import { StringUtils } from '../../utils/StringUtils';
import jsonTestResultsData from '../resources/fetchmock-results.json';

const selectedPatient = { display: 'John Doe', id: 'selectedPatient' };

beforeEach(() => {
    jest.spyOn(ServerUtils, 'getServerList').mockImplementation(async () => {
        return Constants.serverTestData;
    });
});

test('required properties check', async () => {
    const dataServer: Server = Constants.serverTestData[0];

    try {
        new EvaluateMeasureFetch(undefined, selectedPatient,
            'selectedMeasure', 'startDate', 'endDate');
    } catch (error: any) {
        expect(error.message).toEqual(StringUtils.format(Constants.missingProperty, 'selectedServer'))
    }

    try {
        new EvaluateMeasureFetch(dataServer, selectedPatient,
            '', 'startDate', 'endDate');
    } catch (error: any) {
        expect(error.message).toEqual(StringUtils.format(Constants.missingProperty, 'selectedMeasure'))
    }

    try {
        new EvaluateMeasureFetch(dataServer, selectedPatient,
            'selectedMeasure', '', 'endDate');
    } catch (error: any) {
        expect(error.message).toEqual(StringUtils.format(Constants.missingProperty, 'startDate'))
    }

    try {
        new EvaluateMeasureFetch(dataServer, selectedPatient,
            'selectedMeasure', 'startDate', '');
    } catch (error: any) {
        expect(error.message).toEqual(StringUtils.format(Constants.missingProperty, 'endDate'))
    }

});

test('get evaluate measures mock', async () => {
    const dataServer: Server = Constants.serverTestData[0];

    const evaluateMeasuresFetch = new EvaluateMeasureFetch(dataServer, selectedPatient,
        'selectedMeasure', 'startDate', 'endDate');

    expect(evaluateMeasuresFetch.getUrl())
        .toEqual('http://localhost:8080/1/Measure/selectedMeasure/$evaluate-measure?subject=selectedPatient&periodStart=startDate&periodEnd=endDate');

    const mockJsonResultsData = jsonTestResultsData;
    fetchMock.once(evaluateMeasuresFetch.getUrl(),
        JSON.stringify(mockJsonResultsData)
        , { method: 'GET' });
    let measureData: EvaluateMeasureResult = await evaluateMeasuresFetch.fetchData('');
    fetchMock.restore();
    expect(JSON.stringify(measureData.jsonBody, undefined, 2))
        .toEqual(JSON.stringify(mockJsonResultsData, undefined, 2))
});


test('test urlformat', async () => {
    const dataServer: Server = Constants.serverTestData[0];

    const evaluateMeasuresFetch = new EvaluateMeasureFetch(dataServer, selectedPatient,
        'selectedMeasure', 'startDate', 'endDate');

    expect(evaluateMeasuresFetch.getUrl())
        .toEqual('http://localhost:8080/1/Measure/selectedMeasure/$evaluate-measure?subject=selectedPatient&periodStart=startDate&periodEnd=endDate');

});

test('test urlformat, no patient', async () => {
    const dataServer: Server = Constants.serverTestData[0];

    const evaluateMeasuresFetch = new EvaluateMeasureFetch(dataServer, { display: '', id: '' },
        'selectedMeasure', 'startDate', 'endDate');

    expect(evaluateMeasuresFetch.getUrl())
        .toEqual('http://localhost:8080/1/Measure/selectedMeasure/$evaluate-measure?periodStart=startDate&periodEnd=endDate&reportType=subject-list');

});

