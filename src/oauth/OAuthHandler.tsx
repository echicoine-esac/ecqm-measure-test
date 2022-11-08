import { Constants } from '../constants/Constants';
import { Server } from '../models/Server';
import { HashParamUtils } from '../utils/HashParamUtils';
import { StringUtils } from '../utils/StringUtils';

export class OAuthHandler {
   public static getAccessCode = async (server: Server) => {
        // console.log(this.knowledgeRepo);
        // console.log('AuthURL is ' + this.knowledgeRepo.authUrl);
        const authenticationUrl = HashParamUtils.buildAuthenticationUrl(server);

        // console.log('Opening window with ' + authenticationUrl);
        window.open(authenticationUrl, '_self');
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

        // If the selected server requires OAuth, and we have the code then request the token
        //console.log('Access code is ' + accessCode);
        const tokenUrl: string = server?.tokenUrl
            + '?grant_type=authorization_code'
            + '&client_id=' + server?.clientID
            + '&client_secret=' + server?.clientSecret
            + '&redirect_uri=' + server?.callbackUrl
            + '&code=' + accessCode;

        // console.log('tokenurl: ' + tokenUrl);
        // POST to token URL
        await fetch(tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then((response) => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.json()
        }).then((data) => {
            accessToken = data.access_token;
        }).catch((error) => {
            let message = StringUtils.format(Constants.fetchError, tokenUrl, error);
            // console.log('OAuthHandler: ' + message, error);
            throw new Error(message);
        });

        // console.log('accessToken is ' + accessToken);
        return accessToken;
    }

}
