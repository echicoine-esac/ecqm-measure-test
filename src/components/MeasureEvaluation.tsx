import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { Constants } from '../constants/Constants';
import { Section } from '../enum/Section.enum';
import { Patient } from '../models/Patient';
import { PatientGroup } from '../models/PatientGroup';
import { Server } from '../models/Server';
import SectionalTitleBar from './SectionalTitleBar';
import ServerDropdown from './ServerDropdown';

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
  resetSection?: (s: Section) => void;
}

// MeasureEvaluation component displays the fields for selecting and using the measure evaluation system
const MeasureEvaluation: React.FC<Props> = ({ showMeasureEvaluation, setShowMeasureEvaluation, servers, setSelectedMeasureEvaluation,
  selectedMeasureEvaluation, submitData, evaluateMeasure, loading, setModalShow, selectedPatient, patientGroup,
  selectedDataRepo, collectedData,
  resetSection }) => {


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

    if (collectedData && collectedData.trim() !== '') {
      // Create a Blob and generate an object URL if there's valid content
      const blob = new Blob([collectedData], { type: 'application/json' });
      objectUrl = URL.createObjectURL(blob);
      setHref(objectUrl);
    } else {
      // Reset href if the string is empty
      setHref(undefined);
    }

    // Cleanup: Revoke the previous URL when results change or component unmounts
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      setHref(undefined);
    };
  }, [collectedData]);

  const handleDownload = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    window.open(href ?? '', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className='card'>
      <div className='card-header'>

        <SectionalTitleBar
          section={Section.MEASURE_EVAL}
          setShowSection={setShowMeasureEvaluation}
          showSection={showMeasureEvaluation} />

      </div>
      {showMeasureEvaluation ? (
        <div className='card-body'>

          <div className='row'>

            <ServerDropdown
              section={Section.MEASURE_EVAL}
              loading={loading}
              servers={servers}
              callFunction={setSelectedMeasureEvaluation}
              baseUrlValue={selectedMeasureEvaluation?.baseUrl}
              setModalShow={setModalShow}
              resetSection={resetSection}
            />

          </div>

          {/* checklist style indicator regardin stored collectedData */}
          <div 
          
          tabIndex={0}
          aria-label={href ? 'Collected data for submission. This link will open a snapshot of the stored collected data used for submission.' :
            'Collected data for submission. When populated, this link will open a snapshot of the stored collected data used for submission. You can Collect Data for the selected Measure using the Data Extraction Service slash Data Repository panel. '}

          className='mt-3' style={{ paddingBottom: '0px' }}>

            <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>

              <li data-testid='mea-eva-checklist-measure'>
                {collectedData ? '☑' : '☐'} {href ?
                  <a href={href ?? '#'}
                    onClick={handleDownload}
                  >
                    Collected Data for Submission↗
                  </a>
                  :
                  'Collected Data for Submission'}
              </li>

            </ul>
          </div>

          <div className='row' style={{ marginTop: '-25px' }}>
            <div className='col-md-6 order-md-2'>
              <br />
              {loading ? (
                <Button
                  data-testid='mea-eva-submit-button-spinner'
                  className='w-100 btn btn-primary btn-lg'
                  disabled={loading}>
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
                  aria-label='Submit data button. Submit the collected data to the selected server.'
                  data-testid='mea-eva-submit-button'
                  className='w-100 btn btn-primary btn-lg'
                  disabled={loading}
                  onClick={(e) => submitData()}>
                  Submit Data
                </Button>
              )}
            </div>
            <div className='col-md-6 order-md-3'>
              <br />
              {loading ? (
                <Button
                  aria-label='Evaluate measure button. Run measure evaluation against selection.'
                  data-testid='mea-eva-evaluate-button-spinner'
                  className='w-100 btn btn-primary btn-lg'
                  disabled={loading}>
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
                  data-testid='mea-eva-evaluate-button'
                  className='w-100 btn btn-primary btn-lg'
                  disabled={loading}
                  onClick={(e) => evaluateMeasure(useGroupAsSubject && buildSubjectText().length > 0)}>
                  Evaluate Measure
                </Button>
              )}
            </div>
          </div>
          <div className='row-md-1 ml-auto'>
            {buildSubjectText().length > 0 && <label>
              <input
                aria-label='Subject selection. Toggle subject identifier for queries pertaining to the Measure Evaluation panel.'
                type='checkbox'
                checked={useGroupAsSubject}
                onChange={useGroupAsSubjectHandler}
                disabled={loading}>
              </input>
              {' subject='}<a href={selectedDataRepo?.baseUrl + buildSubjectText()} target='_blank' rel='noreferrer'>{buildSubjectText()}↗</a>
            </label>
            }
            {((!useGroupAsSubject || buildSubjectText().length === 0) && selectedMeasureEvaluation?.baseUrl) && (
              <div tabIndex={0}>
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