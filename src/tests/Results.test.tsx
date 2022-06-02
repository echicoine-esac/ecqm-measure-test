import { render, screen } from '@testing-library/react';
import React from 'react';
import Results from '../components/Results';

test('results text renders and accepts value', () => {
  const resultsText = "text-results-text";
  render(<Results results={resultsText}  />);
  const resultsTextField: HTMLTextAreaElement = screen.getByTestId("results-text");
  expect(resultsTextField).toBeInTheDocument();
  expect(resultsTextField.value).toEqual(resultsText);
});
