import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { Constants } from '../constants/Constants';
import { Section } from '../enum/Section.enum';
import { Patient } from '../models/Patient';
import { Member, PatientGroup } from '../models/PatientGroup';
import { Server } from '../models/Server';
import { PatientGroupUtils } from '../utils/PatientGroupUtils';
import SectionalTitleBar from './SectionalTitleBar';
import ServerDropdown from './ServerDropdown';

interface Props {
  showDataRepo: boolean;
  setShowDataRepo: React.Dispatch<React.SetStateAction<boolean>>;
  servers: Array<Server | undefined>;
  selectedDataRepo: Server | undefined;
  patients: Array<Patient | undefined>;
  fetchPatients: (dataRepo: Server) => void;
  setSelectedPatient: React.Dispatch<React.SetStateAction<Patient | undefined>>;
  selectedPatient: Patient | undefined;
  collectData: (b: boolean) => void;
  loading: boolean;
  setModalShow: React.Dispatch<React.SetStateAction<boolean>>;
  selectedMeasure?: string;
  groups?: Map<string, PatientGroup>
  setSelectedPatientGroup: React.Dispatch<React.SetStateAction<PatientGroup | undefined>>;

}

const DataRepository: React.FC<Props> = ({
  showDataRepo, setShowDataRepo, servers, selectedDataRepo, patients,
  fetchPatients, setSelectedPatient, selectedPatient, collectData, loading,
  setModalShow, selectedMeasure, groups, setSelectedPatientGroup }) => {

  const [patientFilter, setPatientFilter] = useState<string>('');
  const [useGroupAsSubject, setUseGroupAsSubject] = useState<boolean>(true);
  const [filteredPatients, setFilteredPatients] = useState<Array<Patient | undefined>>([]);
  const [patientGroup, setPatientGroup] = useState<PatientGroup | undefined>();

  const useGroupAsSubjectHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUseGroupAsSubject(event.target.checked);
  };

  const buildSubjectText = (): string => {
    if (selectedPatient?.id) {
      return 'Patient/' + selectedPatient.id;
    } else if (patientGroup?.id) {
      return 'Group/' + patientGroup.id;
    } else {
      return '';
    }
  };

  const buildSelectedSubjectText = (): string => {
    if (selectedPatient?.id) {
      return selectedPatient.display;
    } else if (patientGroup?.id) {
      return 'Group/' + patientGroup.id;
    } else {
      return '';
    }
  };

  const allPatientsSubject = selectedDataRepo?.baseUrl && patients && patients.length > 0 ? 'ALL Patients on ' + selectedDataRepo?.baseUrl : '';

  const selectedSubject: string = useGroupAsSubject &&
    buildSelectedSubjectText().length > 0 ? buildSelectedSubjectText() : allPatientsSubject;

  useEffect(() => {
    // Update filtered patients and patient group based on selectedMeasure
    const updatedPatientGroup = selectedMeasure ? groups?.get(selectedMeasure) : undefined;
    setPatientGroup(updatedPatientGroup);

    const filteredPatients = patients.filter((patient) => {
      const patDisplay = PatientGroupUtils.buildUniquePatientIdentifier(patient);
      let groupingCondition: boolean = true;

      if (updatedPatientGroup) {
        let members: Member[] = updatedPatientGroup.member;
        let patFound: boolean = false;
        for (let member of members) {
          if (member.entity.reference.split('Patient/')[1] === patient?.id) {
            patFound = true;
            break;
          }
        }
        groupingCondition = patFound;
      }

      return groupingCondition && patDisplay?.toLowerCase().includes(patientFilter.toLowerCase());
    });

    setFilteredPatients(filteredPatients);

    // Update the selected patient group outside the rendering phase
    setSelectedPatientGroup(updatedPatientGroup);
  },
    //dependency array (when useEffect will trigger:)
    [patients, selectedMeasure, patientFilter, groups, setSelectedPatientGroup]);


  return (
    <div className='card'>
      <div className='card-header'>

        <SectionalTitleBar 
          section={Section.DATA_REPO}
          setShowSection={setShowDataRepo}
          showSection={showDataRepo}
          selectedSubjectTitling='Subject'
          selectedSubject={selectedSubject} />

      </div>
      {showDataRepo ? (
        <div className='card-body'>
          <div className='row'>
              
              <ServerDropdown
                section={Section.DATA_REPO}
                loading={loading}
                servers={servers}
                callFunction={fetchPatients}
                baseUrlValue={selectedDataRepo?.baseUrl}
                setModalShow={setModalShow}
              />

            <div className='col-md-6 order-md-2'>
            <label>Patient (optional)</label>
              <select disabled={loading} data-testid='data-repo-patient-dropdown' className='custom-select d-block w-100' id='patient' value={selectedPatient?.id || ''}
                onChange={(e) => {
                  const selectedPatientId = e.target.value;
                  const selectedPatientObject = patients.find(
                    (patient) => patient?.id === selectedPatientId
                  );

                  setSelectedPatient(selectedPatientObject || undefined);
                }}>
                <option value=''>Select a Patient...</option>
                {filteredPatients.map((patient, index) => (
                  <option key={index} value={patient?.id || ''}>
                    {PatientGroupUtils.buildUniquePatientIdentifier(patient)}
                  </option>
                ))}
              </select>
              <input disabled={loading} type='text' className='form-control' placeholder='Filter patients...' value={patientFilter}
                onChange={(e) => setPatientFilter(e.target.value)} />
            </div>
            <div className='col-md-5 order-md-2'>
              <br />
              {loading ? (
                <Button data-testid='data-repo-collect-data-button-spinner' className='w-100 btn btn-primary btn-lg' id='evaluate' disabled={loading}>
                  <Spinner
                    as='span'
                    variant='light'
                    size='sm'
                    role='status'
                    aria-hidden='true'
                    animation='border' />
                  Loading...
                </Button>
              ) : (
                <Button
                  data-testid='data-repo-collect-data-button'
                  className='w-100 btn btn-primary btn-lg'
                  id='evaluate'
                  disabled={loading}
                  onClick={(e) => collectData(useGroupAsSubject && buildSubjectText().length > 0)}>
                  Collect Data</Button>
              )}
            </div>
          </div>
          <div className='row-md-1 ml-auto'>
            {buildSubjectText().length > 0 &&
              <label>
                <input
                  type="checkbox"
                  checked={useGroupAsSubject}
                  onChange={useGroupAsSubjectHandler}
                  disabled={loading}>
                </input>
                {' subject='}<a href={selectedDataRepo?.baseUrl + buildSubjectText()} target='_blank' rel='noreferrer'>{buildSubjectText()}↗</a>
              </label>
            }
            {((!useGroupAsSubject || buildSubjectText().length === 0) && selectedDataRepo?.baseUrl) && (
              <div>
                {Constants.label_largeDataNOTE}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div />
      )}
    </div>
  );
};

export default DataRepository;
