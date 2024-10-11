import { Constants } from '../constants/Constants';
import { Server } from '../models/Server';

import { StringUtils } from '../utils/StringUtils';

export type AuthenticationInfo = {
    accessCode: string,
    stateCode: string,
    generatedStateCode: string,
    accessToken: string
}

const redirectUri = encodeURIComponent(window.location.protocol + '//' + window.location.host + '/r');


export class OAuthHandler {
    public static readonly cachedAuthenticationByServer = new Map<string, AuthenticationInfo>();

    /**
     * Builds authentication url based on server data provided by users.
     * Uses randomly generated state code.
     *    example:
          return 'https://www.oauth.com/playground/auth-dialog.html?'
              + 'response_type=code'
              + '&client_id=GFMxUDilucynHYW25BbGgNAI'
              + '&redirect_uri=http://localhost:3000/'
              + '&scope=photo+offline_access'
              + '&state=' + OAuthHandler.getGeneratedStateCode();
     * @param selectedServer 
     * @returns 
     */
    static buildAuthenticationUrl(selectedServer: Server) {
        let authenticationInfo: AuthenticationInfo | undefined;

        if (OAuthHandler.cachedAuthenticationByServer.has(selectedServer.baseUrl)) {
            authenticationInfo = OAuthHandler.cachedAuthenticationByServer.get(selectedServer.baseUrl);
        }
        if (!authenticationInfo) {
            authenticationInfo = {
                accessCode: '',
                stateCode: '',
                generatedStateCode: '',
                accessToken: ''
            }
        }

        authenticationInfo.generatedStateCode = OAuthHandler.generateRandomStateCode();
        //console.log('HashParamUtils generated state code: ' + OAuthHandler.codes.generatedStateCode);

        OAuthHandler.cachedAuthenticationByServer.set(selectedServer.baseUrl, authenticationInfo);

        return selectedServer?.authUrl
            + '?client_id=' + selectedServer?.clientID
            + '&redirect_uri=' + redirectUri
            + '&scope=' + selectedServer?.scope
            + '&response_type=code'
            + '&state=' + authenticationInfo.generatedStateCode

    }

    static generateRandomStateCode(): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let ret = '';
        for (let i = 0; i < 16; i++) {
            ret += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return ret;
    }

    static buildHashParams(selectedServer: Server) {
        let authenticationInfo: AuthenticationInfo | undefined = OAuthHandler.cachedAuthenticationByServer.get(selectedServer.baseUrl);

        if (!authenticationInfo?.generatedStateCode) {
            return {
                accessCode: '',
                stateCode: '',
                generatedStateCode: '',
                accessToken: ''
            };
        }
        const authCode = sessionStorage.getItem('authCode');
        const state = sessionStorage.getItem('state');

        if (authCode && state) {
            authenticationInfo.stateCode = authCode;
            authenticationInfo.accessCode = state;
        }

    }


    static getGeneratedStateCode(selectedServerUrl: string): string | undefined {
        return OAuthHandler.cachedAuthenticationByServer.get(selectedServerUrl)?.generatedStateCode
    }

    static getStateCode(selectedServerUrl: string): string | undefined {
        return OAuthHandler.cachedAuthenticationByServer.get(selectedServerUrl)?.stateCode
    }

    static getAccessCode(selectedServerUrl: string): string | undefined {
        return OAuthHandler.cachedAuthenticationByServer.get(selectedServerUrl)?.accessCode
    }

    static buildFormData(accessCode: string, server: Server): FormData {
        const formData = new FormData();
        formData.append('code', accessCode);
        formData.append('client_id', server.clientID);
        formData.append('client_secret', server.clientSecret);
        formData.append('redirect_uri', redirectUri);
        formData.append('grant_type', 'authorization_code');

        return formData;
    }


    public static async establishAccessCode(server: Server): Promise<boolean> {
        if (!server?.authUrl || server?.authUrl.length === 0){
            return Promise.resolve(false);
        }
        //process completed normally before for this server (identified by baseUrl), return cached accesscode:
        const authenticationInfo: AuthenticationInfo | undefined = OAuthHandler.cachedAuthenticationByServer.get(server.baseUrl);
        if (authenticationInfo && authenticationInfo.accessCode?.length > 0) {
            return Promise.resolve(true);
        }

        const authenticationUrl = OAuthHandler.buildAuthenticationUrl(server);

        // Open the authentication popup
        const popupWindow = window.open(authenticationUrl, '_blank', 'width=600,height=800');
        if (!popupWindow) {
            alert('Please allow pop-ups for this site');
            return false;
        }

        return new Promise((resolve) => {
            let messageReceived = false;

            // Listen for the message from the popup
            const messageListener = (event: MessageEvent) => {
                if (event.origin !== window.location.origin) {
                    return; // Ignore messages from unknown origins
                }

                const { authCode, state } = event.data;

                if (authCode && state) {
                    // Store the authCode and state
                    sessionStorage.setItem('authCode', authCode);
                    sessionStorage.setItem('state', state);

                    messageReceived = true;

                    // Cleanup: Remove the listener since we received the message
                    window.removeEventListener('message', messageListener);
                    // Resolve the promise
                    resolve(true);
                }
            };

            window.addEventListener('message', messageListener);

            // Periodically check if the popup has been closed
            const popupCheckInterval = setInterval(() => {
                if (popupWindow.closed) {
                    // Cleanup: Remove the message listener and clear the interval
                    clearInterval(popupCheckInterval);
                    window.removeEventListener('message', messageListener);

                    // If the popup closed without receiving a message, resolve as failed
                    if (!messageReceived) {
                        resolve(false);
                    }
                }
            }, 500); // Check every 500 milliseconds

            setTimeout(() => {
                if (!messageReceived) {
                    // console.log('OAuth process timed out after 5 minutes.');
                    window.removeEventListener('message', messageListener);

                    // Resolve the promise with a failure state
                    resolve(false);
                }
            }, 150000); // 2.5 minutes
        });
    }

    /**
     * Gets the access token used for further queries by building a tokenUrl and passing in accessCode
     * 
     * example:
      const tokenUrl: string = 'https://authorization-server.com/token/'
      + '?grant_type=authorization_code'
      + '&client_id=GFMxUDilucynHYW25BbGgNAI'
      + '&client_secret=niQMHhsBbIbIa_M2iot9rfEeVsDn3DXMKZ5PYqMcq1JSEX4w'
      + '&redirect_uri=http://localhost:3000/'
      + '&code=' + accessCode; 
     * 
     * @param accessCode 
     * @returns 
     */

    public static async establishAccessToken(server: Server): Promise<string> {

        const authenticationInfo: AuthenticationInfo | undefined = OAuthHandler.cachedAuthenticationByServer.get(server.baseUrl);

        if (!authenticationInfo) {
            return '';
        }

        if (authenticationInfo.accessToken?.length > 0) {
            return authenticationInfo.accessToken;
        }

        let accessToken = '';
        const tokenUrl: string = server?.tokenUrl;
        // console.log('Requesting token with ' + server.tokenUrl);
        const formData = OAuthHandler.buildFormData(authenticationInfo.accessCode, server);

        // POST to token URL
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        };

        // for (let pair of formData.entries()) {
        //     console.log(pair[0] + ',' + pair[1]);
        // }

        let responseStatusText = '';

        await fetch(tokenUrl, requestOptions)
            .then((response) => {
                responseStatusText = response?.statusText;
                return response.json()
            })
            .then((data) => {
                accessToken = data.access_token;
            })
            .catch((error) => {
                let message = StringUtils.format(Constants.fetchError, tokenUrl, 'Access Token', error);
                if (responseStatusText.length > 0 && responseStatusText !== 'OK') {
                    message = StringUtils.format(Constants.fetchError, tokenUrl, 'Access Token', responseStatusText);
                }
                throw new Error(message);
            });


        //cache the accessToken
        authenticationInfo.accessToken = accessToken;
        OAuthHandler.cachedAuthenticationByServer.set(server.baseUrl, authenticationInfo);

        return accessToken;
    }

}
