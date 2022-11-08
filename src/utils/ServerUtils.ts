import { Amplify, API } from 'aws-amplify';
import { listServers } from '../graphql/queries';
import { Server } from '../models/Server';
import awsExports from '../aws-exports';
import { CreateServersInput } from '../API';
import { createServers } from '../graphql/mutations';

Amplify.configure(awsExports);

export class ServerUtils {
    private static listOfServers: Array<Server>;

    // Handle server queries and mutations
    // Fetches the list of stored servers
    public static getServerList = async (): Promise<Array<Server>> => {

        //returned cached version if populated
        if (ServerUtils.listOfServers && ServerUtils.listOfServers.length > 0) return ServerUtils.listOfServers;

        try {
            const apiData: any = await API.graphql({ query: listServers, authMode: 'API_KEY' });
            ServerUtils.listOfServers = apiData.data.listServers.items;
        } catch (err) {
            const error = err as any;
            if (error?.errors) {
                throw new Error ('Error fetching servers: \n' + error.errors);
            }
        }


        return ServerUtils.listOfServers;
        
        // let s = {
        //     id: '1',
        //     baseUrl: 'https://authorization-server.com/',
        //     authUrl: 'https://authorization-server.com/authorize/',
        //     tokenUrl: 'https://authorization-server.com/token/',
        //     callbackUrl: 'https://www.oauth.com/playground/authorization-code.html',
        //     clientID: 'SKeK4PfHWPFSFzmy0CeD-pe8',
        //     clientSecret: 'Q_s6HeMPpzjZfNNbtqwFZjvhoXmiw8CPBLp_4tiRiZ_wQLQW',
        //     scope: 'photo+offline_access'
        // }
        // let sList = [s];

        // return sList;
    };

    private static refreshServerList = async (): Promise<Array<Server>> => {
        ServerUtils.listOfServers = [];
        return await ServerUtils.getServerList();
    }

    // Uses the GraphQL API to create a server
    public static createServer = async (baseUrl: string, authUrl: string, tokenUrl: string, clientId: string,
        clientSecret: string, scope: string) => {
        try {
            let serverInput: CreateServersInput = {
                baseUrl: baseUrl
            };
            if (authUrl !== '') {
                serverInput.authUrl = authUrl;
                serverInput.callbackUrl = 'http://localhost/callback';
            }
            if (tokenUrl !== '') {
                serverInput.tokenUrl = tokenUrl;
            }
            if (clientId !== '') {
                serverInput.clientID = clientId;
            }
            if (clientSecret !== '') {
                serverInput.clientSecret = clientSecret;
            }
            if (scope !== '') {
                serverInput.scope = scope;
            }
            await API.graphql({ query: createServers, authMode: 'API_KEY', variables: { input: serverInput } })
        } catch (err) {
            const error = err as any;
            if (error?.errors) {
                throw new Error('Error creating server: \n' + error.errors);
            }

        }

        // If we added a server then we should fetch the list again
        await ServerUtils.refreshServerList();
    }

}

