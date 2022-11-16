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
        try {
            const res = (await fetch(authenticationUrl, { method: 'HEAD' })).ok;
            if (res) {
                // console.log('Opening window with ' + authenticationUrl);
                window.open(authenticationUrl, '_self');
            } else {
                throw new Error();
            }
        } catch (error: any) {
            throw new Error(Constants.unreachableURL + server.baseUrl);
        }
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
    public static getAccessToken = async (accessCode: string, server: Server): Promise<string> => {
        let accessToken = '';

        const tokenUrl: string = server?.tokenUrl;

        console.log('tokenUrl: ', tokenUrl);

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
                let message = StringUtils.format(Constants.fetchError, tokenUrl, error);
                if (responseStatusText.length > 0 && responseStatusText !== 'OK') {
                    message = StringUtils.format(Constants.fetchError, tokenUrl, responseStatusText);
                }
                throw new Error(message);
            });

        return accessToken;
    }

}
