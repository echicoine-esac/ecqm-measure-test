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
      expect(HashParamUtils.getSessionData()).toEqual({ stateCode: STATE, generatedStateCode: '', accessCode: CODE })

      HashParamUtils.clearCachedValues()
      expect(HashParamUtils.getSessionData()).toEqual({ stateCode: '', generatedStateCode: '', accessCode: '' })

      HashParamUtils.removeHashParamsFromUrl();
      jest.spyOn(window, 'location', 'get').mockRestore()
      expect((window.location.search).length).toEqual(0);
})

test('HashParamUtils: build authentication url ', async () => {
      const authenticationUrl = HashParamUtils.buildAuthenticationUrl(testServer);
      expect(authenticationUrl).toEqual('https://authorization-server.com/authorize/'
            + '?client_id=SKeK4PfHWPFSFzmy0CeD-pe8'
            + '&redirect_uri=https://www.oauth.com/playground/authorization-code.html'
            + '&scope=photo+offline_access'
            + '&response_type=code'
            + '&state=' + HashParamUtils.getSessionData().generatedStateCode);
});

test('HashParamUtils: build random string 16 characters in length ', async () => {
      const stateCode = HashParamUtils.generateRandomStateCode();
      expect(stateCode.length).toEqual(16);
});
