import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import App from '../../App';
import { Constants } from '../../constants/Constants';
import { FetchType } from '../../data/AbstractDataFetch';
import { CollectDataFetch } from '../../data/CollectDataFetch';
import { MeasureFetch } from '../../data/MeasureFetch';
import { PatientFetch } from '../../data/PatientFetch';
import { Measure } from '../../models/Measure';
import { Patient } from '../../models/Patient';
import { Server } from '../../models/Server';
import { HashParamUtils } from '../../utils/HashParamUtils';
import { ServerUtils } from '../../utils/ServerUtils';
import { StringUtils } from '../../utils/StringUtils';
import jsonTestCollectDataData from '../resources/fetchmock-data-repo.json';
import jsonTestMeasureData from '../resources/fetchmock-measure.json';
import jsonTestPatientsData from '../resources/fetchmock-patients.json';

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

test('success scenario: data repository', async () => {
  const dataServers: Server[] = Constants.serverTestData;

  const mockMeasureList: Measure[] = await buildMeasureData(dataServers[0].baseUrl);
  const mockPatientList: Patient[] = await buildPatientData(dataServers[0].baseUrl);

  await act(async () => {
    render(<App />);
  });

  const startDateControl: HTMLInputElement = screen.getByTestId('start-date-control');
  const startDate = startDateControl.value;

  const endDateControl: HTMLInputElement = screen.getByTestId('end-date-control');
  const endDate = endDateControl.value;

  const resultsTextField: HTMLTextAreaElement = screen.getByTestId('results-text');

  //unhide data repository section:
  const showButton: HTMLButtonElement = screen.getByTestId('data-repo-show-section-button');
  fireEvent.click(showButton);
  await waitFor(() => expect(screen.getByTestId('data-repo-collect-data-button')).toBeInTheDocument());

  const knowledgeRepoServerDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-server-dropdown');
  const serverDropdown: HTMLSelectElement = screen.getByTestId('data-repo-server-dropdown');

  fetchMock.mock(dataServers[0].baseUrl + 'Patient?_summary=count', mockPatientTotalCountJSON);

  //select server, mock list should return:
  await act(async () => {
    const patientFetch = await PatientFetch.createInstance(dataServers[0].baseUrl);
    const mockJsonPatientData = jsonTestPatientsData;
    fetchMock.once(patientFetch.getUrl(),
      JSON.stringify(mockJsonPatientData)
      , { method: 'GET' });
    userEvent.selectOptions(serverDropdown, dataServers[0].baseUrl);
  });
  fetchMock.restore();

  //mock measure list server selection will return 
  const measureFetch = new MeasureFetch(dataServers[0].baseUrl);
  const mockJsonMeasureData = jsonTestMeasureData;
  fetchMock.once(measureFetch.getUrl(),
    JSON.stringify(mockJsonMeasureData)
    , { method: 'GET' });
  await act(async () => {
    //select server, mock list should return:
    userEvent.selectOptions(knowledgeRepoServerDropdown, dataServers[0].baseUrl);
  });
  fetchMock.restore();

  const patientDropdown: HTMLSelectElement = screen.getByTestId('data-repo-patient-dropdown');

  const expectedDisplayName: string = PatientFetch.buildUniquePatientIdentifier(mockPatientList[0]) + '';
  userEvent.selectOptions(patientDropdown, expectedDisplayName);

  const knowledgeRepoMeasureDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-measure-dropdown');
  userEvent.selectOptions(knowledgeRepoMeasureDropdown, mockMeasureList[0].name);

  //mock returned data repo data
  const collectDataFetch = new CollectDataFetch(dataServers[0],
    mockMeasureList[0].name,
    startDate,
    endDate,
    mockPatientList[0]);
  const mockJsonCollectDataData = jsonTestCollectDataData;
  fetchMock.once(collectDataFetch.getUrl(),
    JSON.stringify(mockJsonCollectDataData)
    , { method: 'GET' });

  await act(async () => {
    //select server, mock list should return:
    const collectDataButton: HTMLButtonElement = screen.getByTestId('data-repo-collect-data-button');
    fireEvent.click(collectDataButton);
  });
  fetchMock.restore();

  expect(resultsTextField.value).toEqual(JSON.stringify(mockJsonCollectDataData, undefined, 2));

});

test('fail scenario: data repository', async () => {
  const dataServers: Server[] = Constants.serverTestData;

  const mockMeasureList: Measure[] = await buildMeasureData(dataServers[0].baseUrl);
  const mockPatientList: Patient[] = await buildPatientData(dataServers[0].baseUrl);

  await act(async () => {
    render(<App />);
  });

  const startDateControl: HTMLInputElement = screen.getByTestId('start-date-control');
  const startDate = startDateControl.value;

  const endDateControl: HTMLInputElement = screen.getByTestId('end-date-control');
  const endDate = endDateControl.value;

  const resultsTextField: HTMLTextAreaElement = screen.getByTestId('results-text');

  //unhide data repository section:
  const showButton: HTMLButtonElement = screen.getByTestId('data-repo-show-section-button');
  fireEvent.click(showButton);
  await waitFor(() => expect(screen.getByTestId('data-repo-collect-data-button')).toBeInTheDocument());

  const knowledgeRepoServerDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-server-dropdown');
  const serverDropdown: HTMLSelectElement = screen.getByTestId('data-repo-server-dropdown');

  fetchMock.mock(dataServers[0].baseUrl + 'Patient?_summary=count', mockPatientTotalCountJSON);

  //select server, mock list should return:
  await act(async () => {
    const patientFetch = await PatientFetch.createInstance(dataServers[0].baseUrl);
    const mockJsonPatientData = jsonTestPatientsData;
    fetchMock.once(patientFetch.getUrl(),
      JSON.stringify(mockJsonPatientData)
      , { method: 'GET' });
    userEvent.selectOptions(serverDropdown, dataServers[0].baseUrl);
  });
  fetchMock.restore();

  //mock measure list server selection will return 
  const measureFetch = new MeasureFetch(dataServers[0].baseUrl);
  const mockJsonMeasureData = jsonTestMeasureData;
  fetchMock.once(measureFetch.getUrl(),
    JSON.stringify(mockJsonMeasureData)
    , { method: 'GET' });
  await act(async () => {
    //select server, mock list should return:
    userEvent.selectOptions(knowledgeRepoServerDropdown, dataServers[0].baseUrl);
  });
  fetchMock.restore();

  const patientDropdown: HTMLSelectElement = screen.getByTestId('data-repo-patient-dropdown');
  const expectedDisplayName: string = PatientFetch.buildUniquePatientIdentifier(mockPatientList[0]) + '';
  userEvent.selectOptions(patientDropdown, expectedDisplayName);

  const knowledgeRepoMeasureDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-measure-dropdown');
  userEvent.selectOptions(knowledgeRepoMeasureDropdown, mockMeasureList[0].name);

  //mock returned data repo data
  const collectDataFetch = new CollectDataFetch(dataServers[0],
    mockMeasureList[0].name,
    startDate,
    endDate,
    mockPatientList[0]);
  fetchMock.once(collectDataFetch.getUrl(), 400);

  await act(async () => {
    //select server, mock list should return:
    const collectDataButton: HTMLButtonElement = screen.getByTestId('data-repo-collect-data-button');
    fireEvent.click(collectDataButton);
  });
  fetchMock.restore();

  expect(resultsTextField.value).toEqual(StringUtils.format(Constants.fetchError,
    collectDataFetch.getUrl(), FetchType.COLLECT_DATA,
    RESPONSE_ERROR_BAD_REQUEST));

});

test('error scenario: data repository', async () => {
  await act(async () => {
    render(<App />);
  });
  const dataServers: Server[] = Constants.serverTestData;

  //unhide data repository section:
  const showButton: HTMLButtonElement = screen.getByTestId('data-repo-show-section-button');
  fireEvent.click(showButton);
  await waitFor(() => expect(screen.getByTestId('data-repo-collect-data-button')).toBeInTheDocument());

  //click collect data, 
  const collectDataButton: HTMLButtonElement = screen.getByTestId('data-repo-collect-data-button');
  fireEvent.click(collectDataButton);

  //check results for error:
  const resultsTextField: HTMLTextAreaElement = screen.getByTestId('results-text');
  expect(resultsTextField).toBeInTheDocument();
  expect(resultsTextField.value).toEqual(Constants.error_selectDataRepository);

  const serverDropdown: HTMLSelectElement = screen.getByTestId('data-repo-server-dropdown');

  fetchMock.mock(dataServers[0].baseUrl + 'Patient?_summary=count', mockPatientTotalCountJSON);

  const patientFetch = await PatientFetch.createInstance(dataServers[0].baseUrl);
  const mockJsonPatientData = jsonTestPatientsData;
  fetchMock.once(patientFetch.getUrl(),
    JSON.stringify(mockJsonPatientData)
    , { method: 'GET' });
  //select server, mock list should return:
  await act(async () => {
    userEvent.selectOptions(serverDropdown, dataServers[0].baseUrl);
  });
  fetchMock.restore();

  //check results for error:
  fireEvent.click(collectDataButton);
  expect(resultsTextField.value).toEqual(Constants.error_selectMeasureDataCollection);

});


test('renders data repo properly', async () => {
  const dataServers: Server[] = Constants.serverTestData;

  const url = dataServers[0].baseUrl;
  const mockPatientList: Patient[] = await buildPatientData(url);

  await act(async () => {
    render(<App />);
  });

  //Data Repository
  //section is hidden by default, show section:
  const showButton: HTMLButtonElement = screen.getByTestId('data-repo-show-section-button');
  fireEvent.click(showButton);
  await waitFor(() => expect(screen.getByTestId('data-repo-collect-data-button')).toBeInTheDocument());

  //get repo server dropdown
  const serverDropdown: HTMLSelectElement = screen.getByTestId('data-repo-server-dropdown');
  //mock patient list server selection will return

  fetchMock.mock(dataServers[0].baseUrl + 'Patient?_summary=count', mockPatientTotalCountJSON);

  await act(async () => {
    const patientFetch = await PatientFetch.createInstance(url);
    const mockJsonPatientsData = jsonTestPatientsData;
    fetchMock.once(patientFetch.getUrl(),
      JSON.stringify(mockJsonPatientsData)
      , { method: 'GET' });

    userEvent.selectOptions(serverDropdown, url);
  });
  fetchMock.restore();

  //select known patient
  const patientDropdown: HTMLSelectElement = screen.getByTestId('data-repo-patient-dropdown');

  await waitFor(() =>
    expect(patientDropdown.options.length > 10).toBeTruthy()
  );
  const expectedDisplayName: string = PatientFetch.buildUniquePatientIdentifier(mockPatientList[1]) + '';
  userEvent.selectOptions(patientDropdown, expectedDisplayName);

  //click Collect Data
  const getDataRequirementsButton: HTMLButtonElement = screen.getByTestId('data-repo-collect-data-button');
  fireEvent.click(getDataRequirementsButton);
});


//mock measure and patient data
async function buildMeasureData(url: string): Promise<Measure[]> {
  const measureFetch = new MeasureFetch(url);
  const mockJsonMeasureData = jsonTestMeasureData;
  fetchMock.once(measureFetch.getUrl(),
    JSON.stringify(mockJsonMeasureData)
    , { method: 'GET' });
  let measureList: Measure[] = await measureFetch.fetchData('');
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
  let patientList: Patient[] = await patientFetch.fetchData('');
  fetchMock.restore();
  return patientList;
}