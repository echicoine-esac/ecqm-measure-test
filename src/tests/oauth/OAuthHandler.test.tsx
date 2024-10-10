import fetchMock from 'fetch-mock';
import { Constants } from '../../constants/Constants';
import { OAuthHandler } from '../../oauth/OAuthHandler';

const redirectUri = encodeURIComponent(window.location.protocol + '//' + window.location.host + '/r');

const mockWindowOpen = jest.fn((url?: string | URL | undefined, target?: string | undefined, features?: string | undefined): Window => {
      return new Window();
});

const testServer = Constants.testOauthServer;

beforeEach(() => {
      jest.spyOn(window, 'open').mockImplementation((url?: string | URL | undefined, target?: string | undefined, features?: string | undefined): Window => {
            return mockWindowOpen(url, target, features);
      });
      
});


//Rendered invalid by OAuthRedirectLandingPage

// const STATE = '1234state1234';
// const CODE = '4321code4321';

// test('given path, should return valid url', () => {
//       const location = window.location + 
//       const mockedLocation = {
//             ...location,
//             protocol: 'https:',
//             search: 'state=' + STATE + '&code=' + CODE
//       }
//       jest.spyOn(window, 'location', 'get').mockReturnValue(mockedLocation)

//       OAuthHandler.buildHashParams(testServer);
//       expect(OAuthHandler.getStateCode(testServer.baseUrl)).toEqual(STATE)
//       expect(OAuthHandler.getAccessCode(testServer.baseUrl)).toEqual(CODE)

//       // OAuthHandler.clearCachedValues(testServer)
//       // expect(OAuthHandler.getStateCode(testServer)).toEqual('')
//       // expect(OAuthHandler.getAccessCode(testServer)).toEqual('')

//       // OAuthHandler.removeHashParamsFromUrl();
//       // jest.spyOn(window, 'location', 'get').mockRestore()
//       // expect((window.location.search).length).toEqual(0);
// })

test('HashParamUtils: build authentication url ', async () => {
      const authenticationUrl = OAuthHandler.buildAuthenticationUrl(testServer);
      expect(authenticationUrl).toEqual('http://localhost:8080/4/authorize/'
            + '?client_id=SKeK4PfHWPFSFzmy0CeD-pe8'
            + '&redirect_uri=' + redirectUri
            + '&scope=photo+offline_access'
            + '&response_type=code'
            + '&state=' + OAuthHandler.getGeneratedStateCode(testServer.baseUrl));
});

test('HashParamUtils: build random string 16 characters in length ', async () => {
      const stateCode = OAuthHandler.generateRandomStateCode();
      expect(stateCode.length).toEqual(16);
});

// test('OAuthHandler: calls window.open with expected input', async () => {
//       //disable bad url check 
//       fetchMock.head('begin:' + Constants.testOauthServer.authUrl, true);
//       //call getAccessCode to trigger process of opening window with speficially crafted authentication url
//       await OAuthHandler.getAccessCode(testServer.baseUrl);

//       expect(mockWindowOpen).toHaveBeenCalledWith('http://localhost:8080/4/authorize/'
//             + '?client_id=SKeK4PfHWPFSFzmy0CeD-pe8'
//             + '&redirect_uri=' + redirectUri
//             + '&scope=photo+offline_access&response_type=code&state=' + OAuthHandler.getGeneratedStateCode(testServer.baseUrl), '_self', undefined);

//       fetchMock.restore();
// });

test('OAuthHandler: expect POST call structure', async () => {
      fetchMock.post(testServer?.tokenUrl, { access_token: 'access_token_string' });
      expect(await OAuthHandler.establishAccessToken(testServer)).toEqual('access_token_string');
      fetchMock.restore();
});

test('OAuthHandler: fail scenario', async () => {
      fetchMock.post(testServer?.tokenUrl, 404);
      try {
            await OAuthHandler.establishAccessToken(testServer);
      } catch (error: any) {
            expect(error.message).toEqual('Using http://localhost:8080/4/token/ for Access Token caused: Not Found');
      }
      fetchMock.restore();
});