import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import App from '../App';
import { Constants } from '../constants/Constants';
import { FetchType } from '../data/AbstractDataFetch';
import { CollectDataFetch } from '../data/CollectDataFetch';
import { DataRequirementsFetch } from '../data/DataRequirementsFetch';
import { EvaluateMeasureFetch } from '../data/EvaluateMeasureFetch';
import { MeasureFetch } from '../data/MeasureFetch';
import { PatientFetch } from '../data/PatientFetch';
import { SubmitDataFetch } from '../data/SubmitDataFetch';
import { Measure } from '../models/Measure';
import { Server } from "../models/Server";
import jsonTestCollectDataData from '../tests/resources/fetchmock-data-repo.json';
import jsonTestDataRequirementsData from '../tests/resources/fetchmock-knowledge-repo.json';
import jsonTestMeasureData from '../tests/resources/fetchmock-measure.json';
import jsonTestPatientsData from '../tests/resources/fetchmock-patients.json';
import jsonTestResultsData from '../tests/resources/fetchmock-results.json';
import { ServerUtils } from '../utils/ServerUtils';
import { StringUtils } from '../utils/StringUtils';

const mockCreateServerFn = jest.fn();
//mock getServerList and createServer entirely. API.graphQL calls are mocked in ServerUtils.test.tsx
beforeEach(() => {
  jest.spyOn(ServerUtils, 'getServerList').mockImplementation(async () => {
    return Constants.serverTestData;
  });
});

//SERVER MODAL
test('success scenarios: create new server button opens modal', async () => {

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
    await render(<App />);
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


test('success scenarios: create new server button opens modal', async () => {
 
  jest.spyOn(ServerUtils, 'createServer').mockImplementation(async (baseUrl: string, authUrl: string, tokenUrl: string, clientId: string,
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
    await render(<App />);
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


  await userEvent.type(baseUrlTextField, 'http://localhost:8080/baseUrl/');
  await userEvent.type(authUrlTextField, 'http://localhost:8080/authUrl/');
  await userEvent.type(accessUrlTextField, 'http://localhost:8080/accessUrl/');
  await userEvent.type(clientIdTextField, 'clientId');
  await userEvent.type(scopeTextField, 'Scope');

  fireEvent.click(submitButtonField);

  expect(mockCreateServerFn).toHaveBeenCalledWith(
      'http://localhost:8080/baseUrl/',
      'http://localhost:8080/authUrl/',
      'http://localhost:8080/accessUrl/',
      'clientId',
      '',
      'user/*.readScope');
});

//mock server data must match user experience
test('success scenarios: knowledge repository', async () => {

  const dataServers: Server[] = Constants.serverTestData;

  const mockMeasureList: Measure[] = await buildMeasureData(dataServers[0].baseUrl);

  await act(async () => {
    await render(<App />);
  });

  const startDateControl: HTMLInputElement = screen.getByTestId('start-date-control');
  const startDate = startDateControl.value;

  const endDateControl: HTMLInputElement = screen.getByTestId('end-date-control');
  const endDate = endDateControl.value;

  const resultsTextField: HTMLTextAreaElement = screen.getByTestId('results-text');

  //get knowledge server dropdown
  const serverDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-server-dropdown');
  const measureDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-measure-dropdown');

  //mock measure list server selection will return 
  const measureFetch = new MeasureFetch(dataServers[0].baseUrl);
  const mockJsonMeasureData = jsonTestMeasureData;

  fetchMock.once(measureFetch.getUrl(),
    JSON.stringify(mockJsonMeasureData)
    , { method: 'GET' });
  await act(async () => {
    //select server, mock list should return:
    await userEvent.selectOptions(serverDropdown, dataServers[0].baseUrl);
    fetchMock.restore();
  });

  await act(async () => {
    await userEvent.selectOptions(measureDropdown, mockMeasureList[0].name);
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
    await fireEvent.click(getDataRequirementsButton);
    fetchMock.restore();
  });

  expect(resultsTextField.value).toEqual(JSON.stringify(mockJsonDataRequirementsData, undefined, 2));

});

test('fail scenarios: knowledge repository', async () => {
  const dataServers: Server[] = Constants.serverTestData;

  const mockMeasureList: Measure[] = await buildMeasureData(dataServers[0].baseUrl);

  await act(async () => {
    await render(<App />);
  });

  const startDateControl: HTMLInputElement = screen.getByTestId('start-date-control');
  const startDate = startDateControl.value;

  const endDateControl: HTMLInputElement = screen.getByTestId('end-date-control');
  const endDate = endDateControl.value;

  const resultsTextField: HTMLTextAreaElement = screen.getByTestId('results-text');

  //get knowledge server dropdown
  const serverDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-server-dropdown');
  const measureDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-measure-dropdown');

  //mock measure list server selection will return 
  const measureFetch = new MeasureFetch(dataServers[0].baseUrl);
  const mockJsonMeasureData = jsonTestMeasureData;
  fetchMock.once(measureFetch.getUrl(),
    JSON.stringify(mockJsonMeasureData)
    , { method: 'GET' });
  await act(async () => {
    //select server, mock list should return:
    await userEvent.selectOptions(serverDropdown, dataServers[0].baseUrl);
    fetchMock.restore();
  });

  await act(async () => {
    await userEvent.selectOptions(measureDropdown, mockMeasureList[0].name);
  });

  //mock knowledge repo json data:
  const dataRequirementsFetch = new DataRequirementsFetch(dataServers[0],
    mockMeasureList[0].name,
    startDate,
    endDate);
  fetchMock.once(dataRequirementsFetch.getUrl(), 400);
  await act(async () => {
    const getDataRequirementsButton: HTMLButtonElement = screen.getByTestId('get-data-requirements-button');
    await fireEvent.click(getDataRequirementsButton);
    fetchMock.restore();
  });

  expect(resultsTextField.value).toEqual(StringUtils.format(Constants.fetchError,
    dataRequirementsFetch.getUrl(), FetchType.DATA_REQUIREMENTS, 'FetchError: invalid json response body at http://localhost:8080/1/Measure/BreastCancerScreeningsFHIR/$data-requirements?periodStart=2019-01-01&periodEnd=2019-12-31 reason: Unexpected end of JSON input'));

});

test('success scenario: data repository', async () => {
  const dataServers: Server[] = Constants.serverTestData;

  const mockMeasureList: Measure[] = await buildMeasureData(dataServers[0].baseUrl);
  const mockPatientList: string[] = await buildPatientData(dataServers[0].baseUrl);

  await act(async () => {
    await render(<App />);
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

  //select server, mock list should return:
  await act(async () => {
    const patientFetch = new PatientFetch(dataServers[0].baseUrl);
    const mockJsonPatientData = jsonTestPatientsData;
    fetchMock.once(patientFetch.getUrl(),
      JSON.stringify(mockJsonPatientData)
      , { method: 'GET' });
    await userEvent.selectOptions(serverDropdown, dataServers[0].baseUrl);
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
    await userEvent.selectOptions(knowledgeRepoServerDropdown, dataServers[0].baseUrl);
    fetchMock.restore();
  });

  const patientDropdown: HTMLSelectElement = screen.getByTestId('data-repo-patient-dropdown');
  userEvent.selectOptions(patientDropdown, mockPatientList[0]);

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
    fetchMock.restore();
  });

  expect(resultsTextField.value).toEqual(JSON.stringify(mockJsonCollectDataData, undefined, 2));

});

test('fail scenario: data repository', async () => {
  const dataServers: Server[] = Constants.serverTestData;

  const mockMeasureList: Measure[] = await buildMeasureData(dataServers[0].baseUrl);
  const mockPatientList: string[] = await buildPatientData(dataServers[0].baseUrl);

  await act(async () => {
    await render(<App />);
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

  //select server, mock list should return:
  await act(async () => {
    const patientFetch = new PatientFetch(dataServers[0].baseUrl);
    const mockJsonPatientData = jsonTestPatientsData;
    fetchMock.once(patientFetch.getUrl(),
      JSON.stringify(mockJsonPatientData)
      , { method: 'GET' });
    await userEvent.selectOptions(serverDropdown, dataServers[0].baseUrl);
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
    await userEvent.selectOptions(knowledgeRepoServerDropdown, dataServers[0].baseUrl);
    fetchMock.restore();
  });

  const patientDropdown: HTMLSelectElement = screen.getByTestId('data-repo-patient-dropdown');
  userEvent.selectOptions(patientDropdown, mockPatientList[0]);

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
    fetchMock.restore();
  });

  expect(resultsTextField.value).toEqual(StringUtils.format(Constants.fetchError,
    collectDataFetch.getUrl(), FetchType.COLLECT_DATA, 'FetchError: invalid json response body at http://localhost:8080/1/Measure/BreastCancerScreeningsFHIR/$collect-data?periodStart=2019-01-01&periodEnd=2019-12-31&subject=BreastCancerScreeningsFHIR reason: Unexpected end of JSON input'));

});

test('success scenarios: receiving system', async () => {
  const dataServers: Server[] = Constants.serverTestData;

  const mockMeasureList: Measure[] = await buildMeasureData(dataServers[0].baseUrl);
  const mockPatientList: string[] = await buildPatientData(dataServers[0].baseUrl);

  await act(async () => {
    await render(<App />);
  });

  const startDateControl: HTMLInputElement = screen.getByTestId('start-date-control');
  const startDate = startDateControl.value;

  const endDateControl: HTMLInputElement = screen.getByTestId('end-date-control');
  const endDate = endDateControl.value;

  //unhide data repo
  const dataRepoShowButton: HTMLButtonElement = screen.getByTestId('data-repo-show-section-button');
  fireEvent.click(dataRepoShowButton);
  await waitFor(() => expect(screen.getByTestId('data-repo-collect-data-button')).toBeInTheDocument());

  //unhide recieving system:
  const showButton: HTMLButtonElement = screen.getByTestId('rec-sys-show-section-button');
  fireEvent.click(showButton);
  await waitFor(() => expect(screen.getByTestId('rec-sys-evaluate-button')).toBeInTheDocument());

  const serverDropdown: HTMLSelectElement = screen.getByTestId('rec-sys-server-dropdown');
  const knowledgeRepoServerDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-server-dropdown');
  const dataRepoServerDropdown: HTMLSelectElement = screen.getByTestId('data-repo-server-dropdown');

  await act(async () => {
    await userEvent.selectOptions(serverDropdown, dataServers[0].baseUrl);
  });

  //mock measure list server selection will return 
  const measureFetch = new MeasureFetch(dataServers[0].baseUrl);
  const mockJsonMeasureData = jsonTestMeasureData;
  fetchMock.once(measureFetch.getUrl(),
    JSON.stringify(mockJsonMeasureData)
    , { method: 'GET' });
  await act(async () => {
    //select server, mock list should return:
    await userEvent.selectOptions(knowledgeRepoServerDropdown, dataServers[0].baseUrl);
    fetchMock.restore();
  });

  //select server, mock list should return:
  await act(async () => {
    const patientFetch = new PatientFetch(dataServers[0].baseUrl);
    const mockJsonPatientData = jsonTestPatientsData;
    fetchMock.once(patientFetch.getUrl(),
      JSON.stringify(mockJsonPatientData)
      , { method: 'GET' });
    await userEvent.selectOptions(dataRepoServerDropdown, dataServers[0].baseUrl);
  });
  fetchMock.restore();

  const patientDropdown: HTMLSelectElement = screen.getByTestId('data-repo-patient-dropdown');
  userEvent.selectOptions(patientDropdown, mockPatientList[0]);

  const knowledgeRepoMeasureDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-measure-dropdown');
  userEvent.selectOptions(knowledgeRepoMeasureDropdown, mockMeasureList[0].name);

  //mock returned data repo data
  const evaluateDataFetch = new EvaluateMeasureFetch(dataServers[0],
    mockPatientList[0],
    mockMeasureList[0].name,
    startDate,
    endDate);
  const mockJsonResultsData = jsonTestResultsData;
  fetchMock.once(evaluateDataFetch.getUrl(),
    JSON.stringify(mockJsonResultsData)
    , { method: 'GET' });

  await act(async () => {
    const evaluateButton: HTMLButtonElement = screen.getByTestId('rec-sys-evaluate-button');
    await fireEvent.click(evaluateButton);

    fetchMock.restore();
  });

  const resultsTextField: HTMLTextAreaElement = screen.getByTestId('results-text');
  expect(resultsTextField.value).toEqual(JSON.stringify(mockJsonResultsData, undefined, 2));

  const measureScoringDiv: HTMLDivElement = screen.getByTestId('measure-scoring-div');
  const initialPopulationDiv: HTMLDivElement = screen.getByTestId('initial-population-div');
  const denominatorDiv: HTMLDivElement = screen.getByTestId('denominator-div');
  const denominatorExclusionDiv: HTMLDivElement = screen.getByTestId('denominator-exclusion-div');
  const denominatorExceptionDiv: HTMLDivElement = screen.getByTestId('denominator-exception-div');
  const numeratorDiv: HTMLDivElement = screen.getByTestId('numerator-div');
  const numeratorExclusionDiv: HTMLDivElement = screen.getByTestId('numerator-exclusion-div');

  expect(measureScoringDiv).toBeInTheDocument();
  expect(initialPopulationDiv).toBeInTheDocument();
  expect(denominatorDiv).toBeInTheDocument();
  expect(denominatorExclusionDiv).toBeInTheDocument();
  expect(denominatorExceptionDiv).toBeInTheDocument();
  expect(numeratorDiv).toBeInTheDocument();
  expect(numeratorExclusionDiv).toBeInTheDocument();

  expect(measureScoringDiv.innerHTML).toEqual('proportion');
  expect(initialPopulationDiv.innerHTML).toEqual('1');
  expect(denominatorDiv.innerHTML).toEqual('1');
  expect(denominatorExclusionDiv.innerHTML).toEqual('0');
  expect(denominatorExceptionDiv.innerHTML).toEqual('-');
  expect(numeratorDiv.innerHTML).toEqual('0');
  expect(numeratorExclusionDiv.innerHTML).toEqual('-');

});

test('success scenarios: receiving system - submit data', async () => {
  const dataServers: Server[] = Constants.serverTestData;

  const mockMeasureList: Measure[] = await buildMeasureData(dataServers[0].baseUrl);
  const mockPatientList: string[] = await buildPatientData(dataServers[0].baseUrl);

  await act(async () => {
    await render(<App />);
  });

  const startDateControl: HTMLInputElement = screen.getByTestId('start-date-control');
  const startDate = startDateControl.value;

  const endDateControl: HTMLInputElement = screen.getByTestId('end-date-control');
  const endDate = endDateControl.value;

  //unhide data repo
  const dataRepoShowButton: HTMLButtonElement = screen.getByTestId('data-repo-show-section-button');
  fireEvent.click(dataRepoShowButton);
  await waitFor(() => expect(screen.getByTestId('data-repo-collect-data-button')).toBeInTheDocument());

  //unhide recieving system:
  const showButton: HTMLButtonElement = screen.getByTestId('rec-sys-show-section-button');
  fireEvent.click(showButton);
  await waitFor(() => expect(screen.getByTestId('rec-sys-evaluate-button')).toBeInTheDocument());

  const serverDropdown: HTMLSelectElement = screen.getByTestId('rec-sys-server-dropdown');
  const knowledgeRepoServerDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-server-dropdown');
  const dataRepoServerDropdown: HTMLSelectElement = screen.getByTestId('data-repo-server-dropdown');

  await act(async () => {
    await userEvent.selectOptions(serverDropdown, dataServers[0].baseUrl);
  });

  //mock measure list server selection will return 
  const measureFetch = new MeasureFetch(dataServers[0].baseUrl);
  const mockJsonMeasureData = jsonTestMeasureData;
  fetchMock.once(measureFetch.getUrl(),
    JSON.stringify(mockJsonMeasureData)
    , { method: 'GET' });
  await act(async () => {
    //select server, mock list should return:
    await userEvent.selectOptions(knowledgeRepoServerDropdown, dataServers[0].baseUrl);
    fetchMock.restore();
  });

  //select server, mock list should return:
  await act(async () => {
    const patientFetch = new PatientFetch(dataServers[0].baseUrl);
    const mockJsonPatientData = jsonTestPatientsData;
    fetchMock.once(patientFetch.getUrl(),
      JSON.stringify(mockJsonPatientData)
      , { method: 'GET' });
    await userEvent.selectOptions(dataRepoServerDropdown, dataServers[0].baseUrl);
  });
  fetchMock.restore();

  const patientDropdown: HTMLSelectElement = screen.getByTestId('data-repo-patient-dropdown');
  userEvent.selectOptions(patientDropdown, mockPatientList[0]);

  const knowledgeRepoMeasureDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-measure-dropdown');
  userEvent.selectOptions(knowledgeRepoMeasureDropdown, mockMeasureList[0].name);

  //collect data first:
  const mockJsonCollectDataData = jsonTestCollectDataData;
  await act(async () => {
    const collectDataFetch = new CollectDataFetch(dataServers[0],
      mockMeasureList[0].name,
      startDate,
      endDate,
      mockPatientList[0]);
    fetchMock.once(collectDataFetch.getUrl(),
      JSON.stringify(mockJsonCollectDataData)
      , { method: 'GET' });
    const collectDataButton: HTMLButtonElement = screen.getByTestId('data-repo-collect-data-button');
    await fireEvent.click(collectDataButton);
    fetchMock.restore();
  });

  const submitDataFetch = new SubmitDataFetch(dataServers[0], mockMeasureList[0].name, JSON.stringify(mockJsonCollectDataData, undefined, 2));
  await act(async () => {
    fetchMock.once(submitDataFetch.getUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"prop1": "val1", "prop2": "val2"}',
    });
    const submitButton: HTMLButtonElement = screen.getByTestId('rec-sys-submit-button');
    await fireEvent.click(submitButton);

    fetchMock.restore();
  });

  const resultsTextField: HTMLTextAreaElement = screen.getByTestId('results-text');
  expect(resultsTextField.value).toEqual(Constants.dataSubmitted);

});

test('fail scenarios: receiving system - submit data', async () => {
  const dataServers: Server[] = Constants.serverTestData;

  const mockMeasureList: Measure[] = await buildMeasureData(dataServers[0].baseUrl);
  const mockPatientList: string[] = await buildPatientData(dataServers[0].baseUrl);

  await act(async () => {
    await render(<App />);
  });

  const startDateControl: HTMLInputElement = screen.getByTestId('start-date-control');
  const startDate = startDateControl.value;

  const endDateControl: HTMLInputElement = screen.getByTestId('end-date-control');
  const endDate = endDateControl.value;

  //unhide data repo
  const dataRepoShowButton: HTMLButtonElement = screen.getByTestId('data-repo-show-section-button');
  fireEvent.click(dataRepoShowButton);
  await waitFor(() => expect(screen.getByTestId('data-repo-collect-data-button')).toBeInTheDocument());

  //unhide recieving system:
  const showButton: HTMLButtonElement = screen.getByTestId('rec-sys-show-section-button');
  fireEvent.click(showButton);
  await waitFor(() => expect(screen.getByTestId('rec-sys-evaluate-button')).toBeInTheDocument());

  const serverDropdown: HTMLSelectElement = screen.getByTestId('rec-sys-server-dropdown');
  const knowledgeRepoServerDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-server-dropdown');
  const dataRepoServerDropdown: HTMLSelectElement = screen.getByTestId('data-repo-server-dropdown');

  await act(async () => {
    await userEvent.selectOptions(serverDropdown, dataServers[0].baseUrl);
  });

  //mock measure list server selection will return 
  const measureFetch = new MeasureFetch(dataServers[0].baseUrl);
  const mockJsonMeasureData = jsonTestMeasureData;
  fetchMock.once(measureFetch.getUrl(),
    JSON.stringify(mockJsonMeasureData)
    , { method: 'GET' });
  await act(async () => {
    //select server, mock list should return:
    await userEvent.selectOptions(knowledgeRepoServerDropdown, dataServers[0].baseUrl);
    fetchMock.restore();
  });

  //select server, mock list should return:
  await act(async () => {
    const patientFetch = new PatientFetch(dataServers[0].baseUrl);
    const mockJsonPatientData = jsonTestPatientsData;
    fetchMock.once(patientFetch.getUrl(),
      JSON.stringify(mockJsonPatientData)
      , { method: 'GET' });
    await userEvent.selectOptions(dataRepoServerDropdown, dataServers[0].baseUrl);
  });
  fetchMock.restore();

  const patientDropdown: HTMLSelectElement = screen.getByTestId('data-repo-patient-dropdown');
  userEvent.selectOptions(patientDropdown, mockPatientList[0]);

  const knowledgeRepoMeasureDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-measure-dropdown');
  userEvent.selectOptions(knowledgeRepoMeasureDropdown, mockMeasureList[0].name);

  //collect data first:
  const mockJsonCollectDataData = jsonTestCollectDataData;
  await act(async () => {
    const collectDataFetch = new CollectDataFetch(dataServers[0],
      mockMeasureList[0].name,
      startDate,
      endDate,
      mockPatientList[0]);
    fetchMock.once(collectDataFetch.getUrl(),
      JSON.stringify(mockJsonCollectDataData)
      , { method: 'GET' });
    const collectDataButton: HTMLButtonElement = screen.getByTestId('data-repo-collect-data-button');
    await fireEvent.click(collectDataButton);

    fetchMock.restore();
  });

  const submitDataFetch = new SubmitDataFetch(dataServers[0], mockMeasureList[0].name, JSON.stringify(mockJsonCollectDataData, undefined, 2));

  await act(async () => {
    fetchMock.once(submitDataFetch.getUrl(), 400);
    const submitButton: HTMLButtonElement = screen.getByTestId('rec-sys-submit-button');
    await fireEvent.click(submitButton);

    fetchMock.restore();
  });

  const resultsTextField: HTMLTextAreaElement = screen.getByTestId('results-text');
  expect(resultsTextField.value).toEqual(StringUtils.format(Constants.fetchError,
    submitDataFetch.getUrl(), FetchType.SUBMIT_DATA, 'Error: Bad Request'));


});

test('fail scenario: receiving system', async () => {
  const dataServers: Server[] = Constants.serverTestData;


  const mockMeasureList: Measure[] = await buildMeasureData(dataServers[0].baseUrl);
  const mockPatientList: string[] = await buildPatientData(dataServers[0].baseUrl);

  await act(async () => {
    await render(<App />);
  });

  const startDateControl: HTMLInputElement = screen.getByTestId('start-date-control');
  const startDate = startDateControl.value;

  const endDateControl: HTMLInputElement = screen.getByTestId('end-date-control');
  const endDate = endDateControl.value;

  //unhide data repo
  const dataRepoShowButton: HTMLButtonElement = screen.getByTestId('data-repo-show-section-button');
  fireEvent.click(dataRepoShowButton);
  await waitFor(() => expect(screen.getByTestId('data-repo-collect-data-button')).toBeInTheDocument());

  //unhide recieving system:
  const showButton: HTMLButtonElement = screen.getByTestId('rec-sys-show-section-button');
  fireEvent.click(showButton);
  await waitFor(() => expect(screen.getByTestId('rec-sys-evaluate-button')).toBeInTheDocument());

  const serverDropdown: HTMLSelectElement = screen.getByTestId('rec-sys-server-dropdown');
  const knowledgeRepoServerDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-server-dropdown');
  const dataRepoServerDropdown: HTMLSelectElement = screen.getByTestId('data-repo-server-dropdown');

  await act(async () => {
    await userEvent.selectOptions(serverDropdown, dataServers[0].baseUrl);
  });


  //mock measure list server selection will return 
  const measureFetch = new MeasureFetch(dataServers[0].baseUrl);
  const mockJsonMeasureData = jsonTestMeasureData;
  fetchMock.once(measureFetch.getUrl(),
    JSON.stringify(mockJsonMeasureData)
    , { method: 'GET' });
  await act(async () => {
    //select server, mock list should return:
    await userEvent.selectOptions(knowledgeRepoServerDropdown, dataServers[0].baseUrl);
    fetchMock.restore();
  });

  //select server, mock list should return:
  await act(async () => {
    const patientFetch = new PatientFetch(dataServers[0].baseUrl);
    const mockJsonPatientData = jsonTestPatientsData;
    fetchMock.once(patientFetch.getUrl(),
      JSON.stringify(mockJsonPatientData)
      , { method: 'GET' });
    await userEvent.selectOptions(dataRepoServerDropdown, dataServers[0].baseUrl);
  });
  fetchMock.restore();

  const patientDropdown: HTMLSelectElement = screen.getByTestId('data-repo-patient-dropdown');
  userEvent.selectOptions(patientDropdown, mockPatientList[0]);

  const knowledgeRepoMeasureDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-measure-dropdown');
  userEvent.selectOptions(knowledgeRepoMeasureDropdown, mockMeasureList[0].name);


  //mock returned data repo data
  const evaluateDataFetch = new EvaluateMeasureFetch(dataServers[0],
    mockPatientList[0],
    mockMeasureList[0].name,
    startDate,
    endDate);
  fetchMock.once(evaluateDataFetch.getUrl(), 400);

  await act(async () => {
    const evaluateButton: HTMLButtonElement = screen.getByTestId('rec-sys-evaluate-button');
    await fireEvent.click(evaluateButton);

    fetchMock.restore();
  });

  const resultsTextField: HTMLTextAreaElement = screen.getByTestId('results-text');
  expect(resultsTextField.value).toEqual(StringUtils.format(Constants.fetchError,
    evaluateDataFetch.getUrl(), FetchType.EVALUATE_MEASURE, 'FetchError: invalid json response body at http://localhost:8080/1/Measure/BreastCancerScreeningsFHIR/$evaluate-measure?subject=BreastCancerScreeningsFHIR&periodStart=2019-01-01&periodEnd=2019-12-31 reason: Unexpected end of JSON input'));



});

test('fail scenarios: fetchMeasure', async () => {
  await act(async () => {
    await render(<App />);
  });
  const dataServers: Server[] = await Constants.serverTestData;


  const resultsTextField: HTMLTextAreaElement = screen.getByTestId('results-text');

  //get knowledge server dropdown
  const serverDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-server-dropdown');

  //mock measure list server selection will return 
  const measureFetch = new MeasureFetch(dataServers[0].baseUrl);
  fetchMock.once(measureFetch.getUrl(), 400);
  await act(async () => {
    //select server, mock list should return:
    await userEvent.selectOptions(serverDropdown, dataServers[0].baseUrl);
    fetchMock.restore();
  });

  expect(resultsTextField.value).toEqual(StringUtils.format(Constants.fetchError,
    measureFetch.getUrl(), FetchType.MEASURE, 'FetchError: invalid json response body at http://localhost:8080/1//Measure?_count=200 reason: Unexpected end of JSON input'));

});

test('fail scenarios: fetchPatient', async () => {
  await act(async () => {
    await render(<App />);
  });
  const dataServers: Server[] = Constants.serverTestData;

  //unhide data repo
  const dataRepoShowButton: HTMLButtonElement = screen.getByTestId('data-repo-show-section-button');
  fireEvent.click(dataRepoShowButton);
  await waitFor(() => expect(screen.getByTestId('data-repo-collect-data-button')).toBeInTheDocument());

  //unhide recieving system:
  const showButton: HTMLButtonElement = screen.getByTestId('rec-sys-show-section-button');
  fireEvent.click(showButton);
  await waitFor(() => expect(screen.getByTestId('rec-sys-evaluate-button')).toBeInTheDocument());

  const serverDropdown: HTMLSelectElement = screen.getByTestId('rec-sys-server-dropdown');
  const knowledgeRepoServerDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-server-dropdown');
  const dataRepoServerDropdown: HTMLSelectElement = screen.getByTestId('data-repo-server-dropdown');

  await act(async () => {
    await userEvent.selectOptions(serverDropdown, dataServers[0].baseUrl);
  });

  //mock measure list server selection will return 
  const measureFetch = new MeasureFetch(dataServers[0].baseUrl);
  const mockJsonMeasureData = jsonTestMeasureData;
  fetchMock.once(measureFetch.getUrl(),
    JSON.stringify(mockJsonMeasureData)
    , { method: 'GET' });
  await act(async () => {
    //select server, mock list should return:
    await userEvent.selectOptions(knowledgeRepoServerDropdown, dataServers[0].baseUrl);
    fetchMock.restore();
  });

  //select server, mock list should return:
  const patientFetch = new PatientFetch(dataServers[0].baseUrl);
  await act(async () => {
    fetchMock.once(patientFetch.getUrl(), 400);
    await userEvent.selectOptions(dataRepoServerDropdown, dataServers[0].baseUrl);
  });
  fetchMock.restore();
  const resultsTextField: HTMLTextAreaElement = screen.getByTestId('results-text');
  expect(resultsTextField.value).toEqual(StringUtils.format(Constants.fetchError,
    patientFetch.getUrl(), FetchType.PATIENT, 'FetchError: invalid json response body at http://localhost:8080/1//Patient?_count=200 reason: Unexpected end of JSON input'));
});


//MISSING SELECTIONS:
test('error scenarios: knowledge repository', async () => {
  await act(async () => {
    await render(<App />);
  });
  const dataServers: Server[] = Constants.serverTestData;

  //click get data requirements, 
  const getDataRequirementsButton: HTMLButtonElement = screen.getByTestId('get-data-requirements-button');
  fireEvent.click(getDataRequirementsButton);

  //check results for error:
  const resultsTextField: HTMLTextAreaElement = screen.getByTestId('results-text');
  expect(resultsTextField).toBeInTheDocument();
  expect(resultsTextField.value).toEqual(Constants.error_selectKnowledgeRepository);

  //get knowledge server dropdown
  const serverDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-server-dropdown');

  //mock measure list server selection will return 
  const measureFetch = new MeasureFetch(dataServers[0].baseUrl);
  const mockJsonMeasureData = jsonTestMeasureData;
  fetchMock.once(measureFetch.getUrl(),
    JSON.stringify(mockJsonMeasureData)
    , { method: 'GET' });
  //select server, mock list should return:
  await act(async () => {
    await userEvent.selectOptions(serverDropdown, dataServers[0].baseUrl);
  });
  fetchMock.restore();

  //check results for error:
  fireEvent.click(getDataRequirementsButton);
  expect(resultsTextField.value).toEqual(Constants.error_selectMeasureDR);

});

test('error scenario: data repository', async () => {
  await act(async () => {
    await render(<App />);
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

  const patientFetch = new PatientFetch(dataServers[0].baseUrl);
  const mockJsonPatientData = jsonTestPatientsData;
  fetchMock.once(patientFetch.getUrl(),
    JSON.stringify(mockJsonPatientData)
    , { method: 'GET' });
  //select server, mock list should return:
  await act(async () => {
    await userEvent.selectOptions(serverDropdown, dataServers[0].baseUrl);
  });
  fetchMock.restore();

  //check results for error:
  fireEvent.click(collectDataButton);
  expect(resultsTextField.value).toEqual(Constants.error_selectMeasureDataCollection);

});

test('error scenarios: receiving system', async () => {
  await act(async () => {
    await render(<App />);
  });
  const dataServers: Server[] = Constants.serverTestData;

  //unhide recieving system:
  const showButton: HTMLButtonElement = screen.getByTestId('rec-sys-show-section-button');
  fireEvent.click(showButton);
  await waitFor(() => expect(screen.getByTestId('rec-sys-evaluate-button')).toBeInTheDocument());

  //click submit data, 
  const submitButton: HTMLButtonElement = screen.getByTestId('rec-sys-submit-button');
  fireEvent.click(submitButton);

  //check results for error:
  const resultsTextField: HTMLTextAreaElement = screen.getByTestId('results-text');
  expect(resultsTextField).toBeInTheDocument();
  expect(resultsTextField.value).toEqual(Constants.error_selectMeasureToSubmit);

  const serverDropdown: HTMLSelectElement = screen.getByTestId('rec-sys-server-dropdown');
  userEvent.selectOptions(serverDropdown, dataServers[0].baseUrl);

  await act(async () => {
    await fireEvent.click(submitButton);
  });

  expect(resultsTextField.value).toEqual(Constants.error_selectMeasureDataCollection);

});

test('error scenario: Please select a Receiving System server to use', async () => {
  await act(async () => {
    await render(<App />);
  });
  const dataServers: Server[] = Constants.serverTestData;

  //unhide recieving system:
  const showButton: HTMLButtonElement = screen.getByTestId('rec-sys-show-section-button');
  fireEvent.click(showButton);
  await waitFor(() => expect(screen.getByTestId('rec-sys-evaluate-button')).toBeInTheDocument());

  //click evaluate measure, 
  const evaluateButton: HTMLButtonElement = screen.getByTestId('rec-sys-evaluate-button');
  fireEvent.click(evaluateButton);

  //check results for error:
  const resultsTextField: HTMLTextAreaElement = screen.getByTestId('results-text');
  expect(resultsTextField).toBeInTheDocument();
  expect(resultsTextField.value).toEqual(Constants.error_receivingSystemServer);

  const serverDropdown: HTMLSelectElement = screen.getByTestId('rec-sys-server-dropdown');
  userEvent.selectOptions(serverDropdown, dataServers[0].baseUrl);

  await act(async () => {
    await fireEvent.click(evaluateButton);
  });

  expect(resultsTextField.value).toEqual(Constants.error_selectMeasure);

});

//RENDERING:
test('renders knowledge repo properly', async () => {
  const dataServers: Server[] = Constants.serverTestData;

  const mockMeasureList: Measure[] = await buildMeasureData(dataServers[0].baseUrl);

  await act(async () => {
    await render(<App />);
  });
  //Knowledge Repository
  //hide section, show section
  const hideButton: HTMLButtonElement = screen.getByTestId('knowledge-repo-hide-section-button');
  fireEvent.click(hideButton);
  expect(screen.getByTestId('selected-measure-div')).toBeInTheDocument();
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
  expect(screen.getByTestId('selected-measure-div')).toBeInTheDocument();

  //restore section to get to button
  fireEvent.click(showButton);

  //click Get Data Requirements
  const getDataRequirementsButton: HTMLButtonElement = screen.getByTestId('get-data-requirements-button');
  // fireEvent.click(getDataRequirementsButton);

  // //check loading state:
  // expect(screen.getByTestId('get-data-requirements-button-spinner')).toBeInTheDocument();

});

test('renders data repo properly', async () => {
  const dataServers: Server[] = Constants.serverTestData;

  const url = dataServers[0].baseUrl;
  const mockPatientList: string[] = await buildPatientData(url);

  await act(async () => {
    await render(<App />);
  });

  //Data Repository
  //section is hidden by default, show section:
  const showButton: HTMLButtonElement = screen.getByTestId('data-repo-show-section-button');
  fireEvent.click(showButton);
  await waitFor(() => expect(screen.getByTestId('data-repo-collect-data-button')).toBeInTheDocument());

  //get repo server dropdown
  const serverDropdown: HTMLSelectElement = screen.getByTestId('data-repo-server-dropdown');
  //mock patient list server selection will return
  const patientFetch = new PatientFetch(url);
  const mockJsonPatientsData = jsonTestPatientsData;
  fetchMock.once(patientFetch.getUrl(),
    JSON.stringify(mockJsonPatientsData)
    , { method: 'GET' });

  userEvent.selectOptions(serverDropdown, url);
  fetchMock.restore();

  //select known patient
  const patientDropdown: HTMLSelectElement = screen.getByTestId('data-repo-patient-dropdown');
  await waitFor(() => expect(patientDropdown.options.length > 10).toBeTruthy());
  userEvent.selectOptions(patientDropdown, mockPatientList[1]);

  //click Collect Data
  const getDataRequirementsButton: HTMLButtonElement = screen.getByTestId('data-repo-collect-data-button');
  fireEvent.click(getDataRequirementsButton);

  //check loading state:
  //TODO: This isn't working:
  //await waitFor(() => expect(screen.getByTestId('data-repo-collect-data-button-spinner')).toBeInTheDocument());
});

test('renders recieving system properly', async () => {
  const dataServer: Server = (Constants.serverTestData)[0];

  await act(async () => {
    await render(<App />);
  });

  //Recieving System
  //section is hidden by default, show section:
  const showButton: HTMLButtonElement = screen.getByTestId('rec-sys-show-section-button');
  fireEvent.click(showButton);
  await waitFor(() => expect(screen.getByTestId('rec-sys-evaluate-button')).toBeInTheDocument());

  //get recieving system server dropdown
  const serverDropdown: HTMLSelectElement = screen.getByTestId('rec-sys-server-dropdown');
  userEvent.selectOptions(serverDropdown, dataServer.baseUrl);

  //click Submit Data
  const submitButton: HTMLButtonElement = screen.getByTestId('rec-sys-submit-button');
  // fireEvent.click(submitButton);

  //expect(screen.getByTestId('rec-sys-submit-button-spinner')).toBeInTheDocument()
});

test('renders recieving system properly', async () => {
  const dataServer: Server = (Constants.serverTestData)[0];

  await act(async () => {
    await render(<App />);
  });

  //Recieving System
  //section is hidden by default, show section:
  const showButton: HTMLButtonElement = screen.getByTestId('rec-sys-show-section-button');
  fireEvent.click(showButton);
  await waitFor(() => expect(screen.getByTestId('rec-sys-evaluate-button')).toBeInTheDocument());

  //get recieving system server dropdown
  const serverDropdown: HTMLSelectElement = screen.getByTestId('rec-sys-server-dropdown');
  userEvent.selectOptions(serverDropdown, dataServer.baseUrl);

  //click Evaluate Measure
  const evaluateButton: HTMLButtonElement = screen.getByTestId('rec-sys-evaluate-button');
  // fireEvent.click(evaluateButton);

  //expect(screen.getByTestId('rec-sys-evaluate-button-spinner')).toBeInTheDocument()
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

async function buildPatientData(url: string): Promise<string[]> {
  const patientFetch = new PatientFetch(url);
  const mockJsonPatientData = jsonTestPatientsData;
  fetchMock.once(patientFetch.getUrl(),
    JSON.stringify(mockJsonPatientData)
    , { method: 'GET' });
  let patientList: string[] = await patientFetch.fetchData('');
  fetchMock.restore();
  return patientList;
}