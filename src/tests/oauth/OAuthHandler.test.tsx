import fetchMock from 'fetch-mock';
import { Constants } from '../../constants/Constants';
import { OAuthHandler } from '../../oauth/OAuthHandler';

const redirectUri = encodeURIComponent(window.location.protocol + '//' + window.location.host + '/r');

const mockWindowOpen = jest.fn((url?: string | URL | undefined, target?: string | undefined, features?: string | undefined): Window => {
      return new Window();
});

const testServer = Constants.testOauthServer;

const thisTestFile = "OAuthHandler";

beforeEach(() => {
      jest.clearAllMocks(); // Reset mocks
      jest.spyOn(window, 'open').mockImplementation(mockWindowOpen);

      // Mock sessionStorage
      const storageMock = (() => {
            let store: Record<string, string> = {};
            return {
                  getItem: (key: string) => store[key] || null,
                  setItem: (key: string, value: string) => { store[key] = value; },
                  clear: () => { store = {}; }
            };
      })();
      Object.defineProperty(window, 'sessionStorage', { value: storageMock });
});

test(thisTestFile + ':  establish access code successfully', async () => {
      // Simulate the popup behavior by sending a postMessage with the authCode and state
      const mockPopupWindow = {
            closed: false,
            postMessage: jest.fn(),
            close: jest.fn(),
      };

      // Mock the window.open function to return the mock popup window
      jest.spyOn(window, 'open').mockImplementation(() => mockPopupWindow as unknown as Window);

      // Mock a message event
      const messageEvent = new MessageEvent('message', {
            data: { authCode: 'mockAuthCode', state: 'mockState' },
            origin: window.location.origin,
      });

      // Simulate the message being received
      setTimeout(() => window.dispatchEvent(messageEvent), 100);

      const result = await OAuthHandler.establishAccessCode(testServer);
      expect(result).toBe(true);
      expect(window.sessionStorage.getItem('authCode')).toEqual('mockAuthCode');
      expect(window.sessionStorage.getItem('state')).toEqual('mockState');
});

test(thisTestFile + ':  establish access code fails when popup is closed', async () => {
      const mockPopupWindow = { closed: false, close: jest.fn() };

      // Mock the window.open function
      jest.spyOn(window, 'open').mockImplementation(() => mockPopupWindow as unknown as Window);

      // Simulate the popup closing without receiving a message
      setTimeout(() => { mockPopupWindow.closed = true; }, 100);

      const result = await OAuthHandler.establishAccessCode(testServer);
      expect(result).toBe(false);
});

test(thisTestFile + ':  buildFormData constructs correctly', () => {
      const accessCode = 'testAccessCode';
      const formData = OAuthHandler.buildFormData(accessCode, testServer);

      expect(formData.get('code')).toEqual(accessCode);
      expect(formData.get('client_id')).toEqual(testServer.clientID);
      expect(formData.get('client_secret')).toEqual(testServer.clientSecret);
      expect(formData.get('redirect_uri')).toEqual(redirectUri);
      expect(formData.get('grant_type')).toEqual('authorization_code');
});

test(thisTestFile + ':  build authentication url ', async () => {
      const authenticationUrl = OAuthHandler.buildAuthenticationUrl(testServer);
      expect(authenticationUrl).toEqual('http://localhost:8080/4/authorize/'
            + '?client_id=SKeK4PfHWPFSFzmy0CeD-pe8'
            + '&redirect_uri=' + redirectUri
            + '&scope=photo+offline_access'
            + '&response_type=code'
            + '&state=' + OAuthHandler.getGeneratedStateCode(testServer.baseUrl));
});

test(thisTestFile + ':  build random string 16 characters in length ', async () => {
      const stateCode = OAuthHandler.generateRandomStateCode();
      expect(stateCode.length).toEqual(16);
});

test(thisTestFile + ':  expect POST call structure', async () => {
      fetchMock.post(testServer?.tokenUrl, { access_token: 'access_token_string' });
      expect(await OAuthHandler.establishAccessToken(testServer)).toEqual('access_token_string');
      fetchMock.restore();
});

test(thisTestFile + ':  fail scenario', async () => {
      fetchMock.post(testServer?.tokenUrl, 404);
      try {
            await OAuthHandler.establishAccessToken(testServer);
      } catch (error: any) {
            expect(error.message).toEqual('Using http://localhost:8080/4/token/ for Access Token caused: Not Found');
      }
      fetchMock.restore();
});

