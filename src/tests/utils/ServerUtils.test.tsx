import { Server } from '../../models/Server';
import { ServerUtils } from '../../utils/ServerUtils';

jest.mock('../../utils/ServerUtils')

jest.spyOn(ServerUtils, 'getServerList').mockImplementation(async () => {
    return await ServerUtils.buildServerTestData();
});

it('success example', async () => {
    const serverList = await ServerUtils.getServerList();
    expect(serverList).toEqual(ServerUtils.buildServerTestData());
});

