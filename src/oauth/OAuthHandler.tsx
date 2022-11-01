import { Constants } from "../constants/Constants";
import { Server } from "../models/Server";
import { StringUtils } from "../utils/StringUtils";

export class OAuthHandler {
    getAccessCode = async (knowledgeRepo: Server) => {
        console.log(knowledgeRepo);
        console.log('AuthURL is ' + knowledgeRepo.authUrl);

        // If the selected server requires OAuth then call the Auth URL to get the code
        // Open a window to the authentication URL to allow them to login and allow scopes

        //  = knowledgeRepo.authUrl
        //     + '?client_id=' + knowledgeRepo.clientID
        //     + '&redirect_uri=' + knowledgeRepo.callbackUrl
        //     + '&scope=' + knowledgeRepo.scope
        //     + '&response_type=code';

        const authenticationUrl =
            'https://www.oauth.com/playground/auth-dialog.html?'
            + 'response_type=code'
            + '&client_id=H6_uhN1hqAIORwuvp96bx_jo'
            + '&redirect_uri=http://localhost:3000'
            + '&scope=photo+offline_access'
            + '&state=ay7UtloU3T3zPxEQ'

        console.log('Opening window with ' + authenticationUrl);

        const win = window as any;

        await win.open(authenticationUrl, '_self').focus();

    }

    getAccessToken = async (accessCode: string): Promise<string> => {
        let accessToken = '';

        // If the selected server requires OAuth, and we have the code then request the token
        console.log('Access code is ' + accessCode);

        // const tokenUrl: string = knowledgeRepo.tokenUrl
        //     + '?grant_type=authorization_code'
        //     + '?client_id=' + knowledgeRepo.clientID
        //     + '&client_secret=' + knowledgeRepo.clientSecret
        //     + '&redirect_uri=' + knowledgeRepo.callbackUrl
        //     + 'code=' + accessCode;

        const tokenUrl: string = 'POST https://authorization-server.com/token/'
            + '?grant_type=authorization_code'
            + '&client_id=H6_uhN1hqAIORwuvp96bx_jo'
            + '&client_secret=oAC1w-XC9UDMi0xlR4rYtplYybC8bSrkf9gJdbuDw4o4HDYq'
            + '&redirect_uri=https://www.oauth.com/playground/authorization-code.html'
            + 'code=' + accessCode;

        console.log('Requesting token with ' + tokenUrl);

        // POST to token URL
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        };

        await fetch(tokenUrl, requestOptions)
            .then((response) => {
                if (response.ok === false) {
                    throw Error(response.statusText);
                }
                return response.json()
            })
            .then((data) => {
                accessToken = data.access_token;
            })
            .catch((error) => {
                let message = StringUtils.format(Constants.fetchError,
                    tokenUrl, error);
                throw new Error(message);
            });
        console.log('accessToken is ' + accessCode);
        return accessToken;
    }


}
