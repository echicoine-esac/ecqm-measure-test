export type CodeableConcept = {
  coding: [{
    system: string;
    code: string;
    display?: string;
  }]
};