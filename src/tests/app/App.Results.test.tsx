import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import App from '../../App';
import { Constants } from '../../constants/Constants';
import { GroupFetch } from '../../data/GroupFetch';
import { MeasureFetch } from '../../data/MeasureFetch';
import { PatientFetch } from '../../data/PatientFetch';
import { Measure } from '../../models/Measure';
import { Patient } from '../../models/Patient';
import { Server } from '../../models/Server';
import { HashParamUtils } from '../../utils/HashParamUtils';
import { ServerUtils } from '../../utils/ServerUtils';
import jsonTestGroupData from '../resources/fetchmock-group.json';
import jsonTestMeasureData from '../resources/fetchmock-measure.json';
import jsonTestPatientsData from '../resources/fetchmock-patients.json';

const thisTestFile = "Results";

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

  //clear out old accessCode, generateStateCode, and stateCode values
  HashParamUtils.clearCachedValues();

  //reset the selected knowledge repo stored in sessionStorage
  sessionStorage.setItem('selectedKnowledgeRepo', JSON.stringify(''));

  //override any calls directly to 127.0.0.1:8080, simply return result.ok set to true;
  fetchMock.mock('begin:http://127.0.0.1:8080', true);

});


test(thisTestFile + ': scenario: Please select a Measure message renders the results window', async () => {
  await act(async () => {
    render(<App />);
  });
  
  // Assert that the element is not in the document
  expect(screen.queryByTestId('results-text')).not.toBeInTheDocument();

  const dataServers: Server[] = Constants.serverTestData;

  //unhide data repository section:
  const showButton: HTMLButtonElement = screen.getByTestId('data-repo-show-section-button');
  fireEvent.click(showButton);

  fetchMock.mock(dataServers[0].baseUrl + 'Patient?_summary=count', mockPatientTotalCountJSON);
  const patientFetch = await PatientFetch.createInstance(dataServers[0].baseUrl);
  const mockJsonPatientData = jsonTestPatientsData;
  fetchMock.once(patientFetch.getUrl(),
    JSON.stringify(mockJsonPatientData)
    , { method: 'GET' });
  const groupFetch = new GroupFetch(dataServers[0].baseUrl);
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