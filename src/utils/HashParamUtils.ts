import { Server } from '../models/Server';

export type SessionCodes = {
    accessCode: string;
    stateCode: string;
    generatedStateCode: string;
};

export class HashParamUtils {
    private static codes: SessionCodes = {
        accessCode: '',
        stateCode: '',
        generatedStateCode: ''
    };

    /**
     * Builds authentication url based on server data provided by users.
     * Uses randomly generated state code.
     *     example:
     *     return 'https://www.oauth.com/playground/auth-dialog.html?'
     *         + 'response_type=code'
     *         + '&client_id=H6_uhN1hqAIORwuvp96bx_jo'
     *         + '&redirect_uri=http://localhost:3000/'
     *         + '&scope=photo+offline_access'
     *         + '&state=' + HashParamUtils.codes.generatedStateCode;
     * @param knowledgeRepo 
     * @returns 
     */
    static buildAuthenticationUrl(knowledgeRepo: Server) {
        //TODO: Ensure stateCode matches generatedStateCode to protect against CSRF attacks.
        HashParamUtils.codes.generatedStateCode = HashParamUtils.generateRandomStateCode();
        //console.log('HashParamUtils generated state code: ' + HashParamUtils.codes.generatedStateCode);
        return knowledgeRepo?.authUrl
            + '?client_id=' + knowledgeRepo?.clientID
            + '&redirect_uri=' + knowledgeRepo?.callbackUrl
            + '&scope=' + knowledgeRepo?.scope
            + '&response_type=code'
            + '&state=' + HashParamUtils.codes.generatedStateCode
    }

    static generateRandomStateCode() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let ret = '';
        for (let i = 0; i < 16; i++) {
            ret += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return ret.toString();
    }

    static buildHashParams(): SessionCodes {
        //console.log('HashParamUtils.buildHashParams generatedStateCode:' + HashParamUtils.codes.generatedStateCode)

        const params: string[] = new URLSearchParams(window.location.search).toString().split('&');

        //console.log('HashParamUtils.buildHashParams params: ' + params);
        if (params[0].length === 0) {
            //console.log('HashParamUtils.buildHashParams params: no parameters found in URL');
            //no parameters in the url bar
            return {
                accessCode: '',
                stateCode: '',
                generatedStateCode: ''
            };
        }

        HashParamUtils.codes.stateCode = params[0].split('=')[1];
        HashParamUtils.codes.accessCode = params[1].split('=')[1];

        //console.log('HashParamUtils.buildHashParams stateCode:' + HashParamUtils.codes.stateCode);
        //console.log('HashParamUtils.buildHashParams accessCode:' + HashParamUtils.codes.stateCode);

        //SECURITY MEASURE: Ensure stateCode matches generatedStateCode to protect against CSRF attacks.
        if (HashParamUtils.codes.generatedStateCode.length > 0) {
            if (HashParamUtils.codes.stateCode !== HashParamUtils.codes.generatedStateCode) {
                //CSRF attack, do something
                throw new Error('HashParamUtils generated state code THAT DOES NOT MATCH returned state code: '
                    + HashParamUtils.codes.generatedStateCode + ', returned state code: ' + HashParamUtils.codes.stateCode);
            } else {
                //console.log('HashParamUtils generated state code matches returned state code: ' + HashParamUtils.codes.generatedStateCode);
            }
        }

        return HashParamUtils.codes;
    }

    //do not add '/' to end of url, will break application:
    static removeHashParamsFromUrl() {
        window.history.pushState('', document.title, window.location.pathname);
    }

    static getSessionData() {
        return HashParamUtils.codes;
    }

    static clearCachedValues() {
        HashParamUtils.codes = {
            accessCode: '',
            stateCode: '',
            generatedStateCode: ''
        };
    }
}

