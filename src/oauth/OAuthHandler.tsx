import { Constants } from '../constants/Constants';
import { Server } from '../models/Server';
import { HashParamUtils } from '../utils/HashParamUtils';
import { StringUtils } from '../utils/StringUtils';

export class OAuthHandler {

    static buildFormData(accessCode: string, server: Server): FormData {
        const formData = new FormData();
        formData.append('code', accessCode);
        formData.append('client_id', server.clientID);
        formData.append('client_secret', server.clientSecret);
        formData.append('redirect_uri', server.callbackUrl);
        formData.append('grant_type', 'authorization_code');

        return formData;
    }
    public static getAccessCode = async (server: Server) => {
        // console.log(this.knowledgeRepo);
        // console.log('AuthURL is ' + this.knowledgeRepo.authUrl);
        const authenticationUrl = HashParamUtils.buildAuthenticationUrl(server);

        //check if url is even reachable:

        const unreachable = 'The target URL is unreachable: ';

        try {
            const res = (await fetch(server.baseUrl, { method: 'HEAD' })).ok;
            if (res) {
                // console.log('Opening window with ' + authenticationUrl);
                window.open(authenticationUrl, '_self');
            } else {
               throw new Error();
            }
        } catch (error: any) {
            throw new Error(unreachable + server.baseUrl);
        }
    }

    /**
     * Gets the access token used for further queries by building a tokenUrl and passing in accessCode
     * 
     * example:
      const tokenUrl: string = 'https://authorization-server.com/token/'
      + '?grant_type=authorization_code'
      + '&client_id=1X1BcC9ZbfjPm--_vF5O9hfk'
      + '&client_secret=j49EZy77p1S1-UZ3zH79NMFi2rTfQt7dTcaA8blfTSeBHwYh'
      + '&redirect_uri=http://localhost:3000/'
      + '&code=' + accessCode; 
     * 
     * @param accessCode 
     * @returns 
     */
    public static getAccessToken = async (accessCode: string, server: Server): Promise<string> => {
        let accessToken = '';

        const tokenUrl: string = server?.tokenUrl
            + '?grant_type=authorization_code'
            + '&client_id=' + server?.clientID
            + '&client_secret=' + server?.clientSecret
            + '&redirect_uri=' + server?.callbackUrl
            + '&code=' + accessCode;

        // console.log('Requesting token with ' + server.tokenUrl);
        const formData = OAuthHandler.buildFormData(accessCode, server);

        // POST to token URL
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        };

        // for (let pair of formData.entries()) {
        //     console.log(pair[0] + ',' + pair[1]);
        // }

        await fetch(tokenUrl, requestOptions)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.json()
            })
            .then((data) => {
                accessToken = data.access_token;
            })
            .catch((error) => {
                let message = StringUtils.format(Constants.fetchError, tokenUrl, error);
                throw new Error(message);
            });

        return accessToken;
    }

}
