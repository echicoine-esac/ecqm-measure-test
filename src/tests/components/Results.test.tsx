import { render, screen } from '@testing-library/react';
import Results from '../../components/Results';
beforeAll(() => {
  global.URL.createObjectURL = jest.fn();
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});
test('results text renders and accepts value', () => {
  const resultsText = 'text-results-text';
  render(<Results results={resultsText} />);
  const resultsTextField: HTMLElement = screen.getByTestId('results-text');
  expect(resultsTextField).toBeInTheDocument();
  expect(resultsTextField.textContent).toEqual(resultsText);
}); 
