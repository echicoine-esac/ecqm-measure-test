import 'bootstrap/dist/css/bootstrap.min.css';
// @ts-ignore
import React, { useRef } from 'react';
import { Button, Spinner, Table } from 'react-bootstrap';
import { Patient } from '../models/Patient';
import { MeasureComparisonManager } from '../utils/MeasureComparisonManager';
import ReactToPrint from 'react-to-print';


interface props {
  showTestCompare: boolean;
  setShowTestCompare: React.Dispatch<React.SetStateAction<boolean>>;
  items: Map<Patient, MeasureComparisonManager>;
  compareTestResults: () => void;
  loading: boolean;

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
const TestingComparator: React.FC<props> = ({ showTestCompare, setShowTestCompare, items, compareTestResults, loading }) => {

  const componentRef = useRef(null);
  const title = 'Test Comparison Summary for' + items.get(Array.from(items.keys())[0])?.selectedMeasure.name;
  let trueCount = 0;
  let falseCount = 0;

  const pageStyle = `@media print {
    @page {
      margin: 20mm;
    }
  }`;

  items.forEach(item => {
    if (item.discrepancyExists) {
      trueCount++;
    } else {
      falseCount++;
    }
  });

  return (
    <div className='card'>
      <div className='card-header'>
        <div className='row'>
          <div className='col-md-3'>Test Comparator</div>
          <div className='col-md-1 ml-auto'>
            {showTestCompare ? (
              <Button
                data-testid='test-compare-hide-section-button'
                className='btn btn-primary btn-lg float-right'
                onClick={() => setShowTestCompare(false)}
              >
                Hide
              </Button>
            ) : (
              <Button
                data-testid='test-compare-show-section-button'
                className='btn btn-primary btn-lg float-right'
                onClick={() => setShowTestCompare(true)}
              >
                Show
              </Button>
            )}
          </div>
        </div>
      </div>

      {showTestCompare ? (
        <div className='card-body'>

          <div ref={componentRef}  >
            {items.size > 0 &&

              <div >
                <Table >
                  <thead>
                    <tr>
                      <th colSpan={2} className="text-center">
                        <h4>Test Comparison Summary for {items.get(Array.from(items.keys())[0])?.selectedMeasure.name}</h4>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="text-start">Patients Evaluated:</td>
                      <td>{items.size}</td>
                    </tr>
                    <tr>
                      <td className="text-start">Discrepancies Found:</td>
                      <td>{trueCount}</td>
                    </tr>
                    <tr>
                      <td className="text-start">Matching Data Found:</td>
                      <td>{falseCount}</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            }
            {/* Sort array by discrepancy so matches are bottom of list. Convert boolean to 1/0, compare by basic int: */}
            {Array.from(items.entries())
              .sort(([keyA, valueA], [keyB, valueB]) =>
                (valueB.discrepancyExists ? 1 : 0)
                -
                (valueA.discrepancyExists ? 1 : 0))
              .map(([key, value]) => (
                value.fetchedMeasureReportGroups.length > 0 && value.fetchedEvaluatedMeasureGroups.length > 0 ? (

                  <table className="table mt-4" key={key.display + key.id} style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th colSpan={2}>

                          <table style={{ width: '100%', background: '#F7F7F7' }}>
                            <tr >
                              <td style={{ width: '50%' }}>
                                <h4>{key.display} </h4>
                                <h6>ID: {key.id}</h6>
                              </td>
                              <td style={{ width: '50%' }}>
                                <h6>Comparison Result:</h6>
                                <h3 className={`${value.discrepancyExists ? 'text-danger' : 'text-success'}`}>
                                  {value.discrepancyExists ? 'Discrepancy' : 'Match'}</h3>
                              </td>
                            </tr>
                          </table>


                        </th>

                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ width: '50%' }}>
                          <a target='_blank' href={value.evaluatedMeasureURL}>
                            <h6>This Evaluation:</h6>
                          </a>
                          <table className="table">
                            <tbody>
                              {value.fetchedEvaluatedMeasureGroups.map((group, index) => (
                                <tr key={index} className={`${group.discrepancy && 'fw-bold'}`}>
                                  <td>{group.code}</td>
                                  <td>{group.count}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>

                        <td style={{ width: '50%' }}>
                          <a target='_blank' href={value.measureReportURL}>
                            <h6>Previous Measure Report:</h6>
                          </a>
                          <table className="table">
                            <tbody>
                              {value.fetchedMeasureReportGroups.map((group, index) => (
                                <tr key={index} className={`${group.discrepancy && 'fw-bold'}`}>
                                  <td>{group.code}</td>
                                  <td>{group.count}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                ) : (
                  <div key={key.display + key.id}>
                    <div className="row mt-4">
                      <h5>{key.display} - {key.id}</h5>
                      <h6 className='text-danger'>
                        Processing Error</h6>
                    </div>
                    <div>
                      {value.fetchedMeasureReportGroups.length === 0 && <h6>MeasureReport not found for: {key.display} - {key.id} using selected Data Repository Server.</h6>}
                      {value.fetchedEvaluatedMeasureGroups.length === 0 && <h6>Measure Evaluation was unsuccesful for: {key.display} - {key.id}.<br></br>Please verify results with Measure Evaluation Service.</h6>}
                    </div>
                  </div>
                )
              ))}
          </div>


          <div className='row'>
            <div className='col-md-5 order-md-2'>
              <br />
              {loading ? (
                <Button data-testid='test-compare-collect-data-button-spinner' className='w-100 btn btn-primary btn-lg' id='evaluate' disabled={loading}>
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
                  data-testid='test-compare-collect-data-button'
                  className='w-100 btn btn-primary btn-lg'
                  id='evaluate'
                  disabled={loading}
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
                  copyStyles={true}
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
