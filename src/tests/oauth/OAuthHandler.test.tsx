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

test('OAuthHandler: calls window.open with expected input', () => {
      //call getAccessCode to trigger process of opening window with speficially crafted authentication url
      OAuthHandler.getAccessCode(testServer);

      expect(mockWindowOpen).toHaveBeenCalledWith('http://localhost:8080/4/authorize/'
            + '?client_id=SKeK4PfHWPFSFzmy0CeD-pe8'
            + '&redirect_uri=http://localhost:8080/4/'
            + '&scope=photo+offline_access&response_type=code&state=' + HashParamUtils.getGeneratedStateCode(), '_self', undefined);
});

test('OAuthHandler: expect POST call structure', async () => {
      const accessCode = 'foo';

      const tokenUrl: string = testServer?.tokenUrl
            + '?grant_type=authorization_code'
            + '&client_id=' + testServer?.clientID
            + '&client_secret=' + testServer?.clientSecret
            + '&redirect_uri=' + testServer?.callbackUrl
            + '&code=' + accessCode;

      fetchMock.post(tokenUrl, { access_token: 'access_token_string' }, {
            method: 'POST',
            headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
            }
      });

      expect(await OAuthHandler.getAccessToken(accessCode, testServer)).toEqual('access_token_string');

      fetchMock.restore();

});

test('OAuthHandler: fail scenario', async () => {
      const accessCode = 'foo';

      const tokenUrl: string = testServer?.tokenUrl
            + '?grant_type=authorization_code'
            + '&client_id=' + testServer?.clientID
            + '&client_secret=' + testServer?.clientSecret
            + '&redirect_uri=' + testServer?.callbackUrl
            + '&code=' + accessCode;

      fetchMock.post(tokenUrl, 404, {
            method: 'POST',
            headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
            }
      });

      try {
            await OAuthHandler.getAccessToken(accessCode, testServer);
      } catch (error: any) {
            expect(error.message).toEqual('Using http://localhost:8080/4/token/'
                  + '?grant_type=authorization_code'
                  + '&client_id=SKeK4PfHWPFSFzmy0CeD-pe8'
                  + '&client_secret=Q_s6HeMPpzjZfNNbtqwFZjvhoXmiw8CPBLp_4tiRiZ_wQLQW'
                  + '&redirect_uri=http://localhost:8080/4/'
                  + '&code=foo to retrieve Error: Not Found caused: {2}');
      }

      fetchMock.restore();
});