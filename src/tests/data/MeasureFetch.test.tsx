import fetchMock from 'fetch-mock';
import { Constants } from '../../constants/Constants';
import { MeasureFetch } from '../../data/MeasureFetch';
import { Measure } from '../../models/Measure';
import jsonTestMeasureData from '../resources/fetchmock-measure.json';

test('get measures mock', async () => {
    const measureFetch = new MeasureFetch(Constants.serverTestData[0]);
    const mockJsonMeasureData = jsonTestMeasureData;
    fetchMock.once(measureFetch.getUrl(),
        JSON.stringify(mockJsonMeasureData)
        , { method: 'GET' });
    let measureList: Measure[] = (await measureFetch.fetchData()).operationData;
    expect(measureList.length).toEqual(64);
    fetchMock.restore();
});

test('get measures mock error', async () => {
    const errorMsg = 'this is a test'
    let errorCatch = '';
    const measureFetch = new MeasureFetch(Constants.serverTestData[0]);

    fetchMock.once(measureFetch.getUrl(), {
        throws: new Error(errorMsg)
    });

    try {
        let measureList: string[] = (await measureFetch.fetchData()).operationData;
    } catch (error: any) {
        errorCatch = error.message;
    }

    expect(errorCatch).toEqual('Using ' + Constants.serverTestData[0].baseUrl + 'Measure?_count=200 for Measures caused: Error: this is a test');

    fetchMock.restore();

});

test('test url format', async () => {
    let measureFetch = new MeasureFetch(Constants.serverTestData[0]);
    expect(measureFetch.getUrl())
        .toEqual(Constants.serverTestData[0].baseUrl + 'Measure?_count=200');
});

