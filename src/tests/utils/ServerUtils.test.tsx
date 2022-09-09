import { GraphQLResult } from '@aws-amplify/api';
import { GraphQLOptions } from '@aws-amplify/api-graphql/lib-esm/types/index';
import { GraphQLError } from 'graphql/error/GraphQLError';
import { API } from 'aws-amplify';
import { ServerUtils } from '../../utils/ServerUtils';

const mockCreateServerFn = jest.fn();

const mockGraphQlFn = jest.fn(async (): Promise<GraphQLResult<any>> => {
    return new Promise<GraphQLResult<any>>((resolve, reject) => { });
});

it('ServerUtils fail on get server ', async () => {
    const errMsg = 'Testing ServerUtils.getServerList error handling';

    jest.spyOn(API, 'graphql').mockImplementation(async (options: GraphQLOptions, additionalHeaders?: { [key: string]: string; } | undefined): Promise<GraphQLResult<any>> => {
        const graphQLError = new GraphQLError(errMsg);
        const errorsList: GraphQLError[] = [graphQLError]
        const graphQLErrors =  {
            errors: errorsList
        };
        throw  graphQLErrors;
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
        const graphQLErrors =  {
            errors: errorsList
        };
        throw  graphQLErrors;
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
        return await mockGraphQlFn();
    });

    const serverList = await ServerUtils.getServerList();
    expect(mockGraphQlFn).toHaveBeenCalled();
});

it('success example', async () => {
    jest.spyOn(API, 'graphql').mockImplementation(async (options: GraphQLOptions, additionalHeaders?: { [key: string]: string; } | undefined): Promise<GraphQLResult<any>> => {
        return await mockGraphQlFn();
    });

    await ServerUtils.createServer('baseUrl', 'authUrl', 'tokenUrl', 'clientId', 'clientSecret', 'scope')
    expect(mockGraphQlFn).toHaveBeenCalled();
});

