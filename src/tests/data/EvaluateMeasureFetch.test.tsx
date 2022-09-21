import fetchMock from 'fetch-mock';
import { Constants } from '../../constants/Constants';
import { EvaluateMeasureFetch } from '../../data/EvaluateMeasureFetch';
import { MeasureData } from '../../models/MeasureData';
import { StringUtils } from '../../utils/StringUtils';
import jsonTestResultsData from '../resources/fetchmock-results.json';
import {Server} from "../../models/Server";

test('required properties check', () => {
    const dataServer: Server =  buildAServer();

    try {
        new EvaluateMeasureFetch(undefined, 'selectedPatient',
        'selectedMeasure', 'startDate', 'endDate');
    } catch (error: any) {
        expect(error.message).toEqual(StringUtils.format(Constants.missingProperty, 'selectedServer'))
    }

    try {
        new EvaluateMeasureFetch(dataServer, 'selectedPatient',
        '', 'startDate', 'endDate');
    } catch (error: any) {
        expect(error.message).toEqual(StringUtils.format(Constants.missingProperty, 'selectedMeasure'))
    }

    try {
        new EvaluateMeasureFetch(dataServer, 'selectedPatient',
        'selectedMeasure', '', 'endDate');
    } catch (error: any) {
        expect(error.message).toEqual(StringUtils.format(Constants.missingProperty, 'startDate'))
    }

    try {
        new EvaluateMeasureFetch(dataServer, 'selectedPatient',
        'selectedMeasure', 'startDate', '');
    } catch (error: any) {
        expect(error.message).toEqual(StringUtils.format(Constants.missingProperty, 'endDate'))
    }

});

test('get evaluate measures mock', async () => {
    const dataServer: Server =  buildAServer();

    const evaluateMeasuresFetch = new EvaluateMeasureFetch(dataServer, 'selectedPatient',
        'selectedMeasure', 'startDate', 'endDate');

    expect(evaluateMeasuresFetch.getUrl())
        .toEqual('selectedServerMeasure/selectedMeasure/$evaluate-measure?subject=selectedPatient&periodStart=startDate&periodEnd=endDate');

    const mockJsonResultsData = jsonTestResultsData;
    fetchMock.once(evaluateMeasuresFetch.getUrl(),
        JSON.stringify(mockJsonResultsData)
        , { method: 'GET' });
    let measureData: MeasureData = await evaluateMeasuresFetch.fetchData('');
    fetchMock.restore();
    expect(JSON.stringify(measureData.jsonBody, undefined, 2))
        .toEqual(JSON.stringify(mockJsonResultsData, undefined, 2))
});


test('test urlformat', async () => {
    const dataServer: Server =  buildAServer();

    const evaluateMeasuresFetch = new EvaluateMeasureFetch(dataServer, 'selectedPatient',
        'selectedMeasure', 'startDate', 'endDate');

    expect(evaluateMeasuresFetch.getUrl())
        .toEqual('selectedServerMeasure/selectedMeasure/$evaluate-measure?subject=selectedPatient&periodStart=startDate&periodEnd=endDate');
        
});

test('test urlformat, no patient', async () => {
    const dataServer: Server =  buildAServer();

    const evaluateMeasuresFetch = new EvaluateMeasureFetch(dataServer, '',
        'selectedMeasure', 'startDate', 'endDate');

    expect(evaluateMeasuresFetch.getUrl())
        .toEqual('selectedMeasureMeasure/selectedMeasure/$evaluate-measure?periodStart=startDate&periodEnd=endDate&reportType=subject-list');
        
});

function buildAServer(): Server {
    return {
        id: '1',
        baseUrl: 'http://localhost:8080',
        authUrl: '',
        tokenUrl: '',
        callbackUrl: '',
        clientID: '',
        clientSecret: '',
        scope: ''
    }
}