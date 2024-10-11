import { GraphQLResult } from '@aws-amplify/api';
import { GraphQLOptions } from '@aws-amplify/api-graphql/lib-esm/types/index';
import { API } from 'aws-amplify';
import { GraphQLError } from 'graphql/error/GraphQLError';
import { CreateServersInput } from '../../API';
import { Constants } from '../../constants/Constants';
import { createServers } from '../../graphql/mutations';
import { listServers } from '../../graphql/queries';
import { ServerUtils } from '../../utils/ServerUtils';

const mockGraphQlFn = jest.fn(async (options: GraphQLOptions, additionalHeaders?: { [key: string]: string; } | undefined): Promise<GraphQLResult<any>> => {
    return new Promise<GraphQLResult<any>>((resolve, reject) => {});
});

it('ServerUtils fail on get server ', async () => {
    const errMsg = 'Testing ServerUtils.getServerList error handling';

    jest.spyOn(API, 'graphql').mockImplementation(async (options: GraphQLOptions, additionalHeaders?: { [key: string]: string; } | undefined): Promise<GraphQLResult<any>> => {
        const graphQLError = new GraphQLError(errMsg);
        const errorsList: GraphQLError[] = [graphQLError]
        const graphQLErrors = {
            errors: errorsList
        };
        throw graphQLErrors;
    });

    try {
        await ServerUtils.getServerList();
    } catch (error: any) {
        expect(error.message).toContain(errMsg);
    }

});

it('ServerUtils fail on create server ', async () => {
    const errMsg = 'Testing ServerUtils.createServer error handling';

    jest.spyOn(API, 'graphql').mockImplementation(async (options: GraphQLOptions, additionalHeaders?: { [key: string]: string; } | undefined): Promise<GraphQLResult<any>> => {
        const graphQLError = new GraphQLError(errMsg);
        const errorsList: GraphQLError[] = [graphQLError]
        const graphQLErrors = {
            errors: errorsList
        };
        throw graphQLErrors;
    });

    try {
        await ServerUtils.createServer('baseUrl', 'authUrl', 'tokenUrl', 'clientId',
            'clientSecret', 'scope');
    } catch (error: any) {
        expect(error.message).toContain(errMsg);
    }
});

it('get server ', async () => {
    jest.spyOn(API, 'graphql').mockImplementation(async (options: GraphQLOptions, additionalHeaders?: { [key: string]: string; } | undefined): Promise<GraphQLResult<any>> => {
        mockGraphQlFn(options, additionalHeaders);

        return {
            data: {
                listServers: {
                    items: Constants.serverTestData
                }
            }
        }
    });

    const serverList = await ServerUtils.getServerList();
    expect(mockGraphQlFn).toHaveBeenCalledWith({ query: listServers, authMode: 'API_KEY' }, undefined);

    expect(serverList).toEqual(Constants.serverTestData);
});

it('ServerUil createServer success', async () => {
    jest.spyOn(API, 'graphql').mockImplementation(async (options: GraphQLOptions, additionalHeaders?: { [key: string]: string; } | undefined): Promise<GraphQLResult<any>> => {
        return await mockGraphQlFn(options, additionalHeaders);
    });

    await ServerUtils.createServer('baseUrl', 'authUrl', 'tokenUrl', 'clientId', 'clientSecret', 'scope')

    let serverInput: CreateServersInput = {
        baseUrl: 'baseUrl'
    };

    serverInput.authUrl = 'authUrl';
    serverInput.tokenUrl = 'tokenUrl';
    serverInput.clientID = 'clientId';
    serverInput.clientSecret = 'clientSecret';
    serverInput.scope = 'scope';

    expect(mockGraphQlFn).toHaveBeenCalledWith(({ query: createServers, authMode: 'API_KEY', variables: { input: serverInput } }), undefined);
});
