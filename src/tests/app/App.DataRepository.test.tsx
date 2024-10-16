import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import App from '../../App';
import { Constants } from '../../constants/Constants';
import { FetchType } from '../../data/AbstractDataFetch';
import { CollectDataFetch } from '../../data/CollectDataFetch';
import { GroupFetch } from '../../data/GroupFetch';
import { MeasureFetch } from '../../data/MeasureFetch';
import { PatientFetch } from '../../data/PatientFetch';
import { Measure } from '../../models/Measure';
import { Patient } from '../../models/Patient';
import { Server } from '../../models/Server';

import { ServerUtils } from '../../utils/ServerUtils';
import { StringUtils } from '../../utils/StringUtils';
import jsonTestCollectDataData from '../resources/fetchmock-data-repo.json';
import jsonTestGroupData from '../resources/fetchmock-group.json';
import jsonTestMeasureData from '../resources/fetchmock-measure.json';
import jsonTestPatientsData from '../resources/fetchmock-patients.json';
import { PatientGroupUtils } from '../../utils/PatientGroupUtils';

const useSubject = true;

const thisTestFile = "Data Repository";

const RESPONSE_ERROR_BAD_REQUEST = 'Error: ' + Constants.fetch_BAD_REQUEST;
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

beforeAll(() => {
  global.URL.createObjectURL = jest.fn();
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
  Object.defineProperty(window.screen, 'orientation', {
    writable: true,
    value: { type: 'landscape-primary' },
  });
});

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


test(thisTestFile + ': renders properly', async () => {
  const dataServers: Server[] = Constants.serverTestData;

  const mockPatientList: Patient[] = await buildPatientData(dataServers[0].baseUrl);

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
    const patientFetch = await PatientFetch.createInstance(dataServers[0]);
    const mockJsonPatientsData = jsonTestPatientsData;
    fetchMock.once(patientFetch.getUrl(),
      JSON.stringify(mockJsonPatientsData)
      , { method: 'GET' });

    const groupFetch = new GroupFetch(dataServers[0]);

    const mockJsonGroupData = jsonTestGroupData;
    fetchMock.once(groupFetch.getUrl(),
      JSON.stringify(mockJsonGroupData)
      , { method: 'GET' });

    userEvent.selectOptions(serverDropdown, dataServers[0].baseUrl);
  });
  fetchMock.restore();

  //select known patient
  const patientDropdown: HTMLSelectElement = screen.getByTestId('data-repo-patient-dropdown');

  await waitFor(() =>
    expect(patientDropdown.options.length === 22).toBeTruthy()
  );

  const expectedDisplayName: string = PatientGroupUtils.buildUniquePatientIdentifier(mockPatientList[1]) + '';
  userEvent.selectOptions(patientDropdown, expectedDisplayName);

  //click Collect Data
  const getDataRequirementsButton: HTMLButtonElement = screen.getByTestId('data-repo-collect-data-button');
  fireEvent.click(getDataRequirementsButton);
});



test(thisTestFile + ': success scenario: Collect Data', async () => {
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

  //unhide data repository section:
  const showButton: HTMLButtonElement = screen.getByTestId('data-repo-show-section-button');
  fireEvent.click(showButton);
  await waitFor(() => expect(screen.getByTestId('data-repo-collect-data-button')).toBeInTheDocument());

  const knowledgeRepoServerDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-server-dropdown');
  const serverDropdown: HTMLSelectElement = screen.getByTestId('data-repo-server-dropdown');

  fetchMock.mock(dataServers[0].baseUrl + 'Patient?_summary=count', mockPatientTotalCountJSON);

  //select server, mock list should return:
  await act(async () => {
    const patientFetch = await PatientFetch.createInstance(dataServers[0]);
    const mockJsonPatientData = jsonTestPatientsData;
    fetchMock.once(patientFetch.getUrl(),
      JSON.stringify(mockJsonPatientData)
      , { method: 'GET' });

    const groupFetch = new GroupFetch(dataServers[0]);

    const mockJsonGroupData = jsonTestGroupData;
    fetchMock.once(groupFetch.getUrl(),
      JSON.stringify(mockJsonGroupData)
      , { method: 'GET' });

    userEvent.selectOptions(serverDropdown, dataServers[0].baseUrl);
  });
  fetchMock.restore();

  //mock measure list server selection will return 
  const measureFetch = new MeasureFetch(dataServers[0]);
  const mockJsonMeasureData = jsonTestMeasureData;
  fetchMock.once(measureFetch.getUrl(),
    JSON.stringify(mockJsonMeasureData)
    , { method: 'GET' });
  await act(async () => {
    //select server, mock list should return:
    userEvent.selectOptions(knowledgeRepoServerDropdown, dataServers[0].baseUrl);
  });
  fetchMock.restore();

  //first select measure
  const knowledgeRepoMeasureDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-measure-dropdown');
  userEvent.selectOptions(knowledgeRepoMeasureDropdown, mockMeasureList[0].name);

  //now select patient
  const patientDropdown: HTMLSelectElement = screen.getByTestId('data-repo-patient-dropdown');
  const expectedDisplayName: string = PatientGroupUtils.buildUniquePatientIdentifier(mockPatientList[0]) + '';
  userEvent.selectOptions(patientDropdown, expectedDisplayName);


  //mock returned data repo data
  const collectDataFetch = new CollectDataFetch(dataServers[0],
    mockMeasureList[0].name,
    startDate,
    endDate,
    useSubject,
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

  const resultsTextField: HTMLElement = screen.getByTestId('results-text');
  expect(resultsTextField.textContent).toEqual(JSON.stringify(mockJsonCollectDataData, undefined, 2));

});

test(thisTestFile + ': fail scenario: data repository', async () => {
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

  //unhide data repository section:
  const showButton: HTMLButtonElement = screen.getByTestId('data-repo-show-section-button');
  fireEvent.click(showButton);
  await waitFor(() => expect(screen.getByTestId('data-repo-collect-data-button')).toBeInTheDocument());

  const knowledgeRepoServerDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-server-dropdown');
  const serverDropdown: HTMLSelectElement = screen.getByTestId('data-repo-server-dropdown');

  fetchMock.mock(dataServers[0].baseUrl + 'Patient?_summary=count', mockPatientTotalCountJSON);

  //select server, mock list should return:
  await act(async () => {
    const patientFetch = await PatientFetch.createInstance(dataServers[0]);
    const mockJsonPatientData = jsonTestPatientsData;
    fetchMock.once(patientFetch.getUrl(),
      JSON.stringify(mockJsonPatientData)
      , { method: 'GET' });


    const groupFetch = new GroupFetch(dataServers[0]);

    const mockJsonGroupData = jsonTestGroupData;
    fetchMock.once(groupFetch.getUrl(),
      JSON.stringify(mockJsonGroupData)
      , { method: 'GET' });

    userEvent.selectOptions(serverDropdown, dataServers[0].baseUrl);
  });
  fetchMock.restore();

  //mock measure list server selection will return 
  const measureFetch = new MeasureFetch(dataServers[0]);
  const mockJsonMeasureData = jsonTestMeasureData;
  fetchMock.once(measureFetch.getUrl(),
    JSON.stringify(mockJsonMeasureData)
    , { method: 'GET' });
  await act(async () => {
    //select server, mock list should return:
    userEvent.selectOptions(knowledgeRepoServerDropdown, dataServers[0].baseUrl);
  });
  fetchMock.restore();

  //first select measure
  const knowledgeRepoMeasureDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-measure-dropdown');
  userEvent.selectOptions(knowledgeRepoMeasureDropdown, mockMeasureList[0].name);

  //now select patient
  const patientDropdown: HTMLSelectElement = screen.getByTestId('data-repo-patient-dropdown');
  const expectedDisplayName: string = PatientGroupUtils.buildUniquePatientIdentifier(mockPatientList[0]) + '';
  userEvent.selectOptions(patientDropdown, expectedDisplayName);

  //mock returned data repo data
  const collectDataFetch = new CollectDataFetch(dataServers[0],
    mockMeasureList[0].name,
    startDate,
    endDate,
    useSubject,
    mockPatientList[0]);
  fetchMock.once(collectDataFetch.getUrl(), 400);

  await act(async () => {
    //select server, mock list should return:
    const collectDataButton: HTMLButtonElement = screen.getByTestId('data-repo-collect-data-button');
    fireEvent.click(collectDataButton);
  });
  fetchMock.restore();


  const resultsTextField: HTMLElement = screen.getByTestId('results-text');
  expect(resultsTextField.textContent).toEqual(StringUtils.format(Constants.fetchError,
    collectDataFetch.getUrl(), FetchType.COLLECT_DATA,
    RESPONSE_ERROR_BAD_REQUEST));

});

test(thisTestFile + ': error scenario: Please select a Measure', async () => {
  await act(async () => {
    render(<App />);
  });
  const dataServers: Server[] = Constants.serverTestData;

  //unhide data repository section:
  const showButton: HTMLButtonElement = screen.getByTestId('data-repo-show-section-button');
  fireEvent.click(showButton);

  fetchMock.mock(dataServers[0].baseUrl + 'Patient?_summary=count', mockPatientTotalCountJSON);
  const patientFetch = await PatientFetch.createInstance(dataServers[0]);
  const mockJsonPatientData = jsonTestPatientsData;
  fetchMock.once(patientFetch.getUrl(),
    JSON.stringify(mockJsonPatientData)
    , { method: 'GET' });
  const groupFetch = new GroupFetch(dataServers[0]);
  const mockJsonGroupData = jsonTestGroupData;
  fetchMock.once(groupFetch.getUrl(),
    JSON.stringify(mockJsonGroupData)
    , { method: 'GET' });

  //select server, mock list should return:
  await act(async () => {
    const serverDropdown: HTMLSelectElement = screen.getByTestId('data-repo-server-dropdown');
    userEvent.selectOptions(serverDropdown, dataServers[0].baseUrl);
  });
  fetchMock.restore();

  await waitFor(() => expect(screen.getByTestId('data-repo-collect-data-button')).toBeInTheDocument());
  //click collect data, 
  const collectDataButton: HTMLButtonElement = screen.getByTestId('data-repo-collect-data-button');
  fireEvent.click(collectDataButton);

  const resultsTextField: HTMLElement = screen.getByTestId('results-text');
  expect(resultsTextField.textContent).toEqual(Constants.error_collectData_selectMeasure);

});

test(thisTestFile + ': deselecting server', async () => {
  await act(async () => {
    render(<App />);
  });
  //unhide data repository section:
  const showButton: HTMLButtonElement = screen.getByTestId('data-repo-show-section-button');
  fireEvent.click(showButton);

  //select server, mock list should return:
  await act(async () => {
    const serverDropdown: HTMLSelectElement = screen.getByTestId('data-repo-server-dropdown');
    userEvent.selectOptions(serverDropdown, Constants.label_selectServer);
  });

  await waitFor(() => expect(screen.getByTestId('data-repo-collect-data-button')).toBeInTheDocument());
  //click collect data, 
  const collectDataButton: HTMLButtonElement = screen.getByTestId('data-repo-collect-data-button');
  fireEvent.click(collectDataButton);

  const resultsTextField: HTMLElement = screen.getByTestId('results-text');
  expect(resultsTextField.textContent).toEqual(Constants.error_selectDataRepository);

});


//mock measure and patient data
async function buildMeasureData(url: string): Promise<Measure[]> {
  const measureFetch = new MeasureFetch(Constants.serverTestData[0]);
  const mockJsonMeasureData = jsonTestMeasureData;
  fetchMock.once(measureFetch.getUrl(),
    JSON.stringify(mockJsonMeasureData)
    , { method: 'GET' });
  let measureList: Measure[] = (await measureFetch.fetchData()).operationData;
  fetchMock.restore();
  return measureList;
}

async function buildPatientData(url: string): Promise<Patient[]> {
  fetchMock.mock(url + 'Patient?_summary=count', mockPatientTotalCountJSON);

  const patientFetch = await PatientFetch.createInstance(Constants.serverTestData[0]);
  const mockJsonPatientData = jsonTestPatientsData;
  fetchMock.once(patientFetch.getUrl(),
    JSON.stringify(mockJsonPatientData)
    , { method: 'GET' });
  let patientList: Patient[] = (await patientFetch.fetchData()).operationData;
  fetchMock.restore();
  return patientList;
}