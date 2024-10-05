import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import App from '../../App';
import { Constants } from '../../constants/Constants';
import { FetchType } from '../../data/AbstractDataFetch';
import { DataRequirementsFetch } from '../../data/DataRequirementsFetch';
import { MeasureFetch } from '../../data/MeasureFetch';
import { PatientFetch } from '../../data/PatientFetch';
import { Measure } from '../../models/Measure';
import { Patient } from '../../models/Patient';
import { Server } from '../../models/Server';
import { OAuthHandler } from '../../oauth/OAuthHandler';
import { HashParamUtils } from '../../utils/HashParamUtils';
import { ServerUtils } from '../../utils/ServerUtils';
import { StringUtils } from '../../utils/StringUtils';
import jsonTestDataRequirementsData from '../resources/fetchmock-knowledge-repo.json';
import jsonTestMeasureData from '../resources/fetchmock-measure.json';
import jsonTestPatientsData from '../resources/fetchmock-patients.json';

const thisTestFile = "Knowledge Repository";

const RESPONSE_ERROR_BAD_REQUEST = 'Bad Request';
const mockPatientTotalCountJSON = `{
  "resourceType": "Bundle",
  "id": "604e7395-8850-4a15-a2f2-67a1d334b2d0",
  "meta": {
    "lastUpdated": "2024-01-12T16:42:57.392+00:00",
    "tag": [ {
      "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationValue",
      "code": "SUBSETTED",
      "display": "Resource encoded in summary mode"
    } ]
  },
  "type": "searchset",
  "total": 1921
}`;

//mock getServerList and createServer entirely. API.graphQL calls are mocked in ServerUtils.test.tsx
beforeEach(() => {
  //clean up any missed mocks
  jest.restoreAllMocks();
  fetchMock.restore();

  //override getServerList to return test data
  jest.spyOn(ServerUtils, 'getServerList').mockImplementation(async () => {
    return Constants.serverTestData;
  });

  //clear out old accessCode, generateStateCode, and stateCode values
  HashParamUtils.clearCachedValues();

  //reset the selected knowledge repo stored in sessionStorage
  sessionStorage.setItem('selectedKnowledgeRepo', JSON.stringify(''));

  //override any calls directly to 127.0.0.1:8080, simply return result.ok set to true;
  fetchMock.mock('begin:http://127.0.0.1:8080', true);

});

beforeAll(() => {
  global.URL.createObjectURL = jest.fn();
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

//RENDERING:
test(thisTestFile + ': renders properly', async () => {
  const dataServers: Server[] = Constants.serverTestData;

  const mockMeasureList: Measure[] = await buildMeasureData(dataServers[0].baseUrl);

  await act(async () => {
    render(<App />);
  });
  //Knowledge Repository
  //hide section, show section
  const hideButton: HTMLButtonElement = screen.getByTestId('knowledge-repo-hide-section-button');
  fireEvent.click(hideButton);
  expect(screen.getByTestId('knowledge-repo-selected-div')).toBeInTheDocument();
  expect(screen.queryByText('Select a Server...')).not.toBeInTheDocument();
  expect(screen.queryByText('Select a Measure...')).not.toBeInTheDocument();
  expect(screen.queryByText('Get Data Requirements')).not.toBeInTheDocument();
  const showButton: HTMLButtonElement = screen.getByTestId('knowledge-repo-show-section-button');
  fireEvent.click(showButton);
  expect(screen.queryByText('Selected Measure')).not.toBeInTheDocument();
  expect(screen.queryByText('Select a Server...')).toBeInTheDocument();
  expect(screen.queryByText('Select a Measure...')).toBeInTheDocument();
  expect(screen.queryByText('Get Data Requirements')).toBeInTheDocument();

  //get knowledge server dropdown
  const serverDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-server-dropdown');

  //mock measure list server selection will return 
  const url = dataServers[0].baseUrl;
  const measureFetch = new MeasureFetch(url);
  const mockJsonMeasureData = jsonTestMeasureData;
  fetchMock.once(measureFetch.getUrl(),
    JSON.stringify(mockJsonMeasureData)
    , { method: 'GET' });
  //select server, mock list should return:
  userEvent.selectOptions(serverDropdown, url);
  fetchMock.restore();

  //select known measure
  const measureDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-measure-dropdown');
  await waitFor(() => expect(measureDropdown.options.length > 10).toBeTruthy());
  userEvent.selectOptions(measureDropdown, mockMeasureList[1].name);

  //hiding the section should now reveal 'Selected Measure: BreastCancerScreeningsFHIR'
  fireEvent.click(hideButton);
  expect(screen.getByTestId('knowledge-repo-selected-div')).toBeInTheDocument();

  //restore section to get to button
  fireEvent.click(showButton);

  expect(screen.getByTestId('get-data-requirements-button')).toBeInTheDocument();

});
 

test(thisTestFile + ': success scenario: erver with auth url navigates outward, selected server is stored in session storage', async () => {

  const mockWindowOpen = jest.fn((url?: string | URL | undefined, target?: string | undefined, features?: string | undefined): Window => {
    return new Window();
  });

  //override window navigation since testing has no pages
  jest.spyOn(window, 'open').mockImplementation((url?: string | URL | undefined, target?: string | undefined, features?: string | undefined): Window => {
    return mockWindowOpen(url, target, features);
  });

  await act(async () => {
    render(<App />);
  });

  const serverDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-server-dropdown');

  //Constants.testOauthServer.baseUrl refers to a specific server in the serverTestData array which has an auth url
  //Selecting this server should trigger navigation outward to the auth url
  const measureFetch = new MeasureFetch(Constants.testOauthServer.baseUrl);
  const mockJsonMeasureData = jsonTestMeasureData;

  const requestOptions = HashParamUtils.getAccessCode() && HashParamUtils.getAccessCode() !== '' ? {
    headers: { 'Authorization': 'Bearer ' + HashParamUtils.getAccessCode() }
  } : {};


  await act(async () => {
    fetchMock.once(measureFetch.getUrl(), JSON.stringify(mockJsonMeasureData), requestOptions);
    fetchMock.head('begin:' + Constants.testOauthServer.authUrl, true);

    //select server, mock list should return:
    userEvent.selectOptions(serverDropdown, Constants.testOauthServer.baseUrl);
  });
  fetchMock.restore();

  expect(mockWindowOpen).toHaveBeenCalledWith('http://localhost:8080/4/authorize/'
    + '?client_id=SKeK4PfHWPFSFzmy0CeD-pe8'
    + '&redirect_uri=http://localhost:8080/4/'
    + '&scope=photo+offline_access&response_type=code&state=' + HashParamUtils.getGeneratedStateCode(), '_self', undefined);

  const expectedStoredServer = {
    id: 'ec2345-4',
    baseUrl: 'http://localhost:8080/4/',
    authUrl: 'http://localhost:8080/4/authorize/',
    tokenUrl: 'http://localhost:8080/4/token/',
    callbackUrl: 'http://localhost:8080/4/',
    clientID: 'SKeK4PfHWPFSFzmy0CeD-pe8',
    clientSecret: 'Q_s6HeMPpzjZfNNbtqwFZjvhoXmiw8CPBLp_4tiRiZ_wQLQW',
    scope: 'photo+offline_access'
  } as Server;

  let selectedKnowledgeRepo = sessionStorage.getItem('selectedKnowledgeRepo');
  if (selectedKnowledgeRepo) {
    expect(JSON.parse(selectedKnowledgeRepo)).toEqual(expectedStoredServer);
  } else {
    fail('selectedKnowledgeRepo not stored in sessionStorage as expected!');
  }

  let generatedStateCode = sessionStorage.getItem('generatedStateCode');
  if (generatedStateCode) {
    expect(JSON.parse(generatedStateCode)).toEqual(HashParamUtils.getGeneratedStateCode());
  } else {
    fail('generatedStateCode not stored in sessionStorage as expected!');
  }
  mockWindowOpen.mockRestore();
});


test(thisTestFile + ': success scenario: simulate successful access code returned to redirect uri', async () => {



  const accessCode = '1234567890123456';
  const stateCode = '0987654321';
  const generatedStateCode = '0987654321';
  const accessToken = '12345';

  const mockGetAccessToken = jest.fn(async (accessCode: string, server: Server): Promise<string> => {
    return accessToken;
  });

  //override the HashParamUtils.buildHashParams call to manually establish the session data
  jest.spyOn(HashParamUtils, 'getAccessCode').mockImplementation((): string => {
    return accessCode;
  });
  jest.spyOn(HashParamUtils, 'getStateCode').mockImplementation((): string => {
    return stateCode;
  });
  jest.spyOn(HashParamUtils, 'getGeneratedStateCode').mockImplementation((): string => {
    return generatedStateCode;
  });

  //override the HashParamUtils.buildHashParams call to manually establish the session data
  jest.spyOn(OAuthHandler, 'getAccessToken').mockImplementation(async (accessCode: string, server: Server): Promise<string> => {
    return mockGetAccessToken(accessCode, server);
  });

  //App should render and see an accessCode in the url, extract it, then assign it locally and erase it from the url bar.
  await act(async () => {
    render(<App />);
  });

  //get knowledge server dropdown
  const serverDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-server-dropdown');

  await act(async () => {
    //mock measure list server selection will return 
    const measureFetch = new MeasureFetch(Constants.testOauthServer.baseUrl);
    const mockJsonMeasureData = jsonTestMeasureData;
    fetchMock.once(measureFetch.getUrl(), JSON.stringify(mockJsonMeasureData));
    //select server with mock authurl
    userEvent.selectOptions(serverDropdown, Constants.testOauthServer.baseUrl);
    expect(mockGetAccessToken).toHaveBeenCalledWith(accessCode, Constants.testOauthServer);
  });

  fetchMock.restore();
});

test(thisTestFile + ': success scenario: Get Data Requirements', async () => {
  const dataServers: Server[] = Constants.serverTestData;
  const mockMeasureList: Measure[] = await buildMeasureData(dataServers[0].baseUrl);

  await act(async () => {
    render(<App />);
  });

  const startDateControl: HTMLInputElement = screen.getByTestId('start-date-control');
  const startDate = startDateControl.value;

  const endDateControl: HTMLInputElement = screen.getByTestId('end-date-control');
  const endDate = endDateControl.value;


  //get knowledge server dropdown
  const serverDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-server-dropdown');
  const measureDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-measure-dropdown');

  await act(async () => {
    //mock measure list server selection will return 
    const measureFetch = new MeasureFetch(dataServers[0].baseUrl);
    const mockJsonMeasureData = jsonTestMeasureData;

    fetchMock.once(measureFetch.getUrl(), JSON.stringify(mockJsonMeasureData), { method: 'GET' });
    //select server, mock list should return:
    userEvent.selectOptions(serverDropdown, dataServers[0].baseUrl);
  });
  fetchMock.restore();

  await act(async () => {
    userEvent.selectOptions(measureDropdown, mockMeasureList[0].name);
  });

  //mock knowledge repo json data:
  const dataRequirementsFetch = new DataRequirementsFetch(dataServers[0],
    mockMeasureList[0].name,
    startDate,
    endDate);
  const mockJsonDataRequirementsData = jsonTestDataRequirementsData;
  fetchMock.once(dataRequirementsFetch.getUrl(),
    JSON.stringify(mockJsonDataRequirementsData)
    , { method: 'GET' });
  await act(async () => {
    const getDataRequirementsButton: HTMLButtonElement = screen.getByTestId('get-data-requirements-button');
    fireEvent.click(getDataRequirementsButton);
  });
  fetchMock.restore();

  const resultsTextField: HTMLElement = screen.getByTestId('results-text');
  expect(resultsTextField.textContent).toEqual(JSON.stringify(mockJsonDataRequirementsData, undefined, 2));

});

test(thisTestFile + ': fail scenario: Bad Request', async () => {
  const dataServers: Server[] = Constants.serverTestData;

  const mockMeasureList: Measure[] = await buildMeasureData(dataServers[0].baseUrl);

  await act(async () => {
    render(<App />);
  });

  const startDateControl: HTMLInputElement = screen.getByTestId('start-date-control');
  const startDate = startDateControl.value;

  const endDateControl: HTMLInputElement = screen.getByTestId('end-date-control');
  const endDate = endDateControl.value;

  //get knowledge server dropdown
  const serverDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-server-dropdown');
  const measureDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-measure-dropdown');


  await act(async () => {
    //mock measure list server selection will return 
    const measureFetch = new MeasureFetch(dataServers[0].baseUrl);
    const mockJsonMeasureData = jsonTestMeasureData;
    fetchMock.once(measureFetch.getUrl(), JSON.stringify(mockJsonMeasureData), { method: 'GET' });
    //select server, mock list should return:
    userEvent.selectOptions(serverDropdown, dataServers[0].baseUrl);
    fetchMock.restore();
  });

  await act(async () => {
    userEvent.selectOptions(measureDropdown, mockMeasureList[0].name);
  });

  //mock knowledge repo json data:
  const dataRequirementsFetch = new DataRequirementsFetch(dataServers[0],
    mockMeasureList[0].name,
    startDate,
    endDate);
  fetchMock.once(dataRequirementsFetch.getUrl(), 400);
  await act(async () => {
    const getDataRequirementsButton: HTMLButtonElement = screen.getByTestId('get-data-requirements-button');
    fireEvent.click(getDataRequirementsButton);
  });
  fetchMock.restore();

  const resultsTextField: HTMLElement = screen.getByTestId('results-text');
  expect(resultsTextField.textContent).toEqual(StringUtils.format(Constants.fetchError,
    dataRequirementsFetch.getUrl(), FetchType.DATA_REQUIREMENTS,
    RESPONSE_ERROR_BAD_REQUEST));

});


test(thisTestFile + ': error scenario: Please select a Measure', async () => {
  await act(async () => {
    render(<App />);
  });
  const dataServers: Server[] = Constants.serverTestData;

  //get knowledge server dropdown
  const serverDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-server-dropdown');

  await act(async () => {
    //mock measure list server selection will return 
    const measureFetch = new MeasureFetch(dataServers[0].baseUrl);
    const mockJsonMeasureData = jsonTestMeasureData;

    fetchMock.once(measureFetch.getUrl(), JSON.stringify(mockJsonMeasureData), { method: 'GET' });
    //select server, mock list should return:
    userEvent.selectOptions(serverDropdown, dataServers[0].baseUrl);
  });
  fetchMock.restore();

  await waitFor(() => expect(screen.getByTestId('get-data-requirements-button')).toBeInTheDocument());
  //click collect data, 
  const getDataRequirementsButton: HTMLButtonElement = screen.getByTestId('get-data-requirements-button');
  //check results for error:
  fireEvent.click(getDataRequirementsButton);

  const resultsTextField: HTMLElement = screen.getByTestId('results-text');
  expect(resultsTextField.textContent).toEqual(Constants.error_selectMeasureDR);

});
 

//mock measure and patient data
async function buildMeasureData(url: string): Promise<Measure[]> {
  const measureFetch = new MeasureFetch(url);
  const mockJsonMeasureData = jsonTestMeasureData;
  fetchMock.once(measureFetch.getUrl(),
    JSON.stringify(mockJsonMeasureData)
    , { method: 'GET' });
  let measureList: Measure[] = (await measureFetch.fetchData('')).operationData;
  fetchMock.restore();
  return measureList;
}

async function buildPatientData(url: string): Promise<Patient[]> {
  fetchMock.mock(url + 'Patient?_summary=count', mockPatientTotalCountJSON);

  const patientFetch = await PatientFetch.createInstance(url);
  const mockJsonPatientData = jsonTestPatientsData;
  fetchMock.once(patientFetch.getUrl(),
    JSON.stringify(mockJsonPatientData)
    , { method: 'GET' });
  let patientList: Patient[] = (await patientFetch.fetchData('')).operationData;
  fetchMock.restore();
  return patientList;
}