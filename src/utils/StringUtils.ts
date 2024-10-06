
export class StringUtils {
    public static format(template: string, ...args: any[]) {
        return template.replaceAll(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    };

    public static formatDisplayURL(url: string) : string {
        return url.replaceAll('&', '\n\r\t&').replaceAll('?', '\n\r\t?');
    }
}