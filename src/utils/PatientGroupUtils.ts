import { PatientGroup } from "../models/PatientGroup";
import { Patient } from "../models/Patient";

export class PatientGroupUtils {
    public static patientExistsInGroup(patientEntry: Patient, selectedMeasureGroup: PatientGroup): boolean {
        if (!patientEntry?.id || !selectedMeasureGroup?.member) {
            return false;
        }

        return selectedMeasureGroup.member.some(
            member => member.entity.reference?.split('Patient/')[1] === patientEntry.id
        );
    }
}