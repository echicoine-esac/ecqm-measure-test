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

import { ServerUtils } from '../../utils/ServerUtils';
import { StringUtils } from '../../utils/StringUtils';
import jsonTestDataRequirementsData from '../resources/fetchmock-knowledge-repo.json';
import jsonTestMeasureData from '../resources/fetchmock-measure.json';
import jsonTestPatientsData from '../resources/fetchmock-patients.json';

const thisTestFile = 'Knowledge Repository';

const RESPONSE_ERROR_BAD_REQUEST = 'Error: ' + Constants.fetch_BAD_REQUEST;
const mockPatientTotalCountJSON = `{
  'resourceType': 'Bundle',
  'id': '604e7395-8850-4a15-a2f2-67a1d334b2d0',
  'meta': {
    'lastUpdated': '2024-01-12T16:42:57.392+00:00',
    'tag': [ {
      'system': 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
      'code': 'SUBSETTED',
      'display': 'Resource encoded in summary mode'
    } ]
  },
  'type': 'searchset',
  'total': 1921
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

  //reset the selected knowledge repo stored in sessionStorage
  sessionStorage.setItem('selectedKnowledgeRepo', JSON.stringify(''));

  //override any calls directly to 127.0.0.1:8080, simply return result.ok set to true;
  fetchMock.mock('begin:http://127.0.0.1:8080', true);

  window.open = jest.fn().mockReturnValue({
    closed: false,
    close: jest.fn()
  });

});



beforeAll(() => {
  global.URL.createObjectURL = jest.fn();
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
  Object.defineProperty(window.screen, 'orientation', {
    writable: true,
    value: { type: 'landscape-primary' },
  });
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
  const measureFetch = new MeasureFetch(Constants.serverTestData[0]);
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
    const measureFetch = new MeasureFetch(dataServers[0]);
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
    const measureFetch = new MeasureFetch(dataServers[0]);
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
    const measureFetch = new MeasureFetch(dataServers[0]);
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