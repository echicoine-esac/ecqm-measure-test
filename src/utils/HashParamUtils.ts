export class HashParamUtils {
    static getHashParams = () => {

        try {
            const params: string[] = new URLSearchParams(window.location.search).toString().split("&");
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
}

