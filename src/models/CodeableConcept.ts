export type CodeableConcept = {
  coding: Coding[];
  text?: string;
};

export type Coding = {
  system?: string;
  code: string;
  display?: string;
};