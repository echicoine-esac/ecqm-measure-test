import { Server } from '../models/Server';

export class HashParamUtils {
    private static accessCode = '';
    private static stateCode = '';
    private static generatedStateCode = '';

    /**
     * Builds authentication url based on server data provided by users.
     * Uses randomly generated state code.
     *    example:
          return 'https://www.oauth.com/playground/auth-dialog.html?'
              + 'response_type=code'
              + '&client_id=1X1BcC9ZbfjPm--_vF5O9hfk'
              + '&redirect_uri=http://localhost:3000/'
              + '&scope=photo+offline_access'
              + '&state=' + HashParamUtils.getGeneratedStateCode();
     * @param knowledgeRepo 
     * @returns 
     */
    static buildAuthenticationUrl(knowledgeRepo: Server) {
        //TODO: Ensure stateCode matches generatedStateCode to protect against CSRF attacks.
        HashParamUtils.generatedStateCode = HashParamUtils.generateRandomStateCode();
        //console.log('HashParamUtils generated state code: ' + HashParamUtils.codes.generatedStateCode);

        //store generated code to compare to state code later
        sessionStorage.setItem('generatedStateCode', JSON.stringify(HashParamUtils.generatedStateCode));

        return knowledgeRepo?.authUrl
            + '?client_id=' + knowledgeRepo?.clientID
            + '&redirect_uri=' + knowledgeRepo?.callbackUrl
            + '&scope=' + knowledgeRepo?.scope
            + '&response_type=code'
            + '&state=' + HashParamUtils.getGeneratedStateCode()

    }

    static generateRandomStateCode(): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let ret = '';
        for (let i = 0; i < 16; i++) {
            ret += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return ret;
    }

    static buildHashParams() {
        let generatedStateCode = sessionStorage.getItem('generatedStateCode')?.toString().replace(/\"/g, '');
        if (generatedStateCode) {
            HashParamUtils.generatedStateCode = generatedStateCode;
            sessionStorage.setItem('generatedStateCode', JSON.stringify(''));
        }
        const params: string[] = new URLSearchParams(window.location.search).toString().split('&');
        if (params[0].length === 0) {
            return {
                accessCode: '',
                stateCode: '',
                generatedStateCode: ''
            };
        }
        
        HashParamUtils.stateCode = params[0].split('=')[1];
        HashParamUtils.accessCode = params[1].split('=')[1];

        //SECURITY MEASURE: Ensure stateCode matches generatedStateCode to protect against CSRF attacks.
        if (HashParamUtils.generatedStateCode && HashParamUtils.generatedStateCode !== '') {
            if (HashParamUtils.stateCode !== HashParamUtils.generatedStateCode) {
                //CSRF attack, do something
                throw new Error('HashParamUtils generated state code THAT DOES NOT MATCH returned state code: '
                    + HashParamUtils.generatedStateCode + ', returned state code: ' + HashParamUtils.stateCode);
            }
        }
    }

    static removeCodeParam = () => {
        window.history.replaceState({}, document.title, '/');
    }

    //do not add '/' to end of url, will break application:
    static removeHashParamsFromUrl() {
        window.history.pushState('', document.title, window.location.pathname);
    }

    static clearCachedValues() {
        sessionStorage.setItem('generatedStateCode', JSON.stringify(''));
        HashParamUtils.accessCode = '';
        HashParamUtils.stateCode = '';
        HashParamUtils.generatedStateCode = '';
    }

    static getGeneratedStateCode(): string {
        return HashParamUtils.generatedStateCode
    }

    static getStateCode(): string {
        return HashParamUtils.stateCode
    }

    static getAccessCode(): string {
        return HashParamUtils.accessCode;
    }
}

