import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { Table } from 'react-bootstrap';
import { MeasureComparisonData } from '../data/MeasureComparisonData';
import { Patient } from '../models/Patient';
import { Server } from '../models/Server';


export interface TestingComparatorContentProps {
  items: Map<Patient, MeasureComparisonData>;
  startDate: string;
  endDate: string;
  selectedDataRepoServer: Server | undefined;
  selectedMeasureEvaluationServer: Server | undefined;
  selectedKnowledgeRepositoryServer: Server | undefined;
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
const TestingComparatorContent: React.FC<TestingComparatorContentProps> = ({ items, startDate, endDate, selectedDataRepoServer,
  selectedMeasureEvaluationServer, selectedKnowledgeRepositoryServer }) => {

  const convertToID = (str: any | undefined): string => {
    let strIn: string = '' + str;
    return (strIn.replaceAll(' ', ''));
  }

  const title = 'Test Comparison Summary for ' + items?.get(Array.from(items.keys())[0])?.selectedMeasure.name;
  let trueCount = 0;
  let falseCount = 0;

  items && items.forEach(item => {
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
    <>
      <Table size="sm" style={{ marginBottom: '0px' }}>
        <thead className="text-center">
          <tr>
            <th colSpan={3} style={{ width: '100%', border: 'none', padding: '0px' }}>
              <h5 tabIndex={0} data-testid={'test-comp-title'}>{title}</h5>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ fontSize: '10pt' }}>
            <td style={{ borderRight: '1px solid lightgrey', borderBottom: 'none' }}>
              <Table size="sm" borderless>
                <tbody>
                  <tr tabIndex={0} >
                    <td className="text-start">
                      Patients Evaluated:
                    </td>
                    <td data-testid={'test-comp-pat-eval-count'} >{items?.size}</td>
                  </tr>
                  <tr tabIndex={0} >
                    <td className="text-start">
                      Discrepancies Found:
                    </td>
                    <td data-testid={'test-comp-disc-found-count'} >{trueCount}</td>
                  </tr>
                  <tr tabIndex={0}>
                    <td className="text-start">
                      Matching Data Found:
                    </td>
                    <td data-testid={'test-comp-match-count'} >{falseCount}</td>
                  </tr>
                </tbody>
              </Table>
            </td>
            <td style={{ borderRight: '1px solid lightgrey', borderBottom: 'none' }}>
              <Table size="sm" borderless>
                <tbody>
                  <tr tabIndex={0}>
                    <td className="text-start">
                      Period Start Date:
                    </td>
                    <td data-testid={'test-comp-start-date'} >{startDate}</td>
                  </tr>
                  <tr tabIndex={0}>
                    <td className="text-start">
                      Period End Date:
                    </td>
                    <td data-testid={'test-comp-end-date'} >{endDate}</td>
                  </tr>
                  <tr tabIndex={0}>
                    <td className="text-start">
                      Comparison Date:
                    </td>
                    <td data-testid={'test-comp-now-date'} >{getNow()}</td>
                  </tr>
                </tbody>
              </Table>
            </td>
            <td style={{ borderBottom: 'none' }}>
              <Table size="sm" borderless>
                <tbody>
                  <tr tabIndex={0}>
                    <td className="text-start">
                      Knowledge Repository:
                    </td>
                    <td data-testid={'test-comp-knowledge-repo-server'} >
                      <a target='_blank' rel='noreferrer' href={selectedKnowledgeRepositoryServer?.baseUrl}>
                        {selectedKnowledgeRepositoryServer?.baseUrl}
                      </a>
                    </td>
                  </tr>
                  <tr tabIndex={0}>
                    <td className="text-start">
                      Data Repository:
                    </td>
                    <td data-testid={'test-comp-data-repo-server'} >
                      <a target='_blank' rel='noreferrer' href={selectedDataRepoServer?.baseUrl}>
                        {selectedDataRepoServer?.baseUrl}
                      </a>
                    </td>
                  </tr>
                  <tr tabIndex={0}>
                    <td className="text-start">
                      Measure Evaluation:
                    </td>
                    <td data-testid={'test-comp-measure-eval-server'} >
                      <a target='_blank' rel='noreferrer' href={selectedMeasureEvaluationServer?.baseUrl}>
                        {selectedMeasureEvaluationServer?.baseUrl}
                      </a>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </td>
          </tr>
        </tbody>
      </Table>

      {/* Sort array by discrepancy so matches are bottom of list. Convert boolean to 1/0, compare by basic int: */}
      {/* key is Patient, value is MeasureComparisonManager*/}
      {items && Array.from(items.entries())
        .sort(([keyA, valueA], [keyB, valueB]) =>
          (valueB.discrepancyExists ? 1 : 0)
          -
          (valueA.discrepancyExists ? 1 : 0))
        .map(([key, value]) => (
          value.fetchedMeasureReportGroups.length > 0 && value.fetchedEvaluatedMeasureGroups.length > 0 ? (

            <Table
              size="sm"
              className="table"
              key={key.display + key.id}
              style={{
                width: '100%',
                border: '1px solid lightgrey',
                marginBottom: '0px',
                maxWidth: '100%', // Ensure it can stretch but not beyond its container
                minWidth: '300px', // Minimum width to maintain readability
              }}
            >
              <thead style={{ background: '#F7F7F7', border: '1px solid lightgrey' }}>
                <tr>
                  <th tabIndex={0}
                    aria-label={'Comparison for patient: ' + key.display + ' with ID: ' + key.id + '. '}
                    style={{
                      width: '50%',
                      textAlign: 'left',
                      padding: '8px', // Reduced padding for smaller screens
                    }}
                  >
                    <h5
                      data-testid={'test-comp-patient-display' + convertToID(key.id)}
                      style={{ fontSize: '1.1em' }} // Slightly smaller font size
                    >
                      {key.display}
                    </h5>
                    <h6
                      data-testid={'test-comp-patient-id' + convertToID(key.id)}
                      style={{ fontSize: '0.9em' }} // Smaller font size
                    >
                      ID: {key.id}
                    </h6>
                  </th>
                  <th tabIndex={0}
                    aria-label={'Comparison result: ' + (value.discrepancyExists ? 'Discrepancy. ' : 'Match. ')}
                    style={{
                      width: '50%',
                      textAlign: 'left',
                      padding: '8px', // Reduced padding
                    }}
                  >
                    <h6 >Comparison Result:</h6>
                    <h5
                      data-testid={'test-comp-result-' + convertToID(key.id)}
                      style={{ fontSize: '1.1em',
                        color: value.discrepancyExists ? 'var(--discrepancy)' : 'var(--match)'
                       }} // Slightly smaller font size
                    >
                      {value.discrepancyExists ? 'Discrepancy' : 'Match'}
                    </h5>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td tabIndex={0}
                    aria-label='This evaluation result. '
                    style={{ padding: '4px', paddingBottom: '-10px' }}> {/* Reduced padding for inner tables */}
                    <Table size="sm" borderless>
                      <thead>
                        <tr>
                          <th>
                            <a tabIndex={-1}
                              target="_blank" rel="noreferrer" href={value.evaluatedMeasureURL}>
                              <h6 style={{ fontSize: '0.9em' }}>This Evaluation:</h6>
                            </a>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {value.fetchedEvaluatedMeasureGroups.map((group, index) => (
                          <tr tabIndex={0}
                            aria-label={group.code.coding[0].code + ': ' + group.count + '... '}
                            style={{ border: '1px solid lightgrey' }}
                            key={index}
                            className={group.discrepancy ? 'fw-bold' : ''}
                          >
                            <td style={{ paddingLeft: '8px', fontSize: '0.9em' }} data-testid={'test-comp-this-eval-group-code-' + index}>
                              {group.code.coding[0].code}
                            </td>
                            <td style={{ paddingRight: '8px', fontSize: '0.9em' }} data-testid={'test-comp-this-eval-group-count-' + index}>
                              {group.count}
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td>
                            {/* 508 trick to add extra info to the panel description for screen readers only: */}
                            <div tabIndex={0} style={{ fontSize: '10px', wordBreak: 'break-word', marginBottom: '0px' }}>
                              <span aria-hidden="true">{value.evaluatedMeasureURL}</span>
                              <span className='screen-reader-only'>{'... To run this measure evaluation, visit ' + value.evaluatedMeasureURL + '... '}</span>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </td>
                  <td tabIndex={0}
                    aria-label='Previous measure report data. '
                    style={{ padding: '4px', paddingBottom: '-10px' }}>
                    <Table size="sm" borderless>
                      <thead>
                        <tr>
                          <th>
                            <a tabIndex={-1}
                              target="_blank" rel="noreferrer" href={value.measureReportURL}>
                              <h6 style={{ fontSize: '0.9em' }}>Previous Measure Report:</h6>
                            </a>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {value.fetchedMeasureReportGroups.map((group, index) => (
                          <tr tabIndex={0}
                            aria-label={group.code.coding[0].code + ': ' + group.count + '... '}
                            style={{ border: '1px solid lightgrey' }}
                            key={index}
                            className={group.discrepancy ? 'fw-bold' : ''}
                          >
                            <td style={{ paddingLeft: '8px', fontSize: '0.9em' }} data-testid={'test-comp-prev-eval-group-code-' + index}>
                              {group.code.coding[0].code}
                            </td>
                            <td style={{ paddingRight: '8px', fontSize: '0.9em' }} data-testid={'test-comp-prev-eval-group-count-' + index}>
                              {group.count}
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td>

                            {/* 508 trick to add extra info to the panel description for screen readers only: */}
                            <div tabIndex={0} style={{ fontSize: '10px', wordBreak: 'break-word', marginBottom: '0px' }}>
                              <span aria-hidden="true">{value.measureReportURL}</span>
                              <span className='screen-reader-only'>{'... To retrieve a copy of the report, visit ' + value.measureReportURL + '... '}</span>
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
              style={{ border: '1px solid lightgrey', borderRadius: '4px', padding: '8px', marginBottom: '10px' }}>
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
    </>
  );
};

export default TestingComparatorContent;
