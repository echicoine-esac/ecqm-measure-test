import fetchMock from 'fetch-mock';
import { CollectDataFetch } from '../../data/CollectDataFetch';
import jsonTestCollectDataData from '../resources/fetchmock-data-repo.json';


test('get CollectData mock', async () => {
    const collectDataFetch = new CollectDataFetch('selectedDataRepo',
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
    const errorMsg = 'this is a test'
    let errorCatch = '';
    const collectDataFetch = new CollectDataFetch('selectedDataRepo',
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
    let collectDataFetch = await new CollectDataFetch('selectedDataRepo',
        'selectedMeasure',
        'startDate',
        'endDate',
        'selectedPatient');
    expect(collectDataFetch.getUrl())
        .toEqual('selectedDataRepoMeasure/selectedMeasure/$collect-data?periodStart=startDate&periodEnd=endDate&subject=selectedPatient');
});

test('test urlformat without patient', async () => {
    let collectDataFetch = await new CollectDataFetch('selectedDataRepo',
        'selectedMeasure',
        'startDate',
        'endDate',
        '');
    expect(collectDataFetch.getUrl())
        .toEqual('selectedDataRepoMeasure/selectedMeasure/$collect-data?periodStart=startDate&periodEnd=endDate');
});

