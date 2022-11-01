export class HashParamUtils {

    private static accessCode = '';

    static getHashParams = () => {

        try {
            const params: string[] = new URLSearchParams(window.location.search).toString().split("&");
            HashParamUtils.accessCode = params[1].split('=')[1];
            return {
                state: params[0].split('=')[1],
                code: params[1].split('=')[1]
            }
        } catch (error: any) {
            return {
                state: '',
                code: ''
            }
        }
    }

    static removeHashParamsFromUrl = () => {
        window.history.pushState("", document.title, window.location.pathname);
    }

    static getAccessCode() {
        return HashParamUtils.accessCode;
    }

    static clear() {
        HashParamUtils.accessCode = '';
    }
}

