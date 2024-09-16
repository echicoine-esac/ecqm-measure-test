import fetchMock from 'fetch-mock';
import { Constants } from '../../constants/Constants';
import { SubmitDataFetch } from '../../data/SubmitDataFetch';
import { Server } from '../../models/Server';
import { ServerUtils } from '../../utils/ServerUtils';
import { StringUtils } from '../../utils/StringUtils';

beforeEach(() => {
    fetchMock.reset();

    jest.spyOn(ServerUtils, 'getServerList').mockImplementation(async () => {
        return Constants.serverTestData;
    });
});

test('required properties check', async () => {
    const dataServer: Server = Constants.serverTestData[0];

    try {
        new SubmitDataFetch(undefined, 'selectedMeasure', 'collectedData');
    } catch (error: any) {
        expect(error.message).toEqual(StringUtils.format(Constants.missingProperty, 'selectedMeasureEvaluation'))
    }

    try {
        new SubmitDataFetch(dataServer, '', 'collectedData');
    } catch (error: any) {
        expect(error.message).toEqual(StringUtils.format(Constants.missingProperty, 'selectedMeasure'))
    }

    try {
        new SubmitDataFetch(dataServer, 'selectedMeasure', '');
    } catch (error: any) {
        expect(error.message).toEqual(StringUtils.format(Constants.missingProperty, 'collectedData'))
    }

});

test('fetchData and processData override', async () => {
    const dataServer: Server = Constants.serverTestData[0];

    expect(await new SubmitDataFetch(dataServer,
        'selectedMeasure', 'collectedData').fetchData())
        .toEqual(Constants.submitDataFetchDataError);
});

test('submit data mock', async () => {
    const dataServer: Server = Constants.serverTestData[0];
    const submitDataFetch = new SubmitDataFetch(dataServer, 'selectedMeasure', 'collectedData');
    fetchMock.once(submitDataFetch.getUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: Constants.submitPostTestBody,
    });

    const ret: string = await submitDataFetch.submitData('');
    expect(ret.length).toEqual(145);

    fetchMock.reset();
});

test('submit data mock error 400', async () => {
    const dataServer: Server = Constants.serverTestData[0];

    const submitDataFetch = new SubmitDataFetch(dataServer, 'selectedMeasure', 'collectedData');
    fetchMock.once(submitDataFetch.getUrl(), 400, { method: 'POST' });

    let errorCatch = '';
    try {
        await submitDataFetch.submitData('')
    } catch (error: any) {
        errorCatch = error.message;
    }

    fetchMock.reset();

    expect(errorCatch).toEqual('Using http://localhost:8080/1/Measure/selectedMeasure/$submit-data to retrieve Submit Data caused: Bad Request');

});

test('submit data mock error 500', async () => {
    const dataServer: Server = Constants.serverTestData[0];

    const submitDataFetch = new SubmitDataFetch(dataServer, 'selectedMeasure', 'collectedData');
    fetchMock.once(submitDataFetch.getUrl(), 500, { method: 'POST' });

    let errorCatch = '';
    try {
        await submitDataFetch.submitData('')
    } catch (error: any) {
        errorCatch = error.message;
    }

    fetchMock.reset();

    expect(errorCatch).toEqual('Using http://localhost:8080/1/Measure/selectedMeasure/$submit-data to retrieve Submit Data caused: Internal Server Error');

});


test('test urlformat', async () => {
    const dataServer: Server = Constants.serverTestData[0];

    const submitDataFetch = new SubmitDataFetch(dataServer,
        'selectedMeasure',
        'collectedData');
    expect(submitDataFetch.getUrl())
        .toEqual('http://localhost:8080/1/Measure/selectedMeasure/$submit-data');
});
