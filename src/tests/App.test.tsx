import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import React from 'react';
import App from '../App';
import { Constants } from '../constants/Constants';
import { MeasureFetch } from '../data/MeasureFetch';
import { PatientFetch } from '../data/PatientFetch';
import { Measure } from '../models/Measure';
import jsonTestMeasureData from '../tests/resources/fetchmock-measure.json';
import jsonTestPatientsData from '../tests/resources/fetchmock-patients.json';
import jsonTestDataRequirementsData from '../tests/resources/fetchmock-knowledge-repo.json';
import jsonTestCollectDataData from '../tests/resources/fetchmock-data-repo.json';
import jsonTestResultsData from '../tests/resources/fetchmock-results.json';
import { DataRequirementsFetch } from '../data/DataRequirementsFetch';
import { CollectDataFetch } from '../data/CollectDataFetch';
import { EvaluateMeasureFetch } from '../data/EvaluateMeasureFetch';

//JSON FETCH:
test('success scenarios: knowledge repository', async () => {
  const mockMeasureList: Measure[] = await buildMeasureData(Constants.getServerUrls()[0]);

  render(<App />);

  const startDateControl: HTMLInputElement = screen.getByTestId("start-date-control");
  const startDate = startDateControl.value;

  const endDateControl: HTMLInputElement = screen.getByTestId("end-date-control");
  const endDate = endDateControl.value;

  const resultsTextField: HTMLTextAreaElement = screen.getByTestId('results-text');

  //get knowledge server dropdown
  const serverDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-server-dropdown');
  const measureDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-measure-dropdown');

  //mock measure list server selection will return 
  const measureFetch = new MeasureFetch(Constants.getServerUrls()[0]);
  const mockJsonMeasureData = jsonTestMeasureData;
  fetchMock.once(measureFetch.getUrl(),
    JSON.stringify(mockJsonMeasureData)
    , { method: 'GET' });
  await act(async () => {
    //select server, mock list should return:
    await userEvent.selectOptions(serverDropdown, Constants.getServerUrls()[0]);
    fetchMock.restore();
  });

  await act(async () => {
    await userEvent.selectOptions(measureDropdown, mockMeasureList[0].name);
  });

  //mock knowledge repo json data:
  const dataRequirementsFetch = new DataRequirementsFetch(Constants.getServerUrls()[0],
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

test('success scenario: data repository', async () => {
  const mockMeasureList: Measure[] = await buildMeasureData(Constants.getServerUrls()[0]);
  const mockPatientList: string[] = await buildPatientData(Constants.getServerUrls()[0]);

  render(<App />);

  const startDateControl: HTMLInputElement = screen.getByTestId("start-date-control");
  const startDate = startDateControl.value;

  const endDateControl: HTMLInputElement = screen.getByTestId("end-date-control");
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
    const patientFetch = new PatientFetch(Constants.getServerUrls()[0]);
    const mockJsonPatientData = jsonTestPatientsData;
    fetchMock.once(patientFetch.getUrl(),
      JSON.stringify(mockJsonPatientData)
      , { method: 'GET' });
    await userEvent.selectOptions(serverDropdown, Constants.getServerUrls()[0]);
  });
  fetchMock.restore();

  //mock measure list server selection will return 
  const measureFetch = new MeasureFetch(Constants.getServerUrls()[0]);
  const mockJsonMeasureData = jsonTestMeasureData;
  fetchMock.once(measureFetch.getUrl(),
    JSON.stringify(mockJsonMeasureData)
    , { method: 'GET' });
  await act(async () => {
    //select server, mock list should return:
    await userEvent.selectOptions(knowledgeRepoServerDropdown, Constants.getServerUrls()[0]);
    fetchMock.restore();
  });

  const patientDropdown: HTMLSelectElement = screen.getByTestId('data-repo-patient-dropdown');
  userEvent.selectOptions(patientDropdown, mockPatientList[0]);

  const knowledgeRepoMeasureDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-measure-dropdown');
  userEvent.selectOptions(knowledgeRepoMeasureDropdown, mockMeasureList[0].name);

  //mock returned data repo data
  const collectDataFetch = new CollectDataFetch(Constants.getServerUrls()[0],
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

test('success scenarios: receiving system', async () => {
  const mockMeasureList: Measure[] = await buildMeasureData(Constants.getServerUrls()[0]);
  const mockPatientList: string[] = await buildPatientData(Constants.getServerUrls()[0]);

  render(<App />);

  const startDateControl: HTMLInputElement = screen.getByTestId("start-date-control");
  const startDate = startDateControl.value;

  const endDateControl: HTMLInputElement = screen.getByTestId("end-date-control");
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
    await userEvent.selectOptions(serverDropdown, Constants.getServerUrls()[0]);
  });


  //mock measure list server selection will return 
  const measureFetch = new MeasureFetch(Constants.getServerUrls()[0]);
  const mockJsonMeasureData = jsonTestMeasureData;
  fetchMock.once(measureFetch.getUrl(),
    JSON.stringify(mockJsonMeasureData)
    , { method: 'GET' });
  await act(async () => {
    //select server, mock list should return:
    await userEvent.selectOptions(knowledgeRepoServerDropdown, Constants.getServerUrls()[0]);
    fetchMock.restore();
  });

  //select server, mock list should return:
  await act(async () => {
    const patientFetch = new PatientFetch(Constants.getServerUrls()[0]);
    const mockJsonPatientData = jsonTestPatientsData;
    fetchMock.once(patientFetch.getUrl(),
      JSON.stringify(mockJsonPatientData)
      , { method: 'GET' });
    await userEvent.selectOptions(dataRepoServerDropdown, Constants.getServerUrls()[0]);
  });
  fetchMock.restore();

  const patientDropdown: HTMLSelectElement = screen.getByTestId('data-repo-patient-dropdown');
  userEvent.selectOptions(patientDropdown, mockPatientList[0]);

  const knowledgeRepoMeasureDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-measure-dropdown');
  userEvent.selectOptions(knowledgeRepoMeasureDropdown, mockMeasureList[0].name);


  //mock returned data repo data
  const evaluateDataFetch = new EvaluateMeasureFetch(Constants.getServerUrls()[0],
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

});
 
//MISSING SELECTIONS:
test('error scenarios: knowledge repository', async () => {
  render(<App />);

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
  const measureFetch = new MeasureFetch(Constants.getServerUrls()[0]);
  const mockJsonMeasureData = jsonTestMeasureData;
  fetchMock.once(measureFetch.getUrl(),
    JSON.stringify(mockJsonMeasureData)
    , { method: 'GET' });
  //select server, mock list should return:
  await act(async () => {
    await userEvent.selectOptions(serverDropdown, Constants.getServerUrls()[0]);
  });
  fetchMock.restore();

  //check results for error:
  fireEvent.click(getDataRequirementsButton);
  expect(resultsTextField.value).toEqual(Constants.error_selectMeasureDR);

});

test('error scenario: data repository', async () => {
  render(<App />);

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

  const patientFetch = new PatientFetch(Constants.getServerUrls()[0]);
  const mockJsonPatientData = jsonTestPatientsData;
  fetchMock.once(patientFetch.getUrl(),
    JSON.stringify(mockJsonPatientData)
    , { method: 'GET' });
  //select server, mock list should return:
  await act(async () => {
    await userEvent.selectOptions(serverDropdown, Constants.getServerUrls()[0]);
  });
  fetchMock.restore();

  //check results for error:
  fireEvent.click(collectDataButton);
  expect(resultsTextField.value).toEqual(Constants.error_selectMeasureDataCollection);

});

test('error scenarios: receiving system', async () => {
  render(<App />);

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
  expect(resultsTextField.value).toEqual(Constants.error_selectReceivingSystemServer);

  const serverDropdown: HTMLSelectElement = screen.getByTestId('rec-sys-server-dropdown');
  userEvent.selectOptions(serverDropdown, Constants.getServerUrls()[0]);

  await act(async () => {
    await fireEvent.click(submitButton);
  });

  expect(resultsTextField.value).toEqual(Constants.error_selectMeasureDataCollection);

});

test('error scenario: Please select a Receiving System server to use', async () => {
  render(<App />);

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
  userEvent.selectOptions(serverDropdown, Constants.getServerUrls()[0]);

  await act(async () => {
    await fireEvent.click(evaluateButton);
  });

  expect(resultsTextField.value).toEqual(Constants.error_selectMeasure);

});

//RENDERING:
test('renders knowledge repo properly', async () => {

  const mockMeasureList: Measure[] = await buildMeasureData(Constants.getServerUrls()[0]);

  render(<App />);
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
  const url = Constants.getServerUrls()[0];
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
  fireEvent.click(getDataRequirementsButton);

  //check loading state:
  expect(screen.getByTestId('get-data-requirements-button-spinner')).toBeInTheDocument();

});


test('renders data repo properly', async () => {
  const url = Constants.getServerUrls()[0];
  const mockPatientList: string[] = await buildPatientData(url);

  render(<App />);

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
  render(<App />);

  //Recieving System
  //section is hidden by default, show section:
  const showButton: HTMLButtonElement = screen.getByTestId('rec-sys-show-section-button');
  fireEvent.click(showButton);
  await waitFor(() => expect(screen.getByTestId('rec-sys-evaluate-button')).toBeInTheDocument());

  //get recieving system server dropdown
  const serverDropdown: HTMLSelectElement = screen.getByTestId('rec-sys-server-dropdown');
  userEvent.selectOptions(serverDropdown, Constants.getServerUrls()[1]);

  //click Submit Data
  const submitButton: HTMLButtonElement = screen.getByTestId('rec-sys-submit-button');
  fireEvent.click(submitButton);

  //expect(screen.getByTestId('rec-sys-submit-button-spinner')).toBeInTheDocument()
});

test('renders recieving system properly', async () => {
  render(<App />);

  //Recieving System
  //section is hidden by default, show section:
  const showButton: HTMLButtonElement = screen.getByTestId('rec-sys-show-section-button');
  fireEvent.click(showButton);
  await waitFor(() => expect(screen.getByTestId('rec-sys-evaluate-button')).toBeInTheDocument());

  //get recieving system server dropdown
  const serverDropdown: HTMLSelectElement = screen.getByTestId('rec-sys-server-dropdown');
  userEvent.selectOptions(serverDropdown, Constants.getServerUrls()[1]);

  //click Evaluate Measure
  const evaluateButton: HTMLButtonElement = screen.getByTestId('rec-sys-evaluate-button');
  fireEvent.click(evaluateButton);

  //expect(screen.getByTestId('rec-sys-evaluate-button-spinner')).toBeInTheDocument()
});


//mock measure and patient data
async function buildMeasureData(url: string): Promise<Measure[]> {
  const measureFetch = new MeasureFetch(url);
  const mockJsonMeasureData = jsonTestMeasureData;
  fetchMock.once(measureFetch.getUrl(),
    JSON.stringify(mockJsonMeasureData)
    , { method: 'GET' });
  let measureList: Measure[] = await measureFetch.fetchData();
  fetchMock.restore();
  return measureList;
}

async function buildPatientData(url: string): Promise<string[]> {
  const patientFetch = new PatientFetch(url);
  const mockJsonPatientData = jsonTestPatientsData;
  fetchMock.once(patientFetch.getUrl(),
    JSON.stringify(mockJsonPatientData)
    , { method: 'GET' });
  let patientList: string[] = await patientFetch.fetchData();
  fetchMock.restore();
  return patientList;
}