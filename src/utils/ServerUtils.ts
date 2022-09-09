import { Amplify, API } from 'aws-amplify';
import awsExports from "../aws-exports";
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

    public static refreshServerList = async (): Promise<Array<Server>> => {
        ServerUtils.listOfServers = [];
        return await ServerUtils.getServerList();
    }

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

