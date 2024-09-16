import { CodeableConcept } from "./CodeableConcept";
import { PopulationElement } from "./Scoring";

export type PopulationScoring = {
    groupID: string;
    groupScoring?: CodeableConcept;
    groupPopulations: PopulationElement[];
}