import fetchMock from 'fetch-mock';
import { Constants } from '../../constants/Constants';
import { EvaluateMeasureFetch } from '../../data/EvaluateMeasureFetch';
import { MeasureData } from '../../models/MeasureData';
import { StringUtils } from '../../utils/StringUtils';
import jsonTestResultsData from '../resources/fetchmock-results.json';

test('required properties check', () => {
    try {
        new EvaluateMeasureFetch('', 'selectedPatient',
        'selectedMeasure', 'startDate', 'endDate');
    } catch (error: any) {
        expect(error.message).toEqual(StringUtils.format(Constants.missingProperty, 'selectedServer'))
    }

    try {
        new EvaluateMeasureFetch('selectedServer', 'selectedPatient',
        '', 'startDate', 'endDate');
    } catch (error: any) {
        expect(error.message).toEqual(StringUtils.format(Constants.missingProperty, 'selectedMeasure'))
    }

    try {
        new EvaluateMeasureFetch('selectedServer', 'selectedPatient',
        'selectedMeasure', '', 'endDate');
    } catch (error: any) {
        expect(error.message).toEqual(StringUtils.format(Constants.missingProperty, 'startDate'))
    }

    try {
        new EvaluateMeasureFetch('selectedServer', 'selectedPatient',
        'selectedMeasure', 'startDate', '');
    } catch (error: any) {
        expect(error.message).toEqual(StringUtils.format(Constants.missingProperty, 'endDate'))
    }

});

test('get evaluate measures mock', async () => {

    const evaluateMeasuresFetch = new EvaluateMeasureFetch('selectedServer', 'selectedPatient',
        'selectedMeasure', 'startDate', 'endDate');

    expect(evaluateMeasuresFetch.getUrl())
        .toEqual('selectedServerMeasure/selectedMeasure/$evaluate-measure?subject=selectedPatient&periodStart=startDate&periodEnd=endDate');

    const mockJsonResultsData = jsonTestResultsData;
    fetchMock.once(evaluateMeasuresFetch.getUrl(),
        JSON.stringify(mockJsonResultsData)
        , { method: 'GET' });
    let measureData: MeasureData = await evaluateMeasuresFetch.fetchData();
    fetchMock.restore();
    expect(JSON.stringify(measureData.jsonBody, undefined, 2))
        .toEqual(JSON.stringify(mockJsonResultsData, undefined, 2))
});


test('test urlformat', async () => {
    const evaluateMeasuresFetch = new EvaluateMeasureFetch('selectedServer', 'selectedPatient',
        'selectedMeasure', 'startDate', 'endDate');

    expect(evaluateMeasuresFetch.getUrl())
        .toEqual('selectedServerMeasure/selectedMeasure/$evaluate-measure?subject=selectedPatient&periodStart=startDate&periodEnd=endDate');
        
});

test('test urlformat, no patient', async () => {
    const evaluateMeasuresFetch = new EvaluateMeasureFetch('selectedServer', '',
        'selectedMeasure', 'startDate', 'endDate');

    expect(evaluateMeasuresFetch.getUrl())
        .toEqual('selectedMeasureMeasure/selectedMeasure/$evaluate-measure?periodStart=startDate&periodEnd=endDate&reportType=subject-list');
        
});