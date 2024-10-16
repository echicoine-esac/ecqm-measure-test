import { render, screen } from '@testing-library/react';
import Results from '../../components/Results';
import { Outcome } from '../../models/OutcomeTracker';
beforeAll(() => {
  global.URL.createObjectURL = jest.fn();
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
  Object.defineProperty(window.screen, 'orientation', {
    writable: true,
    value: { type: 'landscape-primary' },  
  });
});

test('results text renders and accepts value', () => {
  const outcomeText = 'outcome-text';
  const resultsText = 'results-text';
  render(<Results outcomeTracker={
    {
      outcomeMessage: outcomeText, 
      outcomeType: Outcome.NONE,
      jsonFormattedString: resultsText
    }
    } />);
  const resultsTextField: HTMLElement = screen.getByTestId('results-text');
  expect(resultsTextField).toBeInTheDocument();
  expect(resultsTextField.textContent).toEqual(resultsText);

  const outcomeTextField: HTMLElement = screen.getByTestId('outcome-results-text');
  expect(outcomeTextField).toBeInTheDocument();
  expect(outcomeTextField.textContent).toEqual(outcomeText);
}); 
