import fetchMock from 'fetch-mock';
import { Constants } from '../../constants/Constants';
import { MeasureFetch } from '../../data/MeasureFetch';
import { Measure } from '../../models/Measure';
import { StringUtils } from '../../utils/StringUtils';
import jsonTestMeasureData from '../resources/fetchmock-measure.json';

const url = 'foo';
test('required properties check', () => {
    try {
        new MeasureFetch('')
    } catch (error: any) {
        expect(error.message).toEqual(StringUtils.format(Constants.missingProperty, 'url'))
    }

});

test('get measures mock', async () => {
    const measureFetch = new MeasureFetch(url);
    const mockJsonMeasureData = jsonTestMeasureData;
    fetchMock.once(measureFetch.getUrl(),
        JSON.stringify(mockJsonMeasureData)
        , { method: 'GET' });
    let measureList: Measure[] = await measureFetch.fetchData('');
    expect(measureList.length).toEqual(15);
    fetchMock.restore();
});

test('get measures mock error', async () => {
    const errorMsg = 'this is a test'
    let errorCatch = '';
    const measureFetch = new MeasureFetch(url);

    fetchMock.once(measureFetch.getUrl(), {
        throws: new Error(errorMsg)
    });

    try {
        let measureList: string[] = await measureFetch.fetchData('');
    } catch (error: any) {
        errorCatch = error.message;
    }

    expect(errorCatch).toEqual('Using foo/Measure?_count=200 to retrieve Measures caused: Error: this is a test');

    fetchMock.restore();

});

test('test url format', async () => {
    let measureFetch = await new MeasureFetch(url);
    expect(measureFetch.getUrl())
        .toEqual('foo/Measure?_count=200');
});

