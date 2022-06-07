import fetchMock from 'fetch-mock';
import { MeasureFetch } from '../../data/MeasureFetch';
import { Measure } from '../../models/Measure';
import jsonTestMeasureData from '../resources/fetchmock-measure.json';

const url = 'foo/';

test('get measures mock', async () => {
    const measureFetch = new MeasureFetch(url);
    const mockJsonMeasureData = jsonTestMeasureData;
    fetchMock.once(measureFetch.getUrl(),
        JSON.stringify(mockJsonMeasureData)
        , { method: 'GET' });
    let measureList: Measure[] = await measureFetch.fetchData();
    expect(measureList.length).toEqual(140);
    fetchMock.restore();
});

test('test url format', async () => {
    let measureFetch = await new MeasureFetch(url);
    expect(measureFetch.getUrl())
        .toEqual('foo/Measure?_count=200');
});

