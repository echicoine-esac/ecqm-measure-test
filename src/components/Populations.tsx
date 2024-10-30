import React from 'react';
import { PopulationScoring } from '../models/PopulationScoring';

// Props for Populations
interface Props {
  showPopulations: boolean | undefined;
  populationScoring: PopulationScoring[] | undefined;
  measureScoringType: string | undefined;
}

// Populations component displays the population cards
const Populations: React.FC<Props> = ({ showPopulations, populationScoring, measureScoringType }) => {

  const convertToID = (str: any | undefined): string => {
    let strIn: string = '' + str;
    return (strIn.replaceAll(' ', ''));
  }
  const tableCount = populationScoring ? populationScoring.length : 0;
  const widthPercentage = tableCount >= 3 ? '32.96%' : tableCount === 2 ? '49.72%' : '100%'; // Adjust based on count

  return (
    <div style={{
      position: 'relative',
      top: '-24px',
    }}>
      {showPopulations ? (
        <div style={{ textAlign: 'start', marginTop: '0px' }}>
          <div
            style={{ display: 'flex', flexWrap: 'wrap', margin: '0px', gap: '5px' }}>
            {populationScoring && Array.from(populationScoring)
              .map((scoring, index) => (
                <div key={index + scoring.groupID} style={{
                  flexBasis: widthPercentage,
                }}>
                  <table
                    tabIndex={0}
                    aria-label={'Populations scoring results for group ' + scoring.groupID + '. '}
                    className="table mt-4"
                    style={{ margin: '0px', width: '100%', border: '2px solid lightgrey', background: 'white' }}>
                    <thead style={{ background: '#F7F7F7' }}>
                      <tr>
                        <th>
                          <h6
                            data-testid={'pops-group-id-' + convertToID(scoring.groupID)}>
                            {'Group ID: ' + scoring.groupID}
                          </h6>
                        </th>
                        <th>
                          <h5 tabIndex={0} data-testid={'pops-group-score-type-' + convertToID(scoring?.groupScoring?.coding[0].code)}>
                            {scoring.groupScoring &&
                              'Scoring Type: ' + scoring?.groupScoring?.coding[0].code}
                          </h5>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {scoring.groupPopulations?.map((pop, idx) => (
                        <tr tabIndex={0}
                          aria-label={pop.code.coding[0].code + ' is equal to ' + pop.count + '. '}
                          key={idx}
                          className={`${pop.discrepancy ? 'fw-bold text-danger' : ''}`}
                        >
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
          <h6 
          aria-label={measureScoringType && measureScoringType.length > 0 ? 'Measure scoring type is ' + measureScoringType : 'Measure scoring type not available.'}
          tabIndex={0} 
          style={{ marginTop: '5px', marginBottom: '-15px' }} 
          data-testid={'pops-measure-score-type'}>
            {'Measure Scoring Type: '}
            {measureScoringType && measureScoringType.length > 0 ? measureScoringType : 'N/A'}
          </h6>
        </div>
      ) : (
        <div />
      )}
    </div>
  );



};

export default Populations;