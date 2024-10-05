import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import App from '../../App';
import { Constants } from '../../constants/Constants';
import { EvaluateMeasureFetch } from '../../data/EvaluateMeasureFetch';
import { GroupFetch } from '../../data/GroupFetch';
import { MeasureFetch } from '../../data/MeasureFetch';
import { MeasureReportFetch } from '../../data/MeasureReportFetch';
import { PatientFetch } from '../../data/PatientFetch';
import { Measure } from '../../models/Measure';
import { Patient } from '../../models/Patient';
import { Server } from '../../models/Server';
import { HashParamUtils } from '../../utils/HashParamUtils';
import { PatientGroupUtils } from '../../utils/PatientGroupUtils';
import { ServerUtils } from '../../utils/ServerUtils';
import jsonTestMeasureData from '../resources/fetchmock-measure.json';
import jsonTestEvalMeasure from '../resources/fetchmock-test-compare-evaluate-measure.json';
import jsonTestGroupData from '../resources/fetchmock-test-compare-group.json';
import jsonTestMeasureReport from '../resources/fetchmock-test-compare-measure-report.json';
import jsonTestPatientsData from '../resources/fetchmock-test-compare-patients.json';

const thisTestFile = "Test Comparator";

const mockPatientTotalCountJSON = `{
  "resourceType": "Bundle",
  "id": "89b1e43b-626b-4fa7-af3f-2b30d5858123",
  "meta": {
    "lastUpdated": "2024-09-16T14:51:41.282+00:00",
    "tag": [ {
      "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationValue",
      "code": "SUBSETTED",
      "display": "Resource encoded in summary mode"
    } ]
  },
  "type": "searchset",
  "total": 2355
}`;

//mock getServerList and createServer entirely. API.graphQL calls are mocked in ServerUtils.test.tsx
beforeEach(() => {
  //clean up any missed mocks
  jest.restoreAllMocks();
  fetchMock.restore();

  //override getServerList to return test data
  jest.spyOn(ServerUtils, 'getServerList').mockImplementation(async () => {
    return Constants.serverTestData;
  });

  //clear out old accessCode, generateStateCode, and stateCode values
  HashParamUtils.clearCachedValues();

  //reset the selected knowledge repo stored in sessionStorage
  sessionStorage.setItem('selectedKnowledgeRepo', JSON.stringify(''));

  //override any calls directly to 127.0.0.1:8080, simply return result.ok set to true;
  fetchMock.mock('begin:http://127.0.0.1:8080', true);

});

//RENDERING: 
test(thisTestFile + 'renders properly', async () => {
  await act(async () => {
    render(<App />);
  });

  expect(screen.getByTestId('test-compare-show-section-button')).toBeInTheDocument();
  const showButton: HTMLButtonElement = screen.getByTestId('test-compare-show-section-button');
  fireEvent.click(showButton);

  expect(screen.getByTestId('test-compare-generate-summary-button')).toBeInTheDocument();

  //verify the checklist:
  expect(screen.getByTestId('test-compare-checklist-measure')).toBeInTheDocument();
  expect(screen.getByTestId('test-compare-checklist-data-repo-server')).toBeInTheDocument();
  expect(screen.getByTestId('test-compare-checklist-patient-group')).toBeInTheDocument();
  expect(screen.getByTestId('test-compare-checklist-measure-eval-server')).toBeInTheDocument();

  const hideButton: HTMLButtonElement = screen.getByTestId('test-compare-hide-section-button');
  fireEvent.click(hideButton);
});


test(thisTestFile + ' success scenario: generate a valid test comparison summary', async () => {
  const INITIAL_POPULATION = 'initial-population';
  const DENOMINATOR = 'denominator';
  const DENOMINATOR_EXCLUSION = 'denominator-exclusion';
  const NUMERATOR = 'numerator';
  const PATIENT_NAME = '11yoDepressionScreening IPFail';
  const PATIENT_ID = '80c4155e-5671-454a-a4ec-5d774fcef8d2';
  const DISCREPANCY = 'Discrepancy';

  const dataServers: Server[] = Constants.serverTestData;
  const mockMeasureList: Measure[] = await buildMeasureData(dataServers[0].baseUrl);
  const mockPatientList: Patient[] = await buildPatientData(dataServers[0].baseUrl);

  await act(async () => {
    render(<App />);
  });


  //Show test Comparator section to track check list:
  expect(screen.getByTestId('test-compare-show-section-button')).toBeInTheDocument();
  fireEvent.click(screen.getByTestId('test-compare-show-section-button'));
  await waitFor(() => expect(screen.getByTestId('test-compare-generate-summary-button')).toBeInTheDocument());

  //verify the checklist:
  expect(screen.getByTestId('test-compare-checklist-measure')).toBeInTheDocument();
  expect(screen.getByTestId('test-compare-checklist-data-repo-server')).toBeInTheDocument();
  expect(screen.getByTestId('test-compare-checklist-patient-group')).toBeInTheDocument();
  expect(screen.getByTestId('test-compare-checklist-measure-eval-server')).toBeInTheDocument();

  expect(screen.getByTestId('test-compare-checklist-measure').innerHTML).toEqual('☐ Measure');
  expect(screen.getByTestId('test-compare-checklist-data-repo-server').innerHTML).toEqual('☐ Data Repository Server');
  expect(screen.getByTestId('test-compare-checklist-patient-group').innerHTML).toEqual('☐ Patient Group');
  expect(screen.getByTestId('test-compare-checklist-measure-eval-server').innerHTML).toEqual('☐ Measure Evaluation Server');


  const startDateControl: HTMLInputElement = screen.getByTestId('start-date-control');
  const periodStart = startDateControl.value;

  const endDateControl: HTMLInputElement = screen.getByTestId('end-date-control');
  const periodEnd = endDateControl.value;


  //Select a measure via knowledge repository:
  {
    const serverDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-server-dropdown');
    const measureDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-measure-dropdown');

    //mock measure list server selection will return 
    await act(async () => {
      const measureFetch = new MeasureFetch(dataServers[0].baseUrl);
      const mockJsonMeasureData = jsonTestMeasureData;
      fetchMock.once(measureFetch.getUrl(), JSON.stringify(mockJsonMeasureData), { method: 'GET' });
      userEvent.selectOptions(serverDropdown, dataServers[0].baseUrl);
    });
    fetchMock.restore();

    //select a Measure
    await act(async () => {
      userEvent.selectOptions(measureDropdown, mockMeasureList[0].name);
    });
  }

  //Select a Patient via Data Repo section:
  {
    expect(screen.getByTestId('data-repo-show-section-button')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('data-repo-show-section-button'));

    await waitFor(() => expect(screen.getByTestId('data-repo-collect-data-button')).toBeInTheDocument());

    const knowledgeRepoServerDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-server-dropdown');
    const serverDropdown: HTMLSelectElement = screen.getByTestId('data-repo-server-dropdown');

    //select server, mock list should return:
    await act(async () => {
      fetchMock.mock(dataServers[0].baseUrl + 'Patient?_summary=count', mockPatientTotalCountJSON);

      const patientFetch = await PatientFetch.createInstance(dataServers[0].baseUrl);
      const mockJsonPatientData = jsonTestPatientsData;
      fetchMock.once(patientFetch.getUrl(),
        JSON.stringify(mockJsonPatientData)
        , { method: 'GET' });

      const groupFetch = new GroupFetch(dataServers[0].baseUrl);
      const mockJsonGroupData = jsonTestGroupData;
      fetchMock.once(groupFetch.getUrl(),
        JSON.stringify(mockJsonGroupData)
        , { method: 'GET' });

      userEvent.selectOptions(serverDropdown, dataServers[0].baseUrl);
    });
    fetchMock.restore();

    //mock measure list server selection will return 
    const measureFetch = new MeasureFetch(dataServers[0].baseUrl);
    const mockJsonMeasureData = jsonTestMeasureData;
    fetchMock.once(measureFetch.getUrl(),
      JSON.stringify(mockJsonMeasureData)
      , { method: 'GET' });
    await act(async () => {
      //select server, mock list should return:
      userEvent.selectOptions(knowledgeRepoServerDropdown, dataServers[0].baseUrl);
    });
    fetchMock.restore();

    const patientDropdown: HTMLSelectElement = screen.getByTestId('data-repo-patient-dropdown');

    const expectedDisplayName: string = PatientGroupUtils.buildUniquePatientIdentifier(mockPatientList[0]) + '';
    userEvent.selectOptions(patientDropdown, expectedDisplayName);
  }


  //Evaluate Measure via Measure Evaluation section:
  {
    expect(screen.getByTestId('mea-eva-show-section-button')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('mea-eva-show-section-button'));
    await waitFor(() => expect(screen.getByTestId('mea-eva-evaluate-button')).toBeInTheDocument());

    const serverDropdown: HTMLSelectElement = screen.getByTestId('mea-eva-server-dropdown');
    userEvent.selectOptions(serverDropdown, dataServers[0].baseUrl);

  }
  //Test Comparator:
  {
    //verify selections on screen completed the checklist:
    expect(screen.getByTestId('test-compare-checklist-measure').innerHTML).toEqual('☑ Measure<span> <a target=\"_blank\" rel=\"noreferrer\" href=\"http://localhost:8080/1/Measure/AlaraCTClinicalFHIR\">(AlaraCTClinicalFHIR)↗</a></span>');
    expect(screen.getByTestId('test-compare-checklist-data-repo-server').innerHTML).toEqual('☑ Data Repository Server<span> <a target=\"_blank\" rel=\"noreferrer\" href=\"http://localhost:8080/1/\">(http://localhost:8080/1/)↗</a></span>');
    expect(screen.getByTestId('test-compare-checklist-patient-group').innerHTML).toEqual('☑ Patient Group<span> <a target=\"_blank\" rel=\"noreferrer\" href=\"http://localhost:8080/1/Group/17595\">(Group/17595)↗</a></span>');
    expect(screen.getByTestId('test-compare-checklist-measure-eval-server').innerHTML).toEqual('☑ Measure Evaluation Server<span> <a target=\"_blank\" rel=\"noreferrer\" href=\"http://localhost:8080/1/\">(http://localhost:8080/1/)↗</a></span>');

    //Evaluate Measure mock
    const evaluateMeasuresFetch = new EvaluateMeasureFetch(dataServers[0],
      mockMeasureList[0].name, periodStart, periodEnd, true, mockPatientList[0]);
    const mockJsonEvaluateMeasureData = jsonTestEvalMeasure;
    fetchMock.once(evaluateMeasuresFetch.getUrl(),
      JSON.stringify(mockJsonEvaluateMeasureData)
      , { method: 'GET' });

    //Mock MeasureReport:
    const mockJsonMeasureReportData = jsonTestMeasureReport;
    const measureReportFetch = new MeasureReportFetch(dataServers[0],
      mockPatientList[0], mockMeasureList[0].name, periodStart, periodEnd);
    fetchMock.once(measureReportFetch.getUrl(),
      JSON.stringify(mockJsonMeasureReportData)
      , { method: 'GET' });

    await act(async () => {
      const generateTestSummaryButton: HTMLButtonElement = screen.getByTestId('test-compare-generate-summary-button');
      await fireEvent.click(generateTestSummaryButton);
    });

    fetchMock.restore();

    expect(screen.getByTestId('test-comp-pat-eval-count')).toBeInTheDocument();
    const testCompPatEvalCountDiv: HTMLDivElement = screen.getByTestId('test-comp-pat-eval-count');
    expect(testCompPatEvalCountDiv.innerHTML).toEqual('1');

    expect(screen.getByTestId('test-comp-disc-found-count')).toBeInTheDocument();
    const testCompDiscFoundCountDiv: HTMLDivElement = screen.getByTestId('test-comp-disc-found-count');
    expect(testCompDiscFoundCountDiv.innerHTML).toEqual('1');

    expect(screen.getByTestId('test-comp-match-count')).toBeInTheDocument();
    const testCompMatchCountDiv: HTMLDivElement = screen.getByTestId('test-comp-match-count');
    expect(testCompMatchCountDiv.innerHTML).toEqual('0');

    expect(screen.getByTestId('test-comp-start-date')).toBeInTheDocument();
    const testCompStartDateDiv: HTMLDivElement = screen.getByTestId('test-comp-start-date');
    expect(testCompStartDateDiv.innerHTML).toEqual(periodStart);

    expect(screen.getByTestId('test-comp-end-date')).toBeInTheDocument();
    const testCompEndDateDiv: HTMLDivElement = screen.getByTestId('test-comp-end-date');
    expect(testCompEndDateDiv.innerHTML).toEqual(periodEnd);

    expect(screen.getByTestId('test-comp-now-date')).toBeInTheDocument();
    const testCompNowDateDiv: HTMLDivElement = screen.getByTestId('test-comp-now-date');
    expect(testCompNowDateDiv.innerHTML).toEqual(getNow());

    expect(screen.getByTestId('test-comp-patient-display' + convertToID(mockPatientList[0]?.id))).toBeInTheDocument();
    const testCompPatientDisplayDiv: HTMLDivElement = screen.getByTestId('test-comp-patient-display' + convertToID(mockPatientList[0]?.id));
    expect(testCompPatientDisplayDiv.innerHTML).toEqual(PATIENT_NAME);

    expect(screen.getByTestId('test-comp-patient-id' + convertToID(mockPatientList[0]?.id))).toBeInTheDocument();
    const testCompPatientIdDiv: HTMLDivElement = screen.getByTestId('test-comp-patient-id' + convertToID(mockPatientList[0]?.id));
    expect(testCompPatientIdDiv.innerHTML).toEqual('ID: ' + PATIENT_ID);

    expect(screen.getByTestId('test-comp-result-' + convertToID(mockPatientList[0]?.id))).toBeInTheDocument();
    const testCompResultDiv: HTMLDivElement = screen.getByTestId('test-comp-result-' + convertToID(mockPatientList[0]?.id));
    expect(testCompResultDiv.innerHTML).toEqual(DISCREPANCY);


    //test id's for the array based on id+index of entry:
    //This Evaluation:
    {
      expect(screen.getByTestId('test-comp-this-eval-group-code-0')).toBeInTheDocument();
      const testCompThisEvalGroupCodeDiv0: HTMLDivElement = screen.getByTestId('test-comp-this-eval-group-code-0');
      expect(testCompThisEvalGroupCodeDiv0.innerHTML).toEqual(INITIAL_POPULATION);

      expect(screen.getByTestId('test-comp-this-eval-group-count-0')).toBeInTheDocument();
      const testCompThisEvalGroupCountDiv0: HTMLDivElement = screen.getByTestId('test-comp-this-eval-group-count-0');
      expect(testCompThisEvalGroupCountDiv0.innerHTML).toEqual('1');


      expect(screen.getByTestId('test-comp-this-eval-group-code-0')).toBeInTheDocument();
      const testCompThisEvalGroupCodeDiv1: HTMLDivElement = screen.getByTestId('test-comp-this-eval-group-code-1');
      expect(testCompThisEvalGroupCodeDiv1.innerHTML).toEqual(DENOMINATOR);

      expect(screen.getByTestId('test-comp-this-eval-group-count-0')).toBeInTheDocument();
      const testCompThisEvalGroupCountDiv1: HTMLDivElement = screen.getByTestId('test-comp-this-eval-group-count-1');
      expect(testCompThisEvalGroupCountDiv1.innerHTML).toEqual('0');


      expect(screen.getByTestId('test-comp-this-eval-group-code-0')).toBeInTheDocument();
      const testCompThisEvalGroupCodeDiv2: HTMLDivElement = screen.getByTestId('test-comp-this-eval-group-code-2');
      expect(testCompThisEvalGroupCodeDiv2.innerHTML).toEqual(DENOMINATOR_EXCLUSION);

      expect(screen.getByTestId('test-comp-this-eval-group-count-0')).toBeInTheDocument();
      const testCompThisEvalGroupCountDiv2: HTMLDivElement = screen.getByTestId('test-comp-this-eval-group-count-2');
      expect(testCompThisEvalGroupCountDiv2.innerHTML).toEqual('1');


      expect(screen.getByTestId('test-comp-this-eval-group-code-0')).toBeInTheDocument();
      const testCompThisEvalGroupCodeDiv3: HTMLDivElement = screen.getByTestId('test-comp-this-eval-group-code-3');
      expect(testCompThisEvalGroupCodeDiv3.innerHTML).toEqual(NUMERATOR);

      expect(screen.getByTestId('test-comp-this-eval-group-count-0')).toBeInTheDocument();
      const testCompThisEvalGroupCountDiv3: HTMLDivElement = screen.getByTestId('test-comp-this-eval-group-count-3');
      expect(testCompThisEvalGroupCountDiv3.innerHTML).toEqual('0');

    }

    // //Previous Measure Report
    {
      expect(screen.getByTestId('test-comp-prev-eval-group-code-0')).toBeInTheDocument();
      const testCompPrevEvalGroupCodeDiv0: HTMLDivElement = screen.getByTestId('test-comp-prev-eval-group-code-0');
      expect(testCompPrevEvalGroupCodeDiv0.innerHTML).toEqual(INITIAL_POPULATION);

      expect(screen.getByTestId('test-comp-prev-eval-group-count-0')).toBeInTheDocument();
      const testCompPrevEvalGroupCountDiv0: HTMLDivElement = screen.getByTestId('test-comp-prev-eval-group-count-0');
      expect(testCompPrevEvalGroupCountDiv0.innerHTML).toEqual('1');


      expect(screen.getByTestId('test-comp-prev-eval-group-code-0')).toBeInTheDocument();
      const testCompPrevEvalGroupCodeDiv1: HTMLDivElement = screen.getByTestId('test-comp-prev-eval-group-code-1');
      expect(testCompPrevEvalGroupCodeDiv1.innerHTML).toEqual(DENOMINATOR);

      expect(screen.getByTestId('test-comp-prev-eval-group-count-0')).toBeInTheDocument();
      const testCompPrevEvalGroupCountDiv1: HTMLDivElement = screen.getByTestId('test-comp-prev-eval-group-count-1');
      expect(testCompPrevEvalGroupCountDiv1.innerHTML).toEqual('1');


      expect(screen.getByTestId('test-comp-prev-eval-group-code-0')).toBeInTheDocument();
      const testCompPrevEvalGroupCodeDiv2: HTMLDivElement = screen.getByTestId('test-comp-prev-eval-group-code-2');
      expect(testCompPrevEvalGroupCodeDiv2.innerHTML).toEqual(DENOMINATOR_EXCLUSION);

      expect(screen.getByTestId('test-comp-prev-eval-group-count-0')).toBeInTheDocument();
      const testCompPrevEvalGroupCountDiv2: HTMLDivElement = screen.getByTestId('test-comp-prev-eval-group-count-2');
      expect(testCompPrevEvalGroupCountDiv2.innerHTML).toEqual('0');


      expect(screen.getByTestId('test-comp-prev-eval-group-code-0')).toBeInTheDocument();
      const testCompPrevEvalGroupCodeDiv3: HTMLDivElement = screen.getByTestId('test-comp-prev-eval-group-code-3');
      expect(testCompPrevEvalGroupCodeDiv3.innerHTML).toEqual(NUMERATOR);

      expect(screen.getByTestId('test-comp-prev-eval-group-count-0')).toBeInTheDocument();
      const testCompPrevEvalGroupCountDiv3: HTMLDivElement = screen.getByTestId('test-comp-prev-eval-group-count-3');
      expect(testCompPrevEvalGroupCountDiv3.innerHTML).toEqual('1');

    }

  }
});

//mock measure and patient data
async function buildMeasureData(url: string): Promise<Measure[]> {
  const measureFetch = new MeasureFetch(url);
  const mockJsonMeasureData = jsonTestMeasureData;
  fetchMock.once(measureFetch.getUrl(),
    JSON.stringify(mockJsonMeasureData)
    , { method: 'GET' });
  let measureList: Measure[] = (await measureFetch.fetchData('')).operationData;
  fetchMock.restore();
  return measureList;
}

async function buildPatientData(url: string): Promise<Patient[]> {
  fetchMock.mock(url + 'Patient?_summary=count', mockPatientTotalCountJSON);

  const patientFetch = await PatientFetch.createInstance(url);
  const mockJsonPatientData = jsonTestPatientsData;
  fetchMock.once(patientFetch.getUrl(),
    JSON.stringify(mockJsonPatientData)
    , { method: 'GET' });
  let patientList: Patient[] = (await patientFetch.fetchData('')).operationData;
  fetchMock.restore();
  return patientList;
}

const convertToID = (str: any | undefined): string => {
  let strIn: string = '' + str;
  return (strIn.replace(' ', ''));
}

const getNow = () => {
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];
  return formattedDate;
}