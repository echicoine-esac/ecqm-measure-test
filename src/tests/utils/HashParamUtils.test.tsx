import { Constants } from '../../constants/Constants';
import { HashParamUtils } from '../../utils/HashParamUtils';

const STATE = '1234state1234';
const CODE = '4321code4321';
const testServer = Constants.testOauthServer;

test('given path, should return valid url', () => {
      const location = window.location
      const mockedLocation = {
            ...location,
            protocol: 'https:',
            search: 'state=' + STATE + '&code=' + CODE
      }
      jest.spyOn(window, 'location', 'get').mockReturnValue(mockedLocation)

      HashParamUtils.buildHashParams();
      expect(HashParamUtils.getStateCode()).toEqual(STATE)
      expect(HashParamUtils.getAccessCode()).toEqual(CODE)

      HashParamUtils.clearCachedValues()
      expect(HashParamUtils.getStateCode()).toEqual('')
      expect(HashParamUtils.getAccessCode()).toEqual('')

      HashParamUtils.removeHashParamsFromUrl();
      jest.spyOn(window, 'location', 'get').mockRestore()
      expect((window.location.search).length).toEqual(0);
})

test('HashParamUtils: build authentication url ', async () => {
      const authenticationUrl = HashParamUtils.buildAuthenticationUrl(testServer);
      expect(authenticationUrl).toEqual('http://localhost:8123/4/authorize/'
            + '?client_id=SKeK4PfHWPFSFzmy0CeD-pe8'
            + '&redirect_uri=http://localhost:8123/4/'
            + '&scope=photo+offline_access'
            + '&response_type=code'
            + '&state=' + HashParamUtils.getGeneratedStateCode());
});

test('HashParamUtils: build random string 16 characters in length ', async () => {
      const stateCode = HashParamUtils.generateRandomStateCode();
      expect(stateCode.length).toEqual(16);
});
