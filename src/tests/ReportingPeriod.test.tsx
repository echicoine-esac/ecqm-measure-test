import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import ReportingPeriod from '../components/ReportingPeriod';

test('renders', () => {

  const startDateText = '2000-01-01';
  const endDateText = '2020-02-02';
  
  const newStartDateText = '2011-11-11';
  const newEndDateText = '2012-12-12';

  const setStartDate = jest.fn();
  const setEndDate = jest.fn();

  render(<ReportingPeriod
    startDate={startDateText}
    endDate={endDateText}
    setStartDate={setStartDate}
    setEndDate={setEndDate}
  />);

  const startDateControl: HTMLInputElement = screen.getByTestId("start-date-control");
  expect (startDateControl.value).toEqual(startDateText);

  const endDateControl: HTMLInputElement = screen.getByTestId("end-date-control");
  expect (endDateControl.value).toEqual(endDateText);
  
  fireEvent.change(startDateControl, { target: { value: newStartDateText } });
  expect(setStartDate).toHaveBeenCalledWith(newStartDateText)

  fireEvent.change(endDateControl, { target: { value: newEndDateText } });
  expect(setEndDate).toHaveBeenCalledWith(newEndDateText)

});