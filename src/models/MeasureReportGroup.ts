import {CodeableConcept} from './CodeableConcept';

export type MeasureReportGroup = {
  code: CodeableConcept;
  population: [{
    code: CodeableConcept;
    count: string;
  }];
};