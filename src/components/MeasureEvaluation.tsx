import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from 'react';
import { Button, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap';
import { Constants } from '../constants/Constants';
import { Patient } from '../models/Patient';
import { PatientGroup } from '../models/PatientGroup';
import { Server } from '../models/Server';
import SectionalTitleBar from './SectionalTitleBar';
import ServerDropdown from './ServerDropdown';
import { Section } from '../enum/Section.enum';

// Props for MeasureEvaluation
interface Props {
  showMeasureEvaluation: boolean;
  setShowMeasureEvaluation: React.Dispatch<React.SetStateAction<boolean>>;
  servers: Array<Server | undefined>;
  setSelectedMeasureEvaluation: React.Dispatch<React.SetStateAction<Server>>;
  selectedMeasureEvaluation: Server | undefined;
  submitData: () => void;
  evaluateMeasure: (b: boolean) => void;
  loading: boolean;
  setModalShow: React.Dispatch<React.SetStateAction<boolean>>;
  patientGroup?: PatientGroup;
  selectedPatient?: Patient;
  selectedDataRepo: Server | undefined;
  collectedData?: string | undefined
}

// MeasureEvaluation component displays the fields for selecting and using the measure evaluation system
const MeasureEvaluation: React.FC<Props> = ({ showMeasureEvaluation, setShowMeasureEvaluation, servers, setSelectedMeasureEvaluation,
  selectedMeasureEvaluation, submitData, evaluateMeasure, loading, setModalShow, selectedPatient, patientGroup,
  selectedDataRepo, collectedData }) => {


  const [useGroupAsSubject, setUseGroupAsSubject] = useState<boolean>(true);

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

  const [href, setHref] = useState<string | undefined>(undefined);
  useEffect(() => {
    let objectUrl: string | undefined = undefined;
    if (collectedData) {
      // Create a Blob and generate an object URL
      const blob = new Blob([collectedData], { type: "application/json" });
      objectUrl = URL.createObjectURL(blob);
      setHref(objectUrl);
    }

    // Cleanup: Revoke the previous URL when results change or component unmounts
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        setHref(undefined);
      }
    };
  }, [collectedData]);

  return (
    <div className='card'>
      <div className='card-header'>

        <SectionalTitleBar
          section={Section.MEASURE_EVAL}
          setShowSection={setShowMeasureEvaluation}
          showSection={showMeasureEvaluation} />
          
      </div>
      {showMeasureEvaluation ? (
        <div className='card-body' style={{ transition: 'all .1s' }}>
          <div className='row'>
            <div className='col-md-6 order-md-1'>
              <label>Measure Evaluation Server</label>
            </div>
          </div>
          <div className='row'>

            <ServerDropdown
              dataTestID={Constants.id_measure_evaluation}
              loading={loading}
              servers={servers}
              callFunction={setSelectedMeasureEvaluation}
              baseUrlValue={selectedMeasureEvaluation?.baseUrl}
            />

            <div className='col-md-1 order-md-2'>
              <OverlayTrigger placement={'top'} overlay={
                <Tooltip>Add an Endpoint</Tooltip>
              }>
                <Button disabled={loading} variant='outline-primary' onClick={() => setModalShow(true)}>+</Button>
              </OverlayTrigger>
            </div>
          </div>

          {/* checklist style indicator regardin stored collectedData */}
          <div className='mt-3' style={{ paddingBottom: '0px' }}>
            <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>

              <li data-testid='mea-eva-checklist-measure'>
                {collectedData ? '☑' : '☐'} {href ? <a target='_blank' rel='noreferrer' href={href}>Collected Data for Submission↗</a> : 'Collected Data for Submission'}
              </li>

            </ul>
          </div>

          <div className='row' style={{marginTop: '-25px'}}>
            <div className='col-md-5 order-md-2'>
            <br />
              {loading ? (
                <Button data-testid='mea-eva-submit-button-spinner' className='w-100 btn btn-primary btn-lg' id='getData' disabled={loading}>
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
                <Button data-testid='mea-eva-submit-button' className='w-100 btn btn-primary btn-lg' id='getData' disabled={loading}
                  onClick={(e) => submitData()}>
                  Submit Data
                </Button>
              )}
            </div>
            <div className='col-md-5 order-md-2'>
            <br />
              {loading ? (
                <Button data-testid='mea-eva-evaluate-button-spinner' className='w-100 btn btn-primary btn-lg' id='getData' disabled={loading}>
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
                <Button data-testid='mea-eva-evaluate-button' className='w-100 btn btn-primary btn-lg' id='getData' disabled={loading}
                  onClick={(e) => evaluateMeasure(useGroupAsSubject && buildSubjectText().length > 0)}>
                  Evaluate Measure
                </Button>
              )}
            </div>
          </div>
          <div className='row-md-1 ml-auto'>
            {buildSubjectText().length > 0 && <label>
              <input
                type="checkbox"
                checked={useGroupAsSubject}
                onChange={useGroupAsSubjectHandler}
                disabled={loading}>
              </input>
              {' subject='}<a href={selectedDataRepo?.baseUrl + buildSubjectText()} target='_blank' rel='noreferrer'>{buildSubjectText()}↗</a>
            </label>
            }
            {((!useGroupAsSubject || buildSubjectText().length === 0) && selectedMeasureEvaluation?.baseUrl) && (
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

export default MeasureEvaluation;