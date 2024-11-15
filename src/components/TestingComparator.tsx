import 'bootstrap/dist/css/bootstrap.min.css';
// @ts-ignore
import React, { useEffect, useRef, useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import ReactToPrint from 'react-to-print';
import { Constants } from '../constants/Constants';
import { MeasureComparisonData } from '../data/MeasureComparisonData';
import { Section } from '../enum/Section.enum';
import { Patient } from '../models/Patient';
import { PatientGroup } from '../models/PatientGroup';
import { Server } from '../models/Server';
import { PatientGroupUtils } from '../utils/PatientGroupUtils';
import SectionalTitleBar from './SectionalTitleBar';
import TestingComparatorContent from './TestingComparatorContent';


interface Props {
  showTestCompare: boolean;
  setShowTestCompare: React.Dispatch<React.SetStateAction<boolean>>;
  items: Map<Patient, MeasureComparisonData>;
  compareTestResults: () => void;
  loading: boolean;
  startDate: string;
  endDate: string;
  selectedPatientGroup: PatientGroup | undefined;
  selectedDataRepoServer: Server | undefined;
  selectedMeasureEvaluationServer: Server | undefined;
  selectedMeasure: string | undefined;
  selectedKnowledgeRepositoryServer: Server | undefined;
  selectedPatient: Patient | undefined;
}

/**
 * User must select:
 * - Knowledge Repo server and Measure
 * - Data Repo server and Patient
 * - Measure Evaluation server
 * 
 * Test Comparator will:
 * - query MeasureReport based on selected Patient:
 *   https://fhir.ecqm.icfcloud.com/fhir/MeasureReport?evaluated-resource=Patient/07663bba-9abe-46e2-b2e6-bcfc26e57a45
 * - For each MeasureReport returned, verify property "measure":
 *   "measure": "https://madie.cms.gov/Measure/HIVRetentionFHIR",
 * - Store test results locally
 * - Call Evaluate Measure against measure, patient
 * - Compare test against results
 * 
 * If no measure is selected
 * @param param0 
 * @returns 
 */
const TestingComparator: React.FC<Props> = ({ showTestCompare, setShowTestCompare, items,
  compareTestResults, loading, startDate, endDate, selectedPatientGroup, selectedDataRepoServer,
  selectedMeasureEvaluationServer, selectedMeasure, selectedKnowledgeRepositoryServer, selectedPatient }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 725);

  //Used in monitoring screen orientation and window width on mobile devices
  const getOrientation = () => window.screen.orientation.type || 'landscape-primary';
  const useScreenOrientation = () => {
    const [orientation, setOrientation] = useState(getOrientation());
    const updateOrientation = () => {
      if (setShowTestCompare) setShowTestCompare(false);
      setOrientation(getOrientation());
    };
    useEffect(() => {
      window.addEventListener('orientationchange', updateOrientation);
      return () => {
        window.removeEventListener('orientationchange', updateOrientation);
      };
    }, []);
    return orientation;
  };
  const orientation = useScreenOrientation();
  useEffect(() => {

    const handleResize = () => {
      setIsMobile(window.innerWidth < 725);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  useEffect(() => {
    setIsMobile(window.innerWidth < 725);
  }, [orientation]);

  const requiredDataPresent = selectedPatientGroup
    && selectedDataRepoServer?.baseUrl
    && selectedMeasureEvaluationServer?.baseUrl
    && selectedMeasure && selectedMeasure.length > 0
    && selectedKnowledgeRepositoryServer?.baseUrl;

  const componentRef = useRef<HTMLDivElement | null>(null);

  const title = 'Test Comparison Summary for ' + items?.get(Array.from(items.keys())[0])?.selectedMeasure.name;


  return (
    setShowTestCompare ?
      <div className='card'>

        <div className='card-header'>
          <SectionalTitleBar
            section={Section.TEST_COMPARE}
            setShowSection={setShowTestCompare}
            showSection={(showTestCompare ?? false)}
          />
        </div>

        {showTestCompare ? (
          <div>
            {isMobile ? (
              <div className='card-body'>
                <span>
                  {Constants.renderWidthInfo}
                  <br></br>
                  <br></br>
                  Current screen width: {window.innerWidth}px
                </span>
              </div>
            )

              :

              !items || items?.size === 0 ? (
                <div className='card-body'>

                  {/* 508 trick to add extra info to the panel description for screen readers only: */}
                  <label tabIndex={0}>
                    <span aria-hidden="true">{Constants.testComparisonInstruction}</span>
                    <span className='screen-reader-only'>{Constants.testComparisonInstruction + ' a measure, a data repository server, an established patient group for the measure, and a measure evaluation server.'}</span>
                  </label>

                  <hr />

                  <ul tabIndex={0}
                    aria-label='Checklist of required items. '
                    style={{ listStyleType: 'none', paddingLeft: 0 }}>

                    {/* Measure */}
                    <li
                      tabIndex={0}

                      aria-label={selectedKnowledgeRepositoryServer?.baseUrl && selectedMeasure && selectedMeasure.length > 0 ? 'Measure: ' + selectedMeasure + '. ' : 'Measure: None selected. '}

                      data-testid='test-compare-checklist-measure'>
                      {selectedKnowledgeRepositoryServer?.baseUrl && selectedMeasure && selectedMeasure.length > 0 ? '☑' : '☐'} Measure
                      {selectedMeasure && selectedMeasure.length > 0 && (
                        <span> <a target='_blank' rel='noreferrer' href={selectedKnowledgeRepositoryServer?.baseUrl + 'Measure/' + selectedMeasure}>({selectedMeasure})↗</a></span>
                      )}
                    </li>

                    {/* Data Repository Server */}
                    <li
                      tabIndex={0}

                      aria-label={selectedDataRepoServer?.baseUrl ? 'Data Repository Server: ' + selectedDataRepoServer?.baseUrl + '. ' : 'Data Repository Server: None selected. '}

                      data-testid='test-compare-checklist-data-repo-server'>
                      {selectedDataRepoServer?.baseUrl ? '☑' : '☐'} Data Repository Server
                      {selectedDataRepoServer?.baseUrl && (
                        <span> <a target='_blank' rel='noreferrer' href={selectedDataRepoServer?.baseUrl}>({selectedDataRepoServer.baseUrl})↗</a></span>
                      )}
                    </li>

                    {/* Patient Group */}
                    <li
                      tabIndex={0}

                      aria-label={selectedPatientGroup?.id ? 'Patient Group: ' + selectedPatientGroup?.id + '. ' : 'Patient Group: None selected. '}

                      data-testid='test-compare-checklist-patient-group'>
                      {selectedPatientGroup?.id ? '☑' : '☐'} Patient Group
                      {selectedPatientGroup?.id && selectedDataRepoServer?.baseUrl && (
                        <span> <a target='_blank' rel='noreferrer' href={selectedDataRepoServer?.baseUrl + 'Group/' + selectedPatientGroup?.id}>(Group/{selectedPatientGroup?.id})↗</a></span>
                      )}
                    </li>

                    {PatientGroupUtils.patientExistsInGroup(selectedPatient, selectedPatientGroup) &&
                      <ul style={{ listStyleType: 'none', paddingLeft: '20px' }}>
                        <li
                          tabIndex={0}
                          aria-label={selectedPatient?.id ? 'Patient: ' + selectedPatient?.display + '. ' : 'Patient: None selected. '}
                        >
                          {selectedPatient?.id ? '☑' : '☐'} {'Patient (exists in Group)'}
                          {selectedPatient?.id && selectedDataRepoServer?.baseUrl && (
                            <span> <a target='_blank' rel='noreferrer' href={selectedDataRepoServer?.baseUrl + 'Patient/' + selectedPatient?.id}>(Patient/{selectedPatient?.id})↗</a></span>
                          )}
                        </li>
                      </ul>
                    }

                    {/* Measure Evaluation Server */}
                    <li
                      tabIndex={0}

                      aria-label={selectedMeasureEvaluationServer?.baseUrl ? 'Measure Evaluation Server: ' + selectedMeasureEvaluationServer?.baseUrl + '. ' : 'Measure Evaluation Server: None selected. '}

                      data-testid='test-compare-checklist-measure-eval-server'>
                      {selectedMeasureEvaluationServer?.baseUrl ? '☑' : '☐'} Measure Evaluation Server
                      {selectedMeasureEvaluationServer?.baseUrl && (
                        <span> <a target='_blank' rel='noreferrer' href={selectedMeasureEvaluationServer?.baseUrl}>({selectedMeasureEvaluationServer.baseUrl})↗</a></span>
                      )}
                    </li>
                  </ul>
                </div>
              ) : (
                <div className='card-body'>
                  <div ref={componentRef} className='printable-content'>
                    <TestingComparatorContent
                      items={items}
                      startDate={startDate} endDate={endDate} selectedDataRepoServer={selectedDataRepoServer}
                      selectedMeasureEvaluationServer={selectedMeasureEvaluationServer}
                      selectedKnowledgeRepositoryServer={selectedKnowledgeRepositoryServer}
                    />
                  </div>
                </div>
              )}


            <div className='card-body row' style={{ borderTop: '0px' }}>
              <div className='col-md-6 order-md-1'>
                <br />
                {loading ? (
                  <Button data-testid='test-compare-generate-summary-button-spinner'
                    className='w-100 btn btn-primary btn-lg' id='evaluate' disabled={loading}>
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
                    data-testid='test-compare-generate-summary-button'
                    className='w-100 btn btn-primary btn-lg'
                    id='evaluate'
                    disabled={loading || !requiredDataPresent}
                    onClick={(e) => compareTestResults && compareTestResults()}
                  >
                    Generate Test Comparison</Button>
                )}
              </div>
              <div className='col-md-6 order-md-2'>
                <br />
                {loading ? (
                  <Button
                    data-testid='test-compare-evaluate-button-spinner'
                    className='w-100 btn btn-primary btn-lg'
                    id='getData'
                    disabled={loading}
                  >
                    <Spinner
                      as='span'
                      variant='light'
                      size='sm'
                      role='status'
                      aria-hidden='true'
                      animation='border'
                    />
                    Loading...
                  </Button>
                ) : items && items.size > 0 ? (
                  <ReactToPrint
                    trigger={() => (
                      <Button
                        data-testid='test-compare-evaluate-button'
                        className='w-100 btn btn-primary btn-lg'
                        id='getData'
                        disabled={loading}
                      >
                        Save to PDF
                      </Button>
                    )}
                    content={() => componentRef.current}
                    documentTitle={title}
                  />
                ) : null}

              </div>
            </div>
          </div>
        ) : (

          <div />
        )}
      </div>

      :

      <div />
  );
};

export default TestingComparator;