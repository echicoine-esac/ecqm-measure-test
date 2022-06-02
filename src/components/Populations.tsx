import React from "react";
import {Form} from 'react-bootstrap';

// Props for Populations
interface props {
  initialPopulation: string;
  denominator: string;
  denominatorExclusion: string;
  denominatorException: string;
  numerator: string;
  numeratorExclusion: string;
}

// Populations component displays the population cards
const Populations: React.FC<props> = ({ initialPopulation, denominator, denominatorExclusion, denominatorException,
    numerator, numeratorExclusion}) => {
    return (
      <div className="row">
        <div className="col-md-2 order-md-1">
          <div className="card">
            <div className="card-header">
              IPOP
            </div>
            <div className="card-body" data-testid="initial-population-div">
              {initialPopulation}
            </div>
          </div>
        </div>
        <div className="col-md-2 order-md-2">
          <div className="card">
            <div className="card-header">
              DENOM
            </div>
            <div className="card-body" data-testid="denominator-div">
              {denominator}
            </div>
          </div>
        </div>
        <div className="col-md-2 order-md-3">
          <div className="card">
            <div className="card-header">
              DENEXCL
            </div>
            <div className="card-body" data-testid="denominator-exclusion-div">
              {denominatorExclusion}
            </div>
          </div>
        </div>
        <div className="col-md-2 order-md-4">
          <div className="card">
            <div className="card-header">
              DENEXCEP
            </div>
            <div className="card-body" data-testid="denominator-exception-div">
              {denominatorException}
            </div>
          </div>
        </div>
        <div className="col-md-2 order-md-4">
          <div className="card">
            <div className="card-header">
              NUMER
            </div>
            <div className="card-body" data-testid="numerator-div">
              {numerator}
            </div>
          </div>
        </div>
        <div className="col-md-2 order-md-4">
          <div className="card">
            <div className="card-header">
              NUMEXCL
            </div>
            <div className="card-body" data-testid="numerator-exclusion-div">
              {numeratorExclusion}
            </div>
          </div>
        </div>
      </div>
    );
};

export default Populations;