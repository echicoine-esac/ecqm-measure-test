import fetchMock from 'fetch-mock';
import { Constants } from '../../constants/Constants';
import { OAuthHandler } from '../../oauth/OAuthHandler';
import { HashParamUtils } from '../../utils/HashParamUtils';

const mockWindowOpen = jest.fn((url?: string | URL | undefined, target?: string | undefined, features?: string | undefined): Window => {
      return new Window();
});

const testServer = Constants.testOauthServer;

beforeEach(() => {
      jest.spyOn(window, 'open').mockImplementation((url?: string | URL | undefined, target?: string | undefined, features?: string | undefined): Window => {
            return mockWindowOpen(url, target, features);
      });
});

test('OAuthHandler: calls window.open with expected input', async () => {
      //disable bad url check 
      fetchMock.head('begin:' + Constants.testOauthServer.authUrl, true);
      //call getAccessCode to trigger process of opening window with speficially crafted authentication url
      await OAuthHandler.getAccessCode(testServer);

      expect(mockWindowOpen).toHaveBeenCalledWith('http://localhost:8080/4/authorize/'
            + '?client_id=SKeK4PfHWPFSFzmy0CeD-pe8'
            + '&redirect_uri=http://localhost:8080/4/'
            + '&scope=photo+offline_access&response_type=code&state=' + HashParamUtils.getGeneratedStateCode(), '_self', undefined);

      fetchMock.restore();
});

test('OAuthHandler: expect POST call structure', async () => {
      fetchMock.post(testServer?.tokenUrl, { access_token: 'access_token_string' });
      expect(await OAuthHandler.getAccessToken('accessCode', testServer)).toEqual('access_token_string');
      fetchMock.restore();
});

test('OAuthHandler: fail scenario', async () => {
      fetchMock.post(testServer?.tokenUrl, 404);
      try {
            await OAuthHandler.getAccessToken('accessCode', testServer);
      } catch (error: any) {
            expect(error.message).toEqual('Using http://localhost:8080/4/token/ to retrieve Error: Not Found caused: {2}');
      }
      fetchMock.restore();
});