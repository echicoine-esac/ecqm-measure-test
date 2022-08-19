import fetchMock from 'fetch-mock';
import { Constants } from '../../constants/Constants';
import { CollectDataFetch } from '../../data/CollectDataFetch';
import { StringUtils } from '../../utils/StringUtils';
import jsonTestCollectDataData from '../resources/fetchmock-data-repo.json';
import {Server} from "../../models/Server";

test('required properties check', () => {
    const dataServer: Server = buildAServer();

    try {
        new CollectDataFetch(undefined,
            'selectedMeasure',
            'startDate',
            'endDate',
            'selectedPatient');
    } catch (error: any) {
        expect(error.message).toEqual(StringUtils.format(Constants.missingProperty, 'selectedDataRepo'))
    }

    try {
        new CollectDataFetch(dataServer,
            '',
            'startDate',
            'endDate',
            'selectedPatient');
    } catch (error: any) {
        expect(error.message).toEqual(StringUtils.format(Constants.missingProperty, 'selectedMeasure'))
    }

    try {
        new CollectDataFetch(dataServer,
            'selectedMeasure',
            '',
            'endDate',
            'selectedPatient');
    } catch (error: any) {
        expect(error.message).toEqual(StringUtils.format(Constants.missingProperty, 'startDate'))
    }

    try {
        new CollectDataFetch(dataServer,
            'selectedMeasure',
            'startDate',
            '',
            'selectedPatient');
    } catch (error: any) {
        expect(error.message).toEqual(StringUtils.format(Constants.missingProperty, 'endDate'))
    }
});


test('get CollectData mock', async () => {
    const dataServer: Server = buildAServer();

    const collectDataFetch = new CollectDataFetch(dataServer,
        'selectedMeasure',
        'startDate',
        'endDate',
        'selectedPatient');
    const mockJsonCollectDataData = jsonTestCollectDataData;
    fetchMock.once(collectDataFetch.getUrl(),
        JSON.stringify(mockJsonCollectDataData)
        , { method: 'GET' });
    let collectedData: string = await collectDataFetch.fetchData()
    expect(collectedData).toEqual(JSON.stringify(mockJsonCollectDataData, undefined, 2));

    fetchMock.restore();

});

test('get CollectData mock error', async () => {
    const dataServer: Server = buildAServer();
    const errorMsg = 'this is a test'
    let errorCatch = '';
    const collectDataFetch = new CollectDataFetch(dataServer,
        'selectedMeasure',
        'startDate',
        'endDate',
        'selectedPatient');
    fetchMock.once(collectDataFetch.getUrl(), { throws: new Error(errorMsg) });

    try {
        await collectDataFetch.fetchData()
    } catch (error: any) {
        errorCatch = error.message;
    }

    expect(errorCatch).toEqual('Using selectedDataRepoMeasure/selectedMeasure/$collect-data?periodStart=startDate&periodEnd=endDate&subject=selectedPatient to retrieve Collect Data caused: Error: this is a test');

    fetchMock.restore();

});

test('test urlformat', async () => {
    const dataServer: Server = buildAServer();
    let collectDataFetch = await new CollectDataFetch(dataServer,
        'selectedMeasure',
        'startDate',
        'endDate',
        'selectedPatient');
    expect(collectDataFetch.getUrl())
        .toEqual('selectedDataRepoMeasure/selectedMeasure/$collect-data?periodStart=startDate&periodEnd=endDate&subject=selectedPatient');
});

test('test urlformat without patient', async () => {
    const dataServer: Server = buildAServer();
    let collectDataFetch = await new CollectDataFetch(dataServer,
        'selectedMeasure',
        'startDate',
        'endDate',
        '');
    expect(collectDataFetch.getUrl())
        .toEqual('selectedDataRepoMeasure/selectedMeasure/$collect-data?periodStart=startDate&periodEnd=endDate');
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