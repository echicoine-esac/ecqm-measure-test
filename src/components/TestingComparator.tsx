import 'bootstrap/dist/css/bootstrap.min.css';
// @ts-ignore
import React, { useRef } from 'react';
import { Button, Spinner, Table } from 'react-bootstrap';
import ReactToPrint from 'react-to-print';
import { Constants } from '../constants/Constants';
import { Patient } from '../models/Patient';
import { MeasureComparisonManager } from '../utils/MeasureComparisonManager';
import { PatientGroup } from '../models/PatientGroup';
import { Server } from '../models/Server';
import { PatientGroupUtils } from '../utils/PatientGroupUtils';
import SectionalTitleBar from './SectionalTitleBar';


interface Props {
  showTestCompare: boolean;
  setShowTestCompare: React.Dispatch<React.SetStateAction<boolean>>;
  items: Map<Patient, MeasureComparisonManager>;
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


  const requiredDataPresent = selectedPatientGroup
    && selectedDataRepoServer?.baseUrl
    && selectedMeasureEvaluationServer?.baseUrl
    && selectedMeasure
    && selectedKnowledgeRepositoryServer?.baseUrl;

  const convertToID = (str: any | undefined): string => {
    let strIn: string = '' + str;
    return (strIn.replace(' ', ''));
  }
  const componentRef = useRef(null);
  const title = 'Test Comparison Summary for ' + items.get(Array.from(items.keys())[0])?.selectedMeasure.name;
  let trueCount = 0;
  let falseCount = 0;

  const pageStyle = `@media print {
                      @page {
                        margin: 20mm;
                      }
                      body {
                        -webkit-print-color-adjust: exact;
                        
                      }
                  }`;

  items.forEach(item => {
    if (item.discrepancyExists) {
      trueCount++;
    } else {
      falseCount++;
    }
  });

  const getNow = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    return formattedDate;
  }


  return (

    <div className='card'>
      <style>{`
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `}</style>
      <div className='card-header'>
        <SectionalTitleBar dataTestID='test-compare-' setshowSection={setShowTestCompare} showSection={showTestCompare} title='Test Comparator' />
      </div>

      {showTestCompare ? (
        <div className='card-body' style={{ transition: 'all .1s' }}>

          <div ref={componentRef}>
            {items.size > 0 ? (

              <div>
                <Table size='sm' style={{ marginBottom: '0px' }}>
                  <thead className="text-center">
                    <tr>
                      <th colSpan={3} style={{ width: '100%', border: 'none', padding: '0px' }}>
                        <h5 data-testid={'test-comp-title'}>{title}</h5>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ borderRight: '1px solid lightgrey', borderBottom: 'none' }}>
                        <Table size='sm' borderless>
                          <tbody>
                            <tr>
                              <td className="text-start" style={{ minWidth: '215px' }}>
                                Patients Evaluated:
                              </td>
                              <td data-testid={'test-comp-pat-eval-count'} style={{ minWidth: '10px', width: '100%' }}>{items.size}</td>
                            </tr>
                            <tr>
                              <td className="text-start" style={{ minWidth: '215px' }}>
                                Discrepancies Found:
                              </td>
                              <td data-testid={'test-comp-disc-found-count'} style={{ minWidth: '10px', width: '100%' }}>{trueCount}</td>
                            </tr>
                            <tr>
                              <td className="text-start" style={{ minWidth: '215px' }}>
                                Matching Data Found:
                              </td>
                              <td data-testid={'test-comp-match-count'} style={{ minWidth: '10px', width: '100%' }}>{falseCount}</td>
                            </tr>
                          </tbody>
                        </Table>
                      </td>
                      <td style={{ borderRight: '1px solid lightgrey', borderBottom: 'none' }}>
                        <Table size='sm' borderless>
                          <tbody>
                            <tr>
                              <td className="text-start" style={{ minWidth: '180px' }}>
                                Period Start Date:
                              </td>
                              <td data-testid={'test-comp-start-date'} style={{ minWidth: '130px', width: '100%' }}>{startDate}</td>
                            </tr>
                            <tr>
                              <td className="text-start" style={{ minWidth: '180px' }}>
                                Period End Date:
                              </td>
                              <td data-testid={'test-comp-end-date'} style={{ minWidth: '130px', width: '100%' }}>{endDate}</td>
                            </tr>
                            <tr>
                              <td className="text-start" style={{ minWidth: '180px' }}>
                                Comparison Date:
                              </td>
                              <td data-testid={'test-comp-now-date'} style={{ minWidth: '130px', width: '100%' }}>{getNow()}</td>
                            </tr>
                          </tbody>
                        </Table>
                      </td>
                      <td style={{ borderBottom: 'none' }}>
                        <Table size='sm' borderless>
                          <tbody>
                            <tr>
                              <td className="text-start" style={{ minWidth: '215px' }}>
                                Knowledge Repository:
                              </td>
                              <td data-testid={'test-comp-knowledge-repo-server'} style={{ width: '100%' }}><a target='_blank' rel='noreferrer' href={selectedKnowledgeRepositoryServer?.baseUrl}>{selectedKnowledgeRepositoryServer?.baseUrl}↗</a></td>
                            </tr>
                            <tr>
                              <td className="text-start" style={{ minWidth: '215px' }}>
                                Data Repository:
                              </td>
                              <td data-testid={'test-comp-data-repo-server'} style={{ width: '100%' }}><a target='_blank' rel='noreferrer' href={selectedDataRepoServer?.baseUrl}>{selectedDataRepoServer?.baseUrl}↗</a></td>
                            </tr>
                            <tr>
                              <td className="text-start" style={{ minWidth: '215px' }}>
                                Measure Evaluation:
                              </td>
                              <td data-testid={'test-comp-measure-eval-server'} style={{ width: '100%' }}><a target='_blank' rel='noreferrer' href={selectedMeasureEvaluationServer?.baseUrl}>{selectedMeasureEvaluationServer?.baseUrl}↗</a></td>
                            </tr>
                          </tbody>
                        </Table>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>

            ) : (

              <div>
                {Constants.testComparisonInstruction}
                <br></br>
                <br></br>
                <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>

                  {/* Measure */}
                  <li data-testid='test-compare-checklist-measure'>
                    {selectedMeasure ? '☑' : '☐'} Measure
                    {selectedKnowledgeRepositoryServer?.baseUrl && selectedMeasure && (
                      <span> <a target='_blank' rel='noreferrer' href={selectedKnowledgeRepositoryServer?.baseUrl + 'Measure/' + selectedMeasure}>({selectedMeasure})↗</a></span>
                    )}
                  </li>

                  {/* Data Repository Server */}
                  <li data-testid='test-compare-checklist-data-repo-server'>
                    {selectedDataRepoServer?.baseUrl ? '☑' : '☐'} Data Repository Server
                    {selectedDataRepoServer?.baseUrl && (
                      <span> <a target='_blank' rel='noreferrer' href={selectedDataRepoServer?.baseUrl}>({selectedDataRepoServer.baseUrl})↗</a></span>
                    )}
                  </li>

                  {/* Patient Group */}
                  <li data-testid='test-compare-checklist-patient-group'>
                    {selectedPatientGroup?.id ? '☑' : '☐'} Patient Group
                    {selectedPatientGroup?.id && selectedDataRepoServer?.baseUrl && (
                      <span> <a target='_blank' rel='noreferrer' href={selectedDataRepoServer?.baseUrl + 'Group/' + selectedPatientGroup?.id}>(Group/{selectedPatientGroup?.id})↗</a></span>
                    )}
                  </li>

                  {PatientGroupUtils.patientExistsInGroup(selectedPatient, selectedPatientGroup) &&
                    <ul style={{ listStyleType: 'none', paddingLeft: '20px' }}>
                      <li>
                        {selectedPatient?.id ? '☑' : '☐'} {'Patient (exists in Group)'}
                        {selectedPatient?.id && selectedDataRepoServer?.baseUrl && (
                          <span> <a target='_blank' rel='noreferrer' href={selectedDataRepoServer?.baseUrl + 'Patient/' + selectedPatient?.id}>(Patient/{selectedPatient?.id})↗</a></span>
                        )}
                      </li>
                    </ul>
                  }

                  {/* Measure Evaluation Server */}
                  <li data-testid='test-compare-checklist-measure-eval-server'>
                    {selectedMeasureEvaluationServer?.baseUrl ? '☑' : '☐'} Measure Evaluation Server
                    {selectedMeasureEvaluationServer?.baseUrl && (
                      <span> <a target='_blank' rel='noreferrer' href={selectedMeasureEvaluationServer?.baseUrl}>({selectedMeasureEvaluationServer.baseUrl})↗</a></span>
                    )}
                  </li>
                </ul>
              </div>
            )}
            {/* Sort array by discrepancy so matches are bottom of list. Convert boolean to 1/0, compare by basic int: */}
            {/* key is Patient, value is MeasureComparisonManager*/}
            {Array.from(items.entries())
              .sort(([keyA, valueA], [keyB, valueB]) =>
                (valueB.discrepancyExists ? 1 : 0)
                -
                (valueA.discrepancyExists ? 1 : 0))
              .map(([key, value]) => (
                value.fetchedMeasureReportGroups.length > 0 && value.fetchedEvaluatedMeasureGroups.length > 0 ? (

                  <Table size='sm' className="table" key={key.display + key.id} style={{ width: '100%', border: '1px solid lightgrey', marginBottom: '0px' }}>
                    <thead style={{ background: '#F7F7F7', border: '1px solid lightgrey' }}>
                      <tr>
                        <th style={{ width: '50%', textAlign: 'left', padding: '10px' }}>
                          <h5 data-testid={'test-comp-patient-display' + convertToID(key.id)}>{key.display}</h5>
                          <h6 data-testid={'test-comp-patient-id' + convertToID(key.id)}>ID: {key.id}</h6>
                        </th>
                        <th style={{ width: '50%', textAlign: 'left', padding: '10px' }}>
                          <h6>Comparison Result:</h6>
                          <h5 data-testid={'test-comp-result-' + convertToID(key.id)} className={`${value.discrepancyExists ? 'text-danger' : 'text-success'}`}>
                            {value.discrepancyExists ? 'Discrepancy' : 'Match'}
                          </h5>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '8px' }}>
                          <Table size='sm' borderless>
                            <thead>
                              <tr>
                                <th>
                                  <a target='_blank' rel='noreferrer' href={value.evaluatedMeasureURL}>
                                    <h6>This Evaluation: </h6>
                                  </a>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {value.fetchedEvaluatedMeasureGroups.map((group, index) => (
                                // mark text in bold if discrepancy exists for this field
                                <tr style={{ border: '1px solid lightgrey' }} key={index} className={group.discrepancy ? 'fw-bold' : ''}>
                                  <td style={{ width: '100%', paddingLeft: '10px' }} data-testid={'test-comp-this-eval-group-code-' + index}>{group.code.coding[0].code}</td>
                                  <td style={{ width: '100%', paddingRight: '15px' }} data-testid={'test-comp-this-eval-group-count-' + index}>{group.count}</td>
                                </tr>
                              ))}
                              <tr>
                                <td style={{ width: '100%' }} >
                                  <div style={{ fontSize: '11px' }}>
                                    {value.evaluatedMeasureURL}
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </Table>
                        </td>
                        <td style={{ padding: '8px' }}>
                          <Table size='sm' borderless>
                            <thead>
                              <tr>
                                <th>
                                  <a target='_blank' rel='noreferrer' href={value.measureReportURL}>
                                    <h6>Previous Measure Report:</h6>
                                  </a>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {value.fetchedMeasureReportGroups.map((group, index) => (
                                <tr style={{ border: '1px solid lightgrey' }} key={index} className={group.discrepancy ? 'fw-bold' : ''}>
                                  <td style={{ width: '100%', paddingLeft: '10px' }} data-testid={'test-comp-prev-eval-group-code-' + index}>{group.code.coding[0].code}</td>
                                  <td style={{ width: '100%', paddingRight: '15px' }} data-testid={'test-comp-prev-eval-group-count-' + index}>{group.count}</td>
                                </tr>
                              ))}
                              <tr>
                                <td style={{ width: '100%' }} >
                                  <div style={{ fontSize: '11px' }}>
                                    {value.measureReportURL}
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </Table>
                        </td>
                      </tr>
                    </tbody>

                  </Table>

                ) : (
                  <div key={key.display + key.id}
                    style={{  border: '1px solid lightgrey', borderRadius: '4px', padding: '8px', marginBottom: '10px' }}>
                    <div className="row">
                      <h5><strong style={{ color: 'red' }}>SKIPPED: </strong>{key.display + ' (' + key.id + ')'}</h5>
                    </div>
                    <div data-testid={'test-comp-processing-error' + convertToID(key.display + '-' + key.id)}>
                      Test comparison could not complete for this Patient due to the following discrepancies: <br />
                      {value.fetchedMeasureReportGroups.length === 0 && (
                        <div style={{ padding: '5px' }}>
                          <strong style={{ marginLeft: '10px' }}> • MeasureReport: </strong> No MeasureReports were retrieved from the selected Data Repository Server.
                        </div>
                      )}
                      {value.fetchedEvaluatedMeasureGroups.length === 0 && (
                        <div style={{ padding: '5px' }}>
                          <strong style={{ marginLeft: '10px' }}> • Measure Evaluation: </strong> Measure Evaluation failed with the selected Measure Evaluation Server.
                        </div>
                      )}
                    </div>
                  </div>
                )
              ))}
          </div>


          <div className='row'>
            <div className='col-md-5 order-md-2'>
              <br />
              {loading ? (
                <Button data-testid='test-compare-generate-summary-button-spinner' className='w-100 btn btn-primary btn-lg' id='evaluate' disabled={loading}>
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
                  onClick={(e) => compareTestResults()}
                >
                  Generate Test Comparison Summary</Button>
              )}
            </div>
            <div className='col-md-5 order-md-2'>
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
              ) : items.size > 0 ? (
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
                  pageStyle={pageStyle}
                />
              ) : null}

            </div>
          </div>
        </div>
      ) : (

        <div />
      )}
    </div>
  );
};

export default TestingComparator;
