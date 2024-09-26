import React from 'react';
import { PopulationScoring } from '../models/PopulationScoring';

// Props for Populations
interface props {
  showPopulations: boolean | undefined;
  populationScoring: PopulationScoring[] | undefined;
  measureScoringType: string | undefined;
}

// Populations component displays the population cards
const Populations: React.FC<props> = ({ showPopulations, populationScoring, measureScoringType }) => {

  const convertToID = (str: any | undefined): string => {
    let strIn: string = '' + str;
    return (strIn.replace(' ', ''));
  }
  const tableCount = populationScoring ? populationScoring.length : 0;
  const widthPercentage = tableCount >= 3 ? '33%' : tableCount === 2 ? '49%' : '100%'; // Adjust based on count

  return (
    <div>
      {showPopulations ? (
        <div style={{ textAlign: 'start'}}>
          <h5 data-testid={'pops-measure-score-type'}>
            {'Measure Scoring Type: '}
            {measureScoringType && measureScoringType.length > 0 ? measureScoringType : 'N/A'}
          </h5>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px'}}>
            {populationScoring && Array.from(populationScoring)
              .map((scoring, index) => (
                <div key={index + scoring.groupID} style={{ flexBasis: widthPercentage }}>
                  <table className="table mt-4" style={{ width: '100%', border: '2px solid lightgrey', background: 'white'  }}>
                    <thead style={{ background: '#F7F7F7' }}>
                      <tr>
                        <th>
                          <h6 data-testid={'pops-group-id-' + convertToID(scoring.groupID)}>{'Group ID: ' + scoring.groupID}</h6>
                        </th>
                        <th>
                          <h5 data-testid={'pops-group-score-type-' + convertToID(scoring?.groupScoring?.coding[0]?.code)}>
                            {scoring.groupScoring &&
                              'Scoring Type: ' + scoring.groupScoring.coding[0].code}
                          </h5>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {scoring.groupPopulations?.map((pop, idx) => (
                        <tr key={idx} className={`${pop.discrepancy ? 'fw-bold text-danger' : ''}`}>
                          <td style={{ width: '95%', paddingLeft: '10px' }} data-testid={'pops-group-code-' + convertToID(pop.code.coding[0].code)} className="text-start">{pop.code.coding[0].code}:</td>
                          <td style={{ width: '5%' }} data-testid={'pops-group-count-' + convertToID(pop.count)}>{pop.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                </div>
              ))
            }
          </div>
        </div>
      ) : (
        <div />
      )}
    </div>
  );



};

export default Populations;