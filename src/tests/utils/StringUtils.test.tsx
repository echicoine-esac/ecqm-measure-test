import { StringUtils } from '../../utils/StringUtils';
test('formats string properly', () => {
    const myString: string = 'page={0}&id={1}';
    const formattedWithFormat = StringUtils.format(myString, 123, 456);
    expect(formattedWithFormat).toEqual('page=123&id=456');
});