
export class StringUtils {
    public static format(template: string, ...args: any[]) {
        return template.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    };
}