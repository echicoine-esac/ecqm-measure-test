import { render, screen } from '@testing-library/react';
import Results from '../../components/Results';
import { Outcome } from '../../models/OutcomeTracker';
beforeAll(() => {
  global.URL.createObjectURL = jest.fn();
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});
test('results text renders and accepts value', () => {
  const resultsText = 'text-results-text';
  render(<Results outcome={
    {outcomeMessage: resultsText, outcomeType: Outcome.NONE}
    } />);
  const resultsTextField: HTMLElement = screen.getByTestId('results-text');
  expect(resultsTextField).toBeInTheDocument();
  expect(resultsTextField.textContent).toEqual(resultsText);
}); 
