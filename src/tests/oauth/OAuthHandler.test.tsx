import fetchMock from 'fetch-mock';
import { OAuthHandler } from '../../oauth/OAuthHandler';
import { HashParamUtils } from '../../utils/HashParamUtils';

const mockWindowOpen = jest.fn((url?: string | URL | undefined, target?: string | undefined, features?: string | undefined): Window => {
      return new Window();
});

const testServer = {
      id: '1',
      baseUrl: 'https://authorization-server.com/',
      authUrl: 'https://authorization-server.com/authorize/',
      tokenUrl: 'https://authorization-server.com/token/',
      callbackUrl: 'https://www.oauth.com/playground/authorization-code.html',
      clientID: 'SKeK4PfHWPFSFzmy0CeD-pe8',
      clientSecret: 'Q_s6HeMPpzjZfNNbtqwFZjvhoXmiw8CPBLp_4tiRiZ_wQLQW',
      scope: 'photo+offline_access'
}

beforeEach(() => {
      jest.spyOn(window, 'open').mockImplementation((url?: string | URL | undefined, target?: string | undefined, features?: string | undefined): Window => {
            return mockWindowOpen(url, target, features);
      });
});

test('OAuthHandler: calls window.open with expected input', () => {
      const oauthHandler = new OAuthHandler(testServer);

      //call getAccessCode to trigger process of opening window with speficially crafted authentication url
      oauthHandler.getAccessCode();

      expect(mockWindowOpen).toHaveBeenCalledWith('https://authorization-server.com/authorize/?client_id=SKeK4PfHWPFSFzmy0CeD-pe8&redirect_uri=https://www.oauth.com/playground/authorization-code.html&scope=photo+offline_access&response_type=code&state=' + HashParamUtils.getSessionData().generatedStateCode, '_self', undefined);
});

test('OAuthHandler: expect POST call structure', async () => {
      const accessCode = 'foo';
      const oauthHandler = new OAuthHandler(testServer);

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

      expect(await oauthHandler.getAccessToken(accessCode)).toEqual('access_token_string');

      fetchMock.restore();

});

test('OAuthHandler: fail scenario', async () => {
      const accessCode = 'foo';
      const oauthHandler = new OAuthHandler(testServer);

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
            await oauthHandler.getAccessToken(accessCode);
      } catch (error: any) {
            expect(error.message).toEqual('Using https://authorization-server.com/token/?grant_type=authorization_code&client_id=SKeK4PfHWPFSFzmy0CeD-pe8&client_secret=Q_s6HeMPpzjZfNNbtqwFZjvhoXmiw8CPBLp_4tiRiZ_wQLQW&redirect_uri=https://www.oauth.com/playground/authorization-code.html&code=foo to retrieve Error: Not Found caused: {2}');
      }

      fetchMock.restore();

});