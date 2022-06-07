import fetchMock from 'fetch-mock';
import { EvaluateMeasureFetch } from '../../data/EvaluateMeasureFetch';
import { MeasureData } from '../../models/MeasureData';
import jsonTestResultsData from '../resources/fetchmock-results.json';

test('get evaluate measures mock', async () => {

    const selectedServer = 'selectedServer';
    const selectedPatient = 'selectedPatient';
    const selectedMeasure = 'selectedMeasure';
    const startDate = 'startDate';
    const endDate = 'endDate';

    const evaluateMeasuresFetch = new EvaluateMeasureFetch(selectedServer, selectedPatient,
        selectedMeasure, startDate, endDate);

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



