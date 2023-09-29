
export class StringUtils {
    public static format(template: string, ...args: any[]) {
        return template.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    };

    public static getPatId(pat: string) {
        if (pat.indexOf(' - ') > 0) {
            return pat.split(' - ')[1];
        }
        return pat;
    }
}