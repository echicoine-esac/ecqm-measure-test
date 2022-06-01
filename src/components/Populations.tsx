import React from "react";

// Props for Populations
interface props {
  initialPopulation: string;
  denominator: string;
  denominatorExclusion: string;
  denominatorException: string;
  numerator: string;
  numeratorExclusion: string;
  showPopulations: boolean;
  measureScoring: string;
}

// Populations component displays the population cards
const Populations: React.FC<props> = ({ initialPopulation, denominator, denominatorExclusion, denominatorException,
    numerator, numeratorExclusion, showPopulations, measureScoring}) => {
    return (
      <div>
        <div className="row">
          <div className="col-md-2 order-md-1">
            {showPopulations ? (
              <div className="card">
                <div className="card-header">
                  Scoring Type:
                </div>
                <div className="card-body">
                  {measureScoring}
                </div>
              </div>
            ) : (
              <div/>
            )}
          </div>
        </div>
        <br/>
        <div className="row">
          <div className="col-md-2 order-md-1">
            {showPopulations ? (
              <div className="card">
                <div className="card-header">
                  IPOP
                </div>
                <div className="card-body">
                  {initialPopulation}
                </div>
              </div>
            ) : (
              <div/>
            )}
          </div>
          <div className="col-md-2 order-md-2">
            {showPopulations ? (
              <div className="card">
                <div className="card-header">
                  DENOM
                </div>
                <div className="card-body">
                  {denominator}
                </div>
              </div>
            ) : (
              <div/>
            )}
          </div>
          <div className="col-md-2 order-md-3">
            {showPopulations ? (
              <div className="card">
                <div className="card-header">
                  DENEXCL
                </div>
                <div className="card-body">
                  {denominatorExclusion}
                </div>
              </div>
            ) : (
              <div/>
            )}
          </div>
          <div className="col-md-2 order-md-4">
            {showPopulations ? (
              <div className="card">
                <div className="card-header">
                  DENEXCEP
                </div>
                <div className="card-body">
                  {denominatorException}
                </div>
              </div>
            ) : (
              <div/>
            )}
          </div>
          <div className="col-md-2 order-md-4">
            {showPopulations ? (
              <div className="card">
                <div className="card-header">
                  NUMER
                </div>
                <div className="card-body">
                  {numerator}
                </div>
              </div>
            ) : (
              <div/>
            )}
          </div>
          <div className="col-md-2 order-md-4">
            {showPopulations ? (
              <div className="card">
                <div className="card-header">
                  NUMEXCL
                </div>
                <div className="card-body">
                  {numeratorExclusion}
                </div>
              </div>
            ) : (
              <div/>
            )}
          </div>
        </div>
      </div>
    );
};

export default Populations;