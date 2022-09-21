import fetchMock from 'fetch-mock';
import { Constants } from '../../constants/Constants';
import { DataRequirementsFetch } from '../../data/DataRequirementsFetch';
import { Server } from "../../models/Server";
import { ServerUtils } from '../../utils/ServerUtils';
import { StringUtils } from '../../utils/StringUtils';
import jsonTestDataRequirementsData from '../resources/fetchmock-knowledge-repo.json';


beforeEach(() => {
    jest.spyOn(ServerUtils, 'getServerList').mockImplementation(async () => {
        return Constants.serverTestData;
    });
});

test('required properties check', async () => {
    const dataServer: Server = (await ServerUtils.getServerList())[0];

    try {
        new DataRequirementsFetch(undefined,
            'selectedMeasure',
            'startDate',
            'endDate');
    } catch (error: any) {
        expect(error.message).toEqual(StringUtils.format(Constants.missingProperty, 'selectedKnowledgeRepo'))
    }

    try {
        new DataRequirementsFetch(dataServer,
            '',
            'startDate',
            'endDate');
    } catch (error: any) {
        expect(error.message).toEqual(StringUtils.format(Constants.missingProperty, 'selectedMeasure'))
    }

    try {
        new DataRequirementsFetch(dataServer,
            'selectedMeasure',
            '',
            'endDate');
    } catch (error: any) {
        expect(error.message).toEqual(StringUtils.format(Constants.missingProperty, 'startDate'))
    }

    try {
        new DataRequirementsFetch(dataServer,
            'selectedMeasure',
            'startDate',
            '');
    } catch (error: any) {
        expect(error.message).toEqual(StringUtils.format(Constants.missingProperty, 'endDate'))
    }

});


test('get DataRequirements mock', async () => {
    const dataServer: Server = (await ServerUtils.getServerList())[0];

    const dataRequirementsFetch = new DataRequirementsFetch(dataServer,
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
    const dataServer: Server = (await ServerUtils.getServerList())[0];

    const errorMsg = 'this is a test'
    let errorCatch = '';
    const dataRequirementsFetch = new DataRequirementsFetch(dataServer,
        'selectedMeasure',
        'startDate',
        'endDate');
    fetchMock.once(dataRequirementsFetch.getUrl(), { throws: new Error(errorMsg) });

    try {
        await dataRequirementsFetch.fetchData()
    } catch (error: any) {
        errorCatch = error.message;
    }

    expect(errorCatch).toEqual('Using http://localhost:8080/1/Measure/selectedMeasure/$data-requirements?periodStart=startDate&periodEnd=endDate to retrieve Data Requirements caused: Error: this is a test');

    fetchMock.restore();

});