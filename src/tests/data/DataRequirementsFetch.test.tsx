import fetchMock from 'fetch-mock';
import { Constants } from '../../constants/Constants';
import { DataRequirementsFetch } from '../../data/DataRequirementsFetch';
import { StringUtils } from '../../utils/StringUtils';
import jsonTestDataRequirementsData from '../resources/fetchmock-knowledge-repo.json';


test('required properties check', () => {
    try {
        new DataRequirementsFetch('',
            'selectedMeasure',
            'startDate',
            'endDate');
    } catch (error: any) {
        expect(error.message).toEqual(StringUtils.format(Constants.missingProperty, 'selectedKnowledgeRepo'))
    }

    try {
        new DataRequirementsFetch('selectedKnowledgeRepo',
            '',
            'startDate',
            'endDate');
    } catch (error: any) {
        expect(error.message).toEqual(StringUtils.format(Constants.missingProperty, 'selectedMeasure'))
    }

    try {
        new DataRequirementsFetch('selectedKnowledgeRepo',
            'selectedMeasure',
            '',
            'endDate');
    } catch (error: any) {
        expect(error.message).toEqual(StringUtils.format(Constants.missingProperty, 'startDate'))
    }

    try {
        new DataRequirementsFetch('selectedKnowledgeRepo',
            'selectedMeasure',
            'startDate',
            '');
    } catch (error: any) {
        expect(error.message).toEqual(StringUtils.format(Constants.missingProperty, 'endDate'))
    }

});


test('get DataRequirements mock', async () => {
    const dataRequirementsFetch = new DataRequirementsFetch('selectedKnowledgeRepo',
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
    const dataRequirementsFetch = new DataRequirementsFetch('selectedKnowledgeRepo',
        'selectedMeasure',
        'startDate',
        'endDate');
    fetchMock.once(dataRequirementsFetch.getUrl(), { throws: new Error(errorMsg) });

    try {
        await dataRequirementsFetch.fetchData()
    } catch (error: any) {
        errorCatch = error.message;
    }

    expect(errorCatch).toEqual('Using selectedKnowledgeRepoMeasure/selectedMeasure/$data-requirements?periodStart=startDate&periodEnd=endDate to retrieve Data Requirements caused: Error: this is a test');

    fetchMock.restore();

});

test('test urlformat', async () => {
    let dataRequirementsFetch = await new DataRequirementsFetch('selectedKnowledgeRepo',
        'selectedMeasure',
        'startDate',
        'endDate');
    expect(dataRequirementsFetch.getUrl())
        .toEqual('selectedKnowledgeRepoMeasure/selectedMeasure/$data-requirements?periodStart=startDate&periodEnd=endDate');
});

