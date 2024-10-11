import { render, screen } from '@testing-library/react';
import Populations from '../../components/Populations';
import { PopulationScoring } from '../../models/PopulationScoring';
import jsonTestResultsData from '../resources/fetchmock-measure-evaluation-multi-group.json';
import { GroupElement, PopulationElement } from '../../models/Scoring';
import { CodeableConcept } from '../../models/CodeableConcept';

let populationScoringCollection: PopulationScoring[] = [];

const convertToID = (str: any | undefined): string => {
  let strIn: string = '' + str;
  return (strIn.replaceAll(' ', ''));
}

beforeAll(() => {
  const measureGroups: GroupElement[] = jsonTestResultsData.group;
  let populationScoringCollection: PopulationScoring[] = [];

  //used for testing
  const scoringConcept: CodeableConcept = {
    coding: [{
      system: "http://terminology.hl7.org/CodeSystem/measure-scoring",
      code: "proportion",
      display: "Proportion"
    }]
  };

  for (const group of measureGroups) {
    const groupElement: GroupElement = group;
    populationScoringCollection.push({
      groupID: groupElement.id,
      groupScoring: scoringConcept,
      groupPopulations: group.population
    })
  }


  expect(populationScoringCollection.length).toBe(6);
});


test('population renders and accepts values', () => {

  //measure scoring
  const measureScoring = 'measureScoring';
  const measureScoringTitle = 'Measure Scoring Type: ' + measureScoring;
  const popsMeasureScoreTypeDivId = 'pops-measure-score-type';

  const showPopulations = true;

  render(<Populations
    populationScoring={populationScoringCollection}
    showPopulations={showPopulations}
    measureScoringType={measureScoring}
  />);
  
  const popsMeasureScoreTypeDiv: HTMLDivElement = screen.getByTestId(popsMeasureScoreTypeDivId);
  expect(popsMeasureScoreTypeDiv).toBeInTheDocument();
  expect(popsMeasureScoreTypeDiv.innerHTML).toEqual(measureScoringTitle);

  for (const popScoring of populationScoringCollection){
    const popsGroupIdDiv: HTMLDivElement = screen.getByTestId('pops-group-id-' + convertToID(popScoring.groupID));
    const popsGroupScoreTypeDiv: HTMLDivElement = screen.getByTestId('pops-group-score-type-' + convertToID(popScoring?.groupScoring?.coding[0]?.code));
    
    expect(popsGroupIdDiv).toBeInTheDocument();
    expect(popsGroupScoreTypeDiv).toBeInTheDocument();

    expect(popsGroupIdDiv.innerHTML).toEqual(popScoring.groupID);
    expect(popsGroupScoreTypeDiv.innerHTML).toEqual(popScoring?.groupScoring?.coding[0]?.code);

    //group level items
    for (const popElement of popScoring.groupPopulations){
      const popsGroupCodeDiv: HTMLDivElement = screen.getByTestId('pops-group-code-' + convertToID(popElement.code.coding[0].code));
      const popsGroupCountDiv: HTMLDivElement = screen.getByTestId('pops-group-count-' + convertToID(popElement.count));

      expect(popsGroupCodeDiv).toBeInTheDocument();
      expect(popsGroupCountDiv).toBeInTheDocument();
    
      expect(popsGroupCodeDiv.innerHTML).toEqual(popElement.code.coding[0].code);
      expect(popsGroupCountDiv.innerHTML).toEqual(popElement.count);
    }
  }
});

test('showPopulations is false and hides specific divs', () => {

  //measure scoring
  const measureScoring = 'measureScoring';
  const popsMeasureScoreTypeDivId = 'pops-measure-score-type';
  const showPopulations = false;

  render(<Populations
    populationScoring={populationScoringCollection}
    showPopulations={showPopulations}
    measureScoringType={measureScoring}
  />);

  expect(screen.queryByText(popsMeasureScoreTypeDivId)).not.toBeInTheDocument();
});
 