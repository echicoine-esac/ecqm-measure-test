import fetchMock from 'fetch-mock';
import { DataRequirementsFetch } from '../../data/DataRequirementsFetch';
import jsonTestDataRequirementsData from '../resources/fetchmock-knowledge-repo.json';


test('get DataRequirements mock', async () => {
    const dataRequirementsFetch = new DataRequirementsFetch('selectedDataRepo',
        'selectedMeasure',
        'startDate',
        'endDate');
    const mockJsonDataRequirementsData = jsonTestDataRequirementsData;
    fetchMock.once(dataRequirementsFetch.getUrl(),
        JSON.stringify(mockJsonDataRequirementsData)
        , { method: 'GET' });
    let collectedData: string = await dataRequirementsFetch.fetchData()
    expect(collectedData).toEqual(JSON.stringify(mockJsonDataRequirementsData, undefined, 2));

    fetchMock.restore();

});

test('get DataRequirements mock error', async () => {
    const errorMsg = 'this is a test'
    let errorCatch = '';
    const dataRequirementsFetch = new DataRequirementsFetch('selectedDataRepo',
        'selectedMeasure',
        'startDate',
        'endDate');
    fetchMock.once(dataRequirementsFetch.getUrl(), { throws: new Error(errorMsg) });

    try {
        await dataRequirementsFetch.fetchData()
    } catch (error: any) {
        errorCatch = error.message;
    }

    expect(errorCatch).toEqual('Using selectedDataRepoMeasure/selectedMeasure/$data-requirements?periodStart=startDate&periodEnd=endDate to retrieve Data Requirements caused: Error: this is a test');

    fetchMock.restore();

});

test('test urlformat', async () => {
    let dataRequirementsFetch = await new DataRequirementsFetch('selectedDataRepo',
        'selectedMeasure',
        'startDate',
        'endDate');
    expect(dataRequirementsFetch.getUrl())
        .toEqual('selectedDataRepoMeasure/selectedMeasure/$data-requirements?periodStart=startDate&periodEnd=endDate');
});

