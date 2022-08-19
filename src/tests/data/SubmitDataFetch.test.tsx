import fetchMock from 'fetch-mock';
import { Constants } from '../../constants/Constants';
import { SubmitDataFetch } from '../../data/SubmitDataFetch';
import { StringUtils } from '../../utils/StringUtils';
import {Server} from "../../models/Server";


test('required properties check', () => {
    const dataServer: Server = buildAServer();

    try {
        new SubmitDataFetch(undefined, 'selectedMeasure', 'collectedData');
    } catch (error: any) {
        expect(error.message).toEqual(StringUtils.format(Constants.missingProperty, 'selectedReceiving'))
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
    const dataServer: Server = buildAServer();

    expect(await new SubmitDataFetch(dataServer,
        'selectedMeasure', 'collectedData').fetchData())
        .toEqual(Constants.submitDataFetchDataError);
});

test('submit data mock', async () => {
    const dataServer: Server = buildAServer();

    const submitDataFetch = new SubmitDataFetch(dataServer, 'selectedMeasure', 'collectedData');
    fetchMock.once(submitDataFetch.getUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{"prop1": "val1", "prop2": "val2"}',
    });

    expect(await submitDataFetch.submitData()).toEqual(Constants.dataSubmitted);

    fetchMock.reset();
});

test('submit data mock error 400', async () => {
    const dataServer: Server = buildAServer();

    const submitDataFetch = new SubmitDataFetch(dataServer, 'selectedMeasure', 'collectedData');
    fetchMock.once(submitDataFetch.getUrl(), 400, { method: 'POST' });

    let errorCatch = '';
    try {
        await submitDataFetch.submitData()
    } catch (error: any) {
        errorCatch = error.message;
    }

    fetchMock.reset();

    expect(errorCatch).toEqual('Using selectedReceivingMeasure/selectedMeasure/$submit-data to retrieve Submit Data caused: Error: Bad Request');

});

test('submit data mock error 500', async () => {
    const dataServer: Server = buildAServer();

    const submitDataFetch = new SubmitDataFetch(dataServer, 'selectedMeasure', 'collectedData');
    fetchMock.once(submitDataFetch.getUrl(), 500, { method: 'POST' });

    let errorCatch = '';
    try {
        await submitDataFetch.submitData()
    } catch (error: any) {
        errorCatch = error.message;
    }

    fetchMock.reset();

    expect(errorCatch).toEqual('Using selectedReceivingMeasure/selectedMeasure/$submit-data to retrieve Submit Data caused: Error: Internal Server Error');

});


test('test urlformat', async () => {
    const dataServer: Server = buildAServer();

    const submitDataFetch = new SubmitDataFetch(dataServer,
        'selectedMeasure',
        'collectedData');
    expect(submitDataFetch.getUrl())
        .toEqual('selectedReceivingMeasure/selectedMeasure/$submit-data');
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