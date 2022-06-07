import {CodeableConcept} from './CodeableConcept';

export type MeasureReport = {
  type: string;
  group: [{
    code: CodeableConcept;
    population: [{
      code: CodeableConcept;
      count: string;
    }];
    measureScore: {
      value: string;
    };
    stratifier: [{
      code: [CodeableConcept];
      stratum: [{
        value: CodeableConcept;
        component: [{
          code: CodeableConcept;
          value: CodeableConcept;
        }];
        population: [{
          code: CodeableConcept;
          count: string;
        }];
      }]
    }];
  }];
};