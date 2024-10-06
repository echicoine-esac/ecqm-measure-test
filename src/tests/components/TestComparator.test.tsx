import { act, render, screen } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import TestingComparator from '../../components/TestingComparator';
import { Constants } from '../../constants/Constants';
import { EvaluateMeasureFetch } from '../../data/EvaluateMeasureFetch';
import { MeasureFetch } from '../../data/MeasureFetch';
import { MeasureReportFetch } from '../../data/MeasureReportFetch';
import { PatientFetch } from '../../data/PatientFetch';
import { Measure } from '../../models/Measure';
import { Patient } from '../../models/Patient';
import { Server } from '../../models/Server';
import { MeasureComparisonManager } from '../../utils/MeasureComparisonManager';
import jsonTestMeasureData from '../resources/fetchmock-measure.json';
import jsonTestEvalMeasure from '../resources/fetchmock-test-compare-evaluate-measure.json';
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

const INITIAL_POPULATION = 'initial-population';
const DENOMINATOR = 'denominator';
const DENOMINATOR_EXCLUSION = 'denominator-exclusion';
const NUMERATOR = 'numerator';
const PATIENT_NAME = 'DENEXPass FullBody';
test(thisTestFile + ': renders properly', async () => {
    const loadingFlag: boolean = false;
    const compareTestResults = jest.fn();
    const setShowTestCompare = jest.fn();
    const periodStart = '2025-01-01';
    const periodEnd = '2025-12-31';
    const testComparatorMap = new Map<Patient, MeasureComparisonManager>();

    const MEASURE_NAME = 'AlaraCTClinicalFHIR';
    const PATIENT_ID = 'e8029124-d760-40eb-b25a-703e447a3e4d';
    const DISCREPANCY = 'Discrepancy';

    let patientIdx: number = 0;

    const baseUrl = 'http://fhir/';

    const dataServer: Server = Constants.serverTestData[0];

    let patientList: Array<Patient | undefined> = [];

    await act(async () => {
        //Patient total count mock (used in url formation for Patient fetch)
        fetchMock.mock(baseUrl + 'Patient?_summary=count', mockPatientTotalCountJSON);
        const patientFetch = await PatientFetch.createInstance(baseUrl);

        //Patient fetch mock
        const mockJsonPatientsData = jsonTestPatientsData;
        fetchMock.once(patientFetch.getUrl(),
            JSON.stringify(mockJsonPatientsData)
            , { method: 'GET' });

        patientList = (await patientFetch.fetchData('')).operationData

        //Measure list mock
        const measureFetch = new MeasureFetch(baseUrl);
        const mockJsonMeasureData = jsonTestMeasureData;
        fetchMock.once(measureFetch.getUrl(),
            JSON.stringify(mockJsonMeasureData)
            , { method: 'GET' });
        let measureList: Measure[] = (await measureFetch.fetchData('')).operationData;

        let measureIdx: number = 0;
        for (const measureEntry of measureList) {
            if (measureEntry.name === MEASURE_NAME) {
                measureIdx = measureList.indexOf(measureEntry);
                break;
            }
        }

        for (const patient of patientList) {
            if (patient?.id === PATIENT_ID) {
                patientIdx = patientList.indexOf(patient);
                break;
            }
        }

        //Evaluate Measure mock
        const evaluateMeasuresFetch = new EvaluateMeasureFetch(dataServer,
            MEASURE_NAME, periodStart, periodEnd, true, patientList[patientIdx]);
        const mockJsonEvaluateMeasureData = jsonTestEvalMeasure;
        fetchMock.once(evaluateMeasuresFetch.getUrl(),
            JSON.stringify(mockJsonEvaluateMeasureData)
            , { method: 'GET' });


        //Mock MeasureReport:
        const mockJsonMeasureReportData = jsonTestMeasureReport;
        const measureReportFetch = new MeasureReportFetch(dataServer,
            patientList[patientIdx], measureList[measureIdx].name, periodStart, periodEnd);
        fetchMock.once(measureReportFetch.getUrl(),
            JSON.stringify(mockJsonMeasureReportData)
            , { method: 'GET' });


        //MeasureComparisonManager instance:
        const mcMan: MeasureComparisonManager = new MeasureComparisonManager(patientList[patientIdx],
            measureList[measureIdx], dataServer, dataServer, periodStart, periodEnd, '');
        await mcMan.fetchGroups();

        if (patientList[patientIdx]) {
            const patient: Patient | undefined = patientList[patientIdx];
            if (patient) {
                testComparatorMap.set(patient, mcMan);
            }
        }
        fetchMock.restore();

    });


    render(<TestingComparator showTestCompare={true} setShowTestCompare={setShowTestCompare}
        items={testComparatorMap} compareTestResults={compareTestResults} loading={loadingFlag}
        startDate={periodStart} endDate={periodEnd}
        selectedDataRepoServer={dataServer} selectedPatientGroup={undefined}
        selectedMeasureEvaluationServer={dataServer} selectedMeasure={MEASURE_NAME}
        selectedKnowledgeRepositoryServer={dataServer} selectedPatient={patientList[patientIdx]} />);

    // const groupID1 = '2D0D08DB-219D-4C41-AB53-DE21F006D602';

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

    expect(screen.getByTestId('test-comp-patient-display' + convertToID(patientList[patientIdx]?.id))).toBeInTheDocument();
    const testCompPatientDisplayDiv: HTMLDivElement = screen.getByTestId('test-comp-patient-display' + convertToID(patientList[patientIdx]?.id));
    expect(testCompPatientDisplayDiv.innerHTML).toEqual(PATIENT_NAME);

    expect(screen.getByTestId('test-comp-patient-id' + convertToID(patientList[patientIdx]?.id))).toBeInTheDocument();
    const testCompPatientIdDiv: HTMLDivElement = screen.getByTestId('test-comp-patient-id' + convertToID(patientList[patientIdx]?.id));
    expect(testCompPatientIdDiv.innerHTML).toEqual('ID: ' + PATIENT_ID);

    expect(screen.getByTestId('test-comp-result-' + convertToID(patientList[patientIdx]?.id))).toBeInTheDocument();
    const testCompResultDiv: HTMLDivElement = screen.getByTestId('test-comp-result-' + convertToID(patientList[patientIdx]?.id));
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

});

const convertToID = (str: any | undefined): string => {
    let strIn: string = '' + str;
    return (strIn.replaceAll(' ', ''));
}

const getNow = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    return formattedDate;
}

//for testing empty measureReport/eval:
//{'test-comp-processing-error' + convertToID(key.display + '-' + key.id)}