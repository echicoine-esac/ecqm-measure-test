import { PatientGroup } from '../models/PatientGroup';
import { Patient } from '../models/Patient';

export class PatientGroupUtils {
    public static patientExistsInGroup(patientEntry: Patient | undefined, selectedMeasureGroup: PatientGroup | undefined): boolean {
        if (!patientEntry?.id || !selectedMeasureGroup?.member) {
            return false;
        }

        return selectedMeasureGroup.member.some(
            member => member.entity.reference?.split('Patient/')[1] === patientEntry.id
        );
    }

    public static buildUniquePatientIdentifier(patient: Patient | undefined) {
        if (patient) {
            if (patient.id?.length >= 6) {
                return patient.display + ' - ' + patient.id.substring(0, 6) + '...';
            } else {
                return patient.display + ' - ' + patient.id;
            }
        }
    };
}