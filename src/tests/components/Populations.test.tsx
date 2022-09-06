import { render, screen } from '@testing-library/react';
import Populations from '../../components/Populations';

test('population renders and accepts values', () => {

  const showPopulations = true;
  const measureScoringDivText = 'text-measure-scoring-div';
  const initialPopulationDivText = 'text-initial-population-div';
  const denominatorDivText = 'text-denominator-div';
  const denominatorExclusionDivText = 'text-denominator-exclusion-div';
  const denominatorExceptionDivText = 'text-denominator-exception-div';
  const numeratorDivText = 'text-numerator-div';
  const numeratorExclusionDivText = 'text-numerator-exclusion-div';

  render(<Populations
    measureScoring={measureScoringDivText}
    initialPopulation={initialPopulationDivText}
    denominator={denominatorDivText}
    denominatorExclusion={denominatorExclusionDivText}
    denominatorException={denominatorExceptionDivText}
    numerator={numeratorDivText}
    numeratorExclusion={numeratorExclusionDivText}
    showPopulations={showPopulations}
  />);
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

  expect(measureScoringDiv.innerHTML).toEqual(measureScoringDivText);
  expect(initialPopulationDiv.innerHTML).toEqual(initialPopulationDivText);
  expect(denominatorDiv.innerHTML).toEqual(denominatorDivText);
  expect(denominatorExclusionDiv.innerHTML).toEqual(denominatorExclusionDivText);
  expect(denominatorExceptionDiv.innerHTML).toEqual(denominatorExceptionDivText);
  expect(numeratorDiv.innerHTML).toEqual(numeratorDivText);
  expect(numeratorExclusionDiv.innerHTML).toEqual(numeratorExclusionDivText);

});

test('showPopulations is false and hides specific divs', () => {

  const showPopulations = false;
  const measureScoringDivText = 'text-measure-scoring-div';
  const initialPopulationDivText = 'text-initial-population-div';
  const denominatorDivText = 'text-denominator-div';
  const denominatorExclusionDivText = 'text-denominator-exclusion-div';
  const denominatorExceptionDivText = 'text-denominator-exception-div';
  const numeratorDivText = 'text-numerator-div';
  const numeratorExclusionDivText = 'text-numerator-exclusion-div';

  render(<Populations
    measureScoring={measureScoringDivText}
    initialPopulation={initialPopulationDivText}
    denominator={denominatorDivText}
    denominatorExclusion={denominatorExclusionDivText}
    denominatorException={denominatorExceptionDivText}
    numerator={numeratorDivText}
    numeratorExclusion={numeratorExclusionDivText}
    showPopulations={showPopulations}
  />);

  expect(screen.queryByText('measure-scoring-div')).not.toBeInTheDocument();
  expect(screen.queryByText('initial-population-div')).not.toBeInTheDocument();
  expect(screen.queryByText('denominator-div')).not.toBeInTheDocument();
  expect(screen.queryByText('denominator-exclusion-div')).not.toBeInTheDocument();
  expect(screen.queryByText('denominator-exception-div')).not.toBeInTheDocument();
  expect(screen.queryByText('numerator-div')).not.toBeInTheDocument();
  expect(screen.queryByText('numerator-exclusion-div')).not.toBeInTheDocument();

}); 