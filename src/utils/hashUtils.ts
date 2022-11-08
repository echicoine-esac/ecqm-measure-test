export const getHashParams = () => {
    return window.location.hash
        .substring(1)
        .split("&")
        .reduce(function(initial: { [key: string]: any; }, item) {
            if (item) {
                let parts = item.split("=");
                initial[parts[0]] = decodeURIComponent(parts[1]);
            }
            return initial;
        }, {});
}

export const getCodeParam = () => {
    let code = '';
    let url = window.location.href;
    let codeIndex = url.indexOf('code=');
    let ampIndex = url.indexOf('&');
    if (codeIndex !== -1 && ampIndex !== -1) {
        code = url.substring(codeIndex + 5, ampIndex);
    }

    return code;
}

export const removeCodeParam = () => {
    window.history.replaceState({}, document.title, '/');
}

export const removeHashParamsFromUrl = () => {
    window.history.pushState("", document.title, window.location.pathname + window.location.search);
}