import React from 'react';
import { PopulationScoring } from '../models/PopulationScoring';

// Props for Populations
interface props {
  showPopulations: boolean;
  populationScoring: PopulationScoring[] | undefined;
  measureScoringType: string;
}

// Populations component displays the population cards
const Populations: React.FC<props> = ({ showPopulations, populationScoring, measureScoringType }) => {

  let title = '';
  if (populationScoring) {
    if (populationScoring[0]) {
      title = 'Measure Evaluation Scoring Summary for: ' + populationScoring[0].measureName;
    }
  }

  return (
    <div>
      {showPopulations ? (
        <div style={{ textAlign: 'start', marginTop: '20px' }}>
          <h4>{title}</h4>
          <h5>
            {'Measure Scoring Type: '}
            {measureScoringType && measureScoringType.length > 0 ? measureScoringType : 'N/A'}
          </h5>

          {populationScoring && Array.from(populationScoring)
            .map((scoring, index) => (
              <div key={index}>
                <table className="table mt-4" style={{ width: '100%', border: '2px solid lightgrey' }}>
                  <thead style={{ width: '100%', background: '#F7F7F7' }}>
                    <tr>
                      <td  >
                        <h5>
                          {'Group ID: ' + scoring.groupID}
                        </h5>
                      </td>

                      <td>
                        <h5>
                          {scoring.groupScoring &&
                            'Scoring Type: ' + scoring.groupScoring.coding[0].code
                          }
                        </h5>
                      </td>

                    </tr>
                  </thead>
                  <tbody>
                    {scoring.groupPopulations ? (
                      scoring.groupPopulations.map((group, idx) => (
                        <tr key={idx} className={`${group.discrepancy ? 'fw-bold text-danger' : ''}`}>
                          <td className="text-start">{group.code.coding[0].code}:</td>
                          <td>{group.count}</td>
                        </tr>
                      ))
                    ) : (
                      <>
                        <tr>
                          <td className="text-start" style={{ width: '50%' }}>Initial Population:</td>
                          <td>{scoring.initialPopulation}</td>
                        </tr>
                        <tr>
                          <td className="text-start">Denominator:</td>
                          <td>{scoring.denominator}</td>
                        </tr>
                        <tr>
                          <td className="text-start">Denominator Exclusion:</td>
                          <td>{scoring.denominatorExclusion}</td>
                        </tr>
                        <tr>
                          <td className="text-start">Denominator Exception:</td>
                          <td>{scoring.denominatorException}</td>
                        </tr>
                        <tr>
                          <td className="text-start">Numerator:</td>
                          <td>{scoring.numerator}</td>
                        </tr>
                        <tr>
                          <td className="text-start">Numerator Exclusion:</td>
                          <td>{scoring.numeratorExclusion}</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            ))
          }
        </div>
      ) : (
        <div />
      )}
    </div>
  );



};

export default Populations;