
export class StringUtils {
    static shrinkUrlDisplay(baseUrl: string) {
        return baseUrl.replace('http://', '').replace('https://', '').substring(0, 20) + '...';
    }
    public static format(template: string, ...args: any[]) {
        return template.replaceAll(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    };
}