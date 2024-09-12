import { CodeableConcept } from "./CodeableConcept";
import { PopulationElement } from "./Scoring";

export type PopulationScoring = {
    initialPopulation: string;
    denominator: string;
    denominatorExclusion: string;
    denominatorException: string;
    numerator: string;
    numeratorExclusion: string;
    groupID: string;
    groupScoring?: CodeableConcept;
    measureName: string;
    groupPopulations?: PopulationElement[];
}