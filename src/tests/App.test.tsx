import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import App from '../App';
import { Constants } from '../constants/Constants';
import jsonTestData from './fetch-results.json';

test('renders properly', () => {
  render(<App />);
  const evalBtn = screen.getByTestId('evaluate-button');
  expect(evalBtn).toBeInTheDocument();

  const startDateControl: HTMLInputElement = screen.getByTestId("start-date-control");
  const endDateControl: HTMLInputElement = screen.getByTestId("end-date-control");
  const resultsTextField: HTMLTextAreaElement = screen.getByTestId("results-text");
  const initialPopulationDiv: HTMLDivElement = screen.getByTestId("initial-population-div");
  const denominatorDiv: HTMLDivElement = screen.getByTestId("denominator-div");
  const denominatorExclusionDiv: HTMLDivElement = screen.getByTestId("denominator-exclusion-div");
  const denominatorExceptionDiv: HTMLDivElement = screen.getByTestId("denominator-exception-div");
  const numeratorDiv: HTMLDivElement = screen.getByTestId("numerator-div");
  const numeratorExclusionDiv: HTMLDivElement = screen.getByTestId("numerator-exclusion-div");
  const serverDropdown:HTMLSelectElement = screen.getByTestId('server-dropdown');
  const measureDropdown:HTMLSelectElement  = screen.getByTestId('measure-dropdown');
  const patientDropdown:HTMLSelectElement  = screen.getByTestId('patient-dropdown');
  const evaluateButton: HTMLButtonElement = screen.getByTestId('evaluate-button');

  expect(startDateControl).toBeInTheDocument();
  expect(endDateControl).toBeInTheDocument();
  expect(resultsTextField).toBeInTheDocument();
  expect(initialPopulationDiv).toBeInTheDocument();
  expect(denominatorDiv).toBeInTheDocument();
  expect(denominatorExclusionDiv).toBeInTheDocument();
  expect(denominatorExceptionDiv).toBeInTheDocument();
  expect(numeratorDiv).toBeInTheDocument();
  expect(numeratorExclusionDiv).toBeInTheDocument();
  expect(serverDropdown).toBeInTheDocument;
  expect(measureDropdown).toBeInTheDocument;
  expect(patientDropdown).toBeInTheDocument;
  expect(evaluateButton).toBeInTheDocument;

});

test('evaluate without selection', () => {
  render(<App />);
  const evalBtn = screen.getByTestId('evaluate-button');
  expect(evalBtn).toBeInTheDocument();
 
  const evaluateButton: HTMLButtonElement = screen.getByTestId('evaluate-button');
  const resultsTextField: HTMLTextAreaElement = screen.getByTestId("results-text");

  fireEvent.click(evaluateButton)
  expect(resultsTextField.value).toEqual(Constants.error_selectTestServer);

});

test('evaluate without measure selection', () => {
  render(<App />);
  const evalBtn = screen.getByTestId('evaluate-button');
  expect(evalBtn).toBeInTheDocument();
 
  const evaluateButton: HTMLButtonElement = screen.getByTestId('evaluate-button');
  const resultsTextField: HTMLTextAreaElement = screen.getByTestId("results-text");
  const serverDropdown:HTMLSelectElement = screen.getByTestId('server-dropdown');

  userEvent.selectOptions(serverDropdown, Constants.getServerUrls()[1]);

  fireEvent.click(evaluateButton)
  expect(resultsTextField.value).toEqual(Constants.error_selectMeasure);

});

test('successful fetch', async () => {

  const jsonData = jsonTestData;
  const server =  'https://cloud.alphora.com/sandbox/r4/cqm/fhir/';
  const measure = 'BreastCancerScreeningsFHIR';
  const patient = 'patientwithcriteriaEtodolac';
  const callingMessage = 'Calling https://cloud.alphora.com/sandbox/r4/cqm/fhir/Measure/BreastCancerScreeningsFHIR/$evaluate-measure?subject=patientwithcriteriaEtodolac&periodStart=2019-01-01&periodEnd=2019-12-31...';
  
  render(<App />);
  const evalBtn = screen.getByTestId('evaluate-button');
  expect(evalBtn).toBeInTheDocument();
 
  const resultsTextField: HTMLTextAreaElement = screen.getByTestId("results-text");
  const serverDropdown:HTMLSelectElement = screen.getByTestId('server-dropdown');
  const measureDropdown:HTMLSelectElement  = screen.getByTestId('measure-dropdown');
  const patientDropdown:HTMLSelectElement  = screen.getByTestId('patient-dropdown');
  const evaluateButton: HTMLButtonElement = screen.getByTestId('evaluate-button');

  const startDateControl: HTMLInputElement = screen.getByTestId("start-date-control");
  expect (startDateControl.value).toEqual(Constants.defaultStartDate);


  const endDateControl: HTMLInputElement = screen.getByTestId("end-date-control");
  expect (endDateControl.value).toEqual(Constants.defaultEndDate);
  

  userEvent.selectOptions(serverDropdown, server);

  await waitFor(() => expect(measureDropdown.options.length > 10).toBeTruthy());
  userEvent.selectOptions(measureDropdown, measure);

  await waitFor(() => expect(patientDropdown.options.length > 10).toBeTruthy());
  userEvent.selectOptions(patientDropdown, patient);

  fireEvent.click(evaluateButton)
  //wait for spinner to show, then hide:
  await waitFor(() => expect(screen.getByTestId('evaluate-button-spinner')).toBeInTheDocument());
  
  expect(screen.getByTestId('evaluate-button-spinner')).toBeInTheDocument();
  
  await waitFor(() => expect(evaluateButton).toBeInTheDocument());

  expect(evaluateButton).toBeInTheDocument();

  await waitFor(() => expect(resultsTextField.value.length > callingMessage.length).toBeTruthy);

  console.log(resultsTextField.value);
  // expect(resultsTextField.value).toEqual(jsonData.toString());

});