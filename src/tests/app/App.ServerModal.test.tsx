import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import App from '../../App';
import { Constants } from '../../constants/Constants';

import { ServerUtils } from '../../utils/ServerUtils';

const thisTestFile = "Server Modal";
//mock getServerList and createServer entirely. API.graphQL calls are mocked in ServerUtils.test.tsx
beforeEach(() => {
  //clean up any missed mocks
  jest.restoreAllMocks();
  fetchMock.restore();

  //override getServerList to return test data
  jest.spyOn(ServerUtils, 'getServerList').mockImplementation(async () => {
    return Constants.serverTestData;
  });



  //reset the selected knowledge repo stored in sessionStorage
  sessionStorage.setItem('selectedKnowledgeRepo', JSON.stringify(''));

  //override any calls directly to 127.0.0.1:8080, simply return result.ok set to true;
  fetchMock.mock('begin:http://127.0.0.1:8080', true);

});

beforeAll(() => {
  global.URL.createObjectURL = jest.fn();
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

//SERVER MODAL
test(thisTestFile + ': success scenario: create new server button opens modal', async () => {

  const form = 'server-model-form';
  const baseUrlText = 'server-model-baseurl-text';
  const authUrlText = 'server-model-authurl-text';
  const accessUrlText = 'server-model-accessurl-text';
  const clientIdText = 'server-model-clientid-text';
  const clientSecretText = 'server-model-clientsecret-text';
  const scopeText = 'server-model-scope-text';
  const cancelButton = 'server-model-cancel-button';
  const submitButton = 'server-model-submit-button';

  await act(async () => {
    render(<App />);
  });

  await act(async () => {
    const addServerButton: HTMLButtonElement = screen.getByTestId('knowledge-repo-server-add-button');
    fireEvent.click(addServerButton);
  });

  const formField: HTMLFormElement = screen.getByTestId(form);
  const baseUrlTextField: HTMLInputElement = screen.getByTestId(baseUrlText);
  const authUrlTextField: HTMLInputElement = screen.getByTestId(authUrlText);
  const accessUrlTextField: HTMLInputElement = screen.getByTestId(accessUrlText);
  const clientIdTextField: HTMLInputElement = screen.getByTestId(clientIdText);
  const clientSecretTextField: HTMLInputElement = screen.getByTestId(clientSecretText);
  const scopeTextField: HTMLInputElement = screen.getByTestId(scopeText);
  const cancelButtonField: HTMLButtonElement = screen.getByTestId(cancelButton);
  const submitButtonField: HTMLButtonElement = screen.getByTestId(submitButton);

  expect(formField).toBeInTheDocument();
  expect(baseUrlTextField).toBeInTheDocument();
  expect(authUrlTextField).toBeInTheDocument();
  expect(accessUrlTextField).toBeInTheDocument();
  expect(clientIdTextField).toBeInTheDocument();
  expect(clientSecretTextField).toBeInTheDocument();
  expect(scopeTextField).toBeInTheDocument();
  expect(cancelButtonField).toBeInTheDocument();
  expect(submitButtonField).toBeInTheDocument();

});


test(thisTestFile + ': success scenario: createServer called with data', async () => {
  const mockCreateServerFn = jest.fn();
  const createServerJest = jest.spyOn(ServerUtils, 'createServer').mockImplementation(async (baseUrl: string, authUrl: string, tokenUrl: string, clientId: string,
    clientSecret: string, scope: string) => {
    return await mockCreateServerFn(baseUrl, authUrl, tokenUrl, clientId,
      clientSecret, scope);
  });

  const baseUrlText = 'server-model-baseurl-text';
  const authUrlText = 'server-model-authurl-text';
  const accessUrlText = 'server-model-accessurl-text';
  const clientIdText = 'server-model-clientid-text';
  const scopeText = 'server-model-scope-text';
  const submitButton = 'server-model-submit-button';

  await act(async () => {
    render(<App />);
  });

  await act(async () => {
    const addServerButton: HTMLButtonElement = screen.getByTestId('knowledge-repo-server-add-button');
    fireEvent.click(addServerButton);
  });

  const baseUrlTextField: HTMLInputElement = screen.getByTestId(baseUrlText);
  const authUrlTextField: HTMLInputElement = screen.getByTestId(authUrlText);
  const accessUrlTextField: HTMLInputElement = screen.getByTestId(accessUrlText);
  const clientIdTextField: HTMLInputElement = screen.getByTestId(clientIdText);
  const scopeTextField: HTMLInputElement = screen.getByTestId(scopeText);
  const submitButtonField: HTMLButtonElement = screen.getByTestId(submitButton);


  userEvent.type(baseUrlTextField, 'http://localhost:8080/baseUrl/');
  userEvent.type(authUrlTextField, 'http://localhost:8080/authUrl/');
  userEvent.type(accessUrlTextField, 'http://localhost:8080/accessUrl/');
  userEvent.type(clientIdTextField, 'clientId');
  userEvent.type(scopeTextField, 'Scope');

  fireEvent.click(submitButtonField);

  expect(mockCreateServerFn).toHaveBeenCalledWith(
    'http://localhost:8080/baseUrl/',
    'http://localhost:8080/authUrl/',
    'http://localhost:8080/accessUrl/',
    'clientId',
    '',
    'user/*.readScope');

  createServerJest.mockRestore();
});


test(thisTestFile + ': fail scenario: createServer throws error', async () => {
  const createServerJest = jest.spyOn(ServerUtils, 'createServer').mockImplementation(async (baseUrl: string, authUrl: string, tokenUrl: string, clientId: string,
    clientSecret: string, scope: string) => {
    throw new Error(Constants.fetch_BAD_REQUEST);
  });

  const baseUrlText = 'server-model-baseurl-text';
  const authUrlText = 'server-model-authurl-text';
  const accessUrlText = 'server-model-accessurl-text';
  const clientIdText = 'server-model-clientid-text';
  const scopeText = 'server-model-scope-text';
  const submitButton = 'server-model-submit-button';

  await act(async () => {
    render(<App />);
  });

  await act(async () => {
    const addServerButton: HTMLButtonElement = screen.getByTestId('knowledge-repo-server-add-button');
    fireEvent.click(addServerButton);
  });

  const baseUrlTextField: HTMLInputElement = screen.getByTestId(baseUrlText);
  const authUrlTextField: HTMLInputElement = screen.getByTestId(authUrlText);
  const accessUrlTextField: HTMLInputElement = screen.getByTestId(accessUrlText);
  const clientIdTextField: HTMLInputElement = screen.getByTestId(clientIdText);
  const scopeTextField: HTMLInputElement = screen.getByTestId(scopeText);
  const submitButtonField: HTMLButtonElement = screen.getByTestId(submitButton);


  userEvent.type(baseUrlTextField, 'http://localhost:8080/baseUrl/');
  userEvent.type(authUrlTextField, 'http://localhost:8080/authUrl/');
  userEvent.type(accessUrlTextField, 'http://localhost:8080/accessUrl/');
  userEvent.type(clientIdTextField, 'clientId');
  userEvent.type(scopeTextField, 'Scope');


  await act(async () => {
    fireEvent.click(submitButtonField);
  });

  const resultsTextField: HTMLElement = screen.getByTestId('results-text');
  expect(resultsTextField.textContent).toEqual(Constants.fetch_BAD_REQUEST);

  createServerJest.mockRestore();
});

test(thisTestFile + ': fail scenario: createServer called with no base url', async () => {
  const mockCreateServerFn = jest.fn();
  const createServerJest = jest.spyOn(ServerUtils, 'createServer').mockImplementation(async (baseUrl: string, authUrl: string, tokenUrl: string, clientId: string,
    clientSecret: string, scope: string) => {
    return await mockCreateServerFn(baseUrl, authUrl, tokenUrl, clientId,
      clientSecret, scope);
  });

  const authUrlText = 'server-model-authurl-text';
  const accessUrlText = 'server-model-accessurl-text';
  const clientIdText = 'server-model-clientid-text';
  const scopeText = 'server-model-scope-text';
  const submitButton = 'server-model-submit-button';

  await act(async () => {
    render(<App />);
  });

  await act(async () => {
    const addServerButton: HTMLButtonElement = screen.getByTestId('knowledge-repo-server-add-button');
    fireEvent.click(addServerButton);
  });

  const authUrlTextField: HTMLInputElement = screen.getByTestId(authUrlText);
  const accessUrlTextField: HTMLInputElement = screen.getByTestId(accessUrlText);
  const clientIdTextField: HTMLInputElement = screen.getByTestId(clientIdText);
  const scopeTextField: HTMLInputElement = screen.getByTestId(scopeText);
  const submitButtonField: HTMLButtonElement = screen.getByTestId(submitButton);

  userEvent.type(authUrlTextField, 'http://localhost:8080/authUrl/');
  userEvent.type(accessUrlTextField, 'http://localhost:8080/accessUrl/');
  userEvent.type(clientIdTextField, 'clientId');
  userEvent.type(scopeTextField, 'Scope');

  fireEvent.click(submitButtonField);

  const baseUrlTextFieldError: HTMLDivElement = screen.getByTestId('server-model-baseurl-feedback')

  expect(baseUrlTextFieldError.innerHTML).toEqual(Constants.error_url);

  createServerJest.mockRestore();
});


test(thisTestFile + ': fail scenario: createServer called with bad url (no http://)', async () => {
  const mockCreateServerFn = jest.fn();
  const createServerJest = jest.spyOn(ServerUtils, 'createServer').mockImplementation(async (baseUrl: string, authUrl: string, tokenUrl: string, clientId: string,
    clientSecret: string, scope: string) => {
    return await mockCreateServerFn(baseUrl, authUrl, tokenUrl, clientId,
      clientSecret, scope);
  });

  const baseUrlText = 'server-model-baseurl-text';
  const authUrlText = 'server-model-authurl-text';
  const accessUrlText = 'server-model-accessurl-text';
  const clientIdText = 'server-model-clientid-text';
  const scopeText = 'server-model-scope-text';
  const submitButton = 'server-model-submit-button';

  await act(async () => {
    render(<App />);
  });

  await act(async () => {
    const addServerButton: HTMLButtonElement = screen.getByTestId('knowledge-repo-server-add-button');
    fireEvent.click(addServerButton);
  });

  const baseUrlTextField: HTMLInputElement = screen.getByTestId(baseUrlText);
  const authUrlTextField: HTMLInputElement = screen.getByTestId(authUrlText);
  const accessUrlTextField: HTMLInputElement = screen.getByTestId(accessUrlText);
  const clientIdTextField: HTMLInputElement = screen.getByTestId(clientIdText);
  const scopeTextField: HTMLInputElement = screen.getByTestId(scopeText);
  const submitButtonField: HTMLButtonElement = screen.getByTestId(submitButton);


  userEvent.type(baseUrlTextField, 'test/');
  userEvent.type(authUrlTextField, 'http://localhost:8080/authUrl/');
  userEvent.type(accessUrlTextField, 'http://localhost:8080/accessUrl/');
  userEvent.type(clientIdTextField, 'clientId');
  userEvent.type(scopeTextField, 'Scope');

  fireEvent.click(submitButtonField);

  const baseUrlTextFieldError: HTMLDivElement = screen.getByTestId('server-model-baseurl-feedback')

  expect(baseUrlTextFieldError.innerHTML).toEqual(Constants.error_url + Constants.error_urlStartsWith);

  createServerJest.mockRestore();
});

test(thisTestFile + ': fail scenario: createServer called with bad url (no trailing /)', async () => {
  const mockCreateServerFn = jest.fn();
  const createServerJest = jest.spyOn(ServerUtils, 'createServer').mockImplementation(async (baseUrl: string, authUrl: string, tokenUrl: string, clientId: string,
    clientSecret: string, scope: string) => {
    return await mockCreateServerFn(baseUrl, authUrl, tokenUrl, clientId,
      clientSecret, scope);
  });

  const baseUrlText = 'server-model-baseurl-text';
  const authUrlText = 'server-model-authurl-text';
  const accessUrlText = 'server-model-accessurl-text';
  const clientIdText = 'server-model-clientid-text';
  const scopeText = 'server-model-scope-text';
  const submitButton = 'server-model-submit-button';

  await act(async () => {
    render(<App />);
  });

  await act(async () => {
    const addServerButton: HTMLButtonElement = screen.getByTestId('knowledge-repo-server-add-button');
    fireEvent.click(addServerButton);
  });

  const baseUrlTextField: HTMLInputElement = screen.getByTestId(baseUrlText);
  const authUrlTextField: HTMLInputElement = screen.getByTestId(authUrlText);
  const accessUrlTextField: HTMLInputElement = screen.getByTestId(accessUrlText);
  const clientIdTextField: HTMLInputElement = screen.getByTestId(clientIdText);
  const scopeTextField: HTMLInputElement = screen.getByTestId(scopeText);
  const submitButtonField: HTMLButtonElement = screen.getByTestId(submitButton);


  userEvent.type(baseUrlTextField, 'http://localhost:8080/fhir');
  userEvent.type(authUrlTextField, 'http://localhost:8080/authUrl/');
  userEvent.type(accessUrlTextField, 'http://localhost:8080/accessUrl/');
  userEvent.type(clientIdTextField, 'clientId');
  userEvent.type(scopeTextField, 'Scope');

  fireEvent.click(submitButtonField);

  const baseUrlTextFieldError: HTMLDivElement = screen.getByTestId('server-model-baseurl-feedback')

  expect(baseUrlTextFieldError.innerHTML).toEqual(Constants.error_url + Constants.error_urlEndsWith);

  createServerJest.mockRestore();
});
