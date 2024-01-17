export class StringUtils {
    public static format(template: string, ...args: any[]) {
        return template.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] !== 'undefined'
                ? args[number]
                : match;
        });
    }

    public static generateTitleString(obj: Record<string, any> | undefined, ignoreList: string[] = []) {
        if (!obj) {
            return '';
        }

        return Object.entries(obj)
            .filter(([key, value]) => !ignoreList.includes(key) && value !== undefined && value !== null && value !== '')
            .map(([key, value]) => {
                const formattedValue = JSON.stringify(value, null, 2);
                const displayValue = formattedValue.split('\n').length > 1
                    ? formattedValue
                    : formattedValue.replace(/"/g, ''); // Replace double quotes with blank

                return `${StringUtils.insertSpaceAndCapitalize(key)}:\t${displayValue}`;
            })
            .join('\n');
    }

    private static insertSpaceAndCapitalize(str: string) {
        return str.replace(/([A-Z])/g, ' $1').trim().replace(/^\s/, '').split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
}
