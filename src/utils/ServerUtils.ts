import { Amplify, API } from 'aws-amplify';
import { CreateServersInput } from '../API';
import awsExports from "../aws-exports";
import { createServers } from '../graphql/mutations';
import { listServers } from "../graphql/queries";
import { Server } from "../models/Server";

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
            ServerUtils.listOfServers = [];
            const aErr = err as any;
            if (aErr?.errors) {
                throw new Error('Error fetching servers: \n' + aErr?.errors);
            }
        }

        return ServerUtils.listOfServers;
    };

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
            await API.graphql({ query: createServers, authMode: "API_KEY", variables: { input: serverInput } })
        } catch (err) {
            const aErr = err as any;
            if (aErr?.errors) {
                throw new Error('Error creating server: \n' + aErr?.errors);
            }

        }

        // If we added a server then we should fetch the list again
        ServerUtils.listOfServers = [];
        await ServerUtils.getServerList();
    }

    //testing purposes:
    public static buildServerTestData(): Server[] {
        return [ServerUtils.buildAServer('1'), ServerUtils.buildAServer('2'), ServerUtils.buildAServer('3')]
    }

    private static buildAServer(count: string): Server {
        return {
            id: 'ec2345-' + count,
            baseUrl: 'http://localhost:8080/' + count,
            authUrl: '',
            tokenUrl: '',
            callbackUrl: '',
            clientID: '',
            clientSecret: '',
            scope: ''
        }
    }
}

