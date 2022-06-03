import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import App from '../App';
import { Constants } from '../constants/Constants';

test('renders properly', () => {
  const { getByTestId } = render(<App />);
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
  const serverDropdown: HTMLSelectElement = screen.getByTestId('server-dropdown');
  const measureDropdown: HTMLSelectElement = screen.getByTestId('measure-dropdown');
  const patientDropdown: HTMLSelectElement = screen.getByTestId('patient-dropdown');
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
  const serverDropdown: HTMLSelectElement = screen.getByTestId('server-dropdown');

  userEvent.selectOptions(serverDropdown, Constants.getServerUrls()[1]);

  fireEvent.click(evaluateButton)
  expect(resultsTextField.value).toEqual(Constants.error_selectMeasure);

});