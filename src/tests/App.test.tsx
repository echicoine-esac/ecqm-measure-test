import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
  await waitFor(() => expect(screen.getByTestId('data-repo-evaluate-button')).toBeInTheDocument());

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
  const getDataRequirementsButton: HTMLButtonElement = screen.getByTestId('data-repo-evaluate-button');
  fireEvent.click(getDataRequirementsButton);

  //check loading state:
  //TODO: This isn't working:
  //await waitFor(() => expect(screen.getByTestId('data-repo-evaluate-button-spinner')).toBeInTheDocument());
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
  const submitButton: HTMLButtonElement = screen.getByTestId('rec-sys-evaluate-button');
  fireEvent.click(submitButton);

  //expect(screen.getByTestId('rec-sys-evaluate-button-spinner')).toBeInTheDocument()
});