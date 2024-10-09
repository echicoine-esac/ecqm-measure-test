import fetchMock from 'fetch-mock';
import { Constants } from '../../constants/Constants';
import { GroupFetch } from '../../data/GroupFetch';
import { PatientGroup } from '../../models/PatientGroup';
import { StringUtils } from '../../utils/StringUtils';
import jsonTestGroupData from '../resources/fetchmock-group.json';
import jsonTestEmptyGroupData from '../resources/fetchmock-group-empty.json';

const url = 'foo/';

test('required properties check', async () => {
    try {
        new GroupFetch('');
    } catch (error: any) {
        expect(error.message).toEqual(StringUtils.format(Constants.missingProperty, 'url'))
    }

});

test('get group mock', async () => {
    const groupFetch = new GroupFetch(url);

    const mockJsonGroupsData = jsonTestGroupData;
    fetchMock.once(groupFetch.getUrl(),
        JSON.stringify(mockJsonGroupsData)
        , { method: 'GET' });

    let groupList: Map<string, PatientGroup> = (await groupFetch.fetchData('')).operationData;

    expect(groupList.size).toEqual(6);
    fetchMock.restore();

});

test('get empty group mock', async () => {
    const groupFetch = new GroupFetch(url);

    const mockJsonGroupsData = jsonTestEmptyGroupData;
    fetchMock.once(groupFetch.getUrl(),
        JSON.stringify(mockJsonGroupsData)
        , { method: 'GET' });

    let groupList: Map<string, PatientGroup> = (await groupFetch.fetchData('')).operationData;

    expect(groupList.size).toEqual(0);
    fetchMock.restore();

});

test('get group mock function error', async () => {
    const errorMsg = 'this is a test'
    let errorCatch = '';
    const groupFetch = new GroupFetch(url);

    fetchMock.once(groupFetch.getUrl(), {
        throws: new Error(errorMsg)
    });

    try {
        await groupFetch.fetchData('')
    } catch (error: any) {
        errorCatch = error.message;
    }

    expect(errorCatch).toEqual('Using foo/Group?type=person for Group caused: Error: this is a test');

    fetchMock.restore();

});

test('get group mock return error', async () => {
    let errorCatch = '';
    const groupFetch = new GroupFetch(url);

    fetchMock.once(groupFetch.getUrl(), 400);

    try {
        await groupFetch.fetchData('')
    } catch (error: any) {
        errorCatch = error.message;
    }

    expect(errorCatch).toEqual('Using foo/Group?type=person for Group caused: Error: 400 (Bad Request)');

    fetchMock.restore();
});

test('test urlformat', async () => {
    let groupFetch = new GroupFetch(url);
    expect(groupFetch.getUrl())
        .toEqual('foo/Group?type=person');
});

