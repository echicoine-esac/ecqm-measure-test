import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import App from '../../App';
import { Constants } from '../../constants/Constants';
import { CollectDataFetch } from '../../data/CollectDataFetch';
import { EvaluateMeasureFetch } from '../../data/EvaluateMeasureFetch';
import { GroupFetch } from '../../data/GroupFetch';
import { MeasureFetch } from '../../data/MeasureFetch';
import { PatientFetch } from '../../data/PatientFetch';
import { SubmitDataFetch } from '../../data/SubmitDataFetch';
import { Measure } from '../../models/Measure';
import { Patient } from '../../models/Patient';
import { Server } from '../../models/Server';
import jsonTestMeasureEvaluationData from '../../tests/resources/fetchmock-measure-evaluation.json';

import { PatientGroupUtils } from '../../utils/PatientGroupUtils';
import { ServerUtils } from '../../utils/ServerUtils';
import jsonTestCollectDataData from '../resources/fetchmock-data-repo.json';
import jsonTestGroupData from '../resources/fetchmock-group.json';
import jsonTestMeasureData from '../resources/fetchmock-measure.json';
import jsonTestPatientsData from '../resources/fetchmock-patients.json';

const thisTestFile = "Measure Evaluation";

const useSubject = true;

const mockPatientTotalCountJSON = `{
  "resourceType": "Bundle",
  "id": "604e7395-8850-4a15-a2f2-67a1d334b2d0",
  "meta": {
    "lastUpdated": "2024-01-12T16:42:57.392+00:00",
    "tag": [ {
      "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationValue",
      "code": "SUBSETTED",
      "display": "Resource encoded in summary mode"
    } ]
  },
  "type": "searchset",
  "total": 1921
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



  //reset the selected knowledge repo stored in sessionStorage
  sessionStorage.setItem('selectedKnowledgeRepo', JSON.stringify(''));

  //override any calls directly to 127.0.0.1:8080, simply return result.ok set to true;
  fetchMock.mock('begin:http://127.0.0.1:8080', true);

});

beforeAll(() => {
  global.URL.createObjectURL = jest.fn();
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

//RENDERING: 
test(thisTestFile + 'renders properly', async () => {
  await act(async () => {
    render(<App />);
  });

  expect(screen.getByTestId('mea-eva-show-section-button')).toBeInTheDocument();
  const showButton: HTMLButtonElement = screen.getByTestId('mea-eva-show-section-button');
  fireEvent.click(showButton);

  //'Selected Measure'
  expect(screen.getByTestId('mea-eva-server-dropdown')).toBeInTheDocument();
  expect(screen.getByTestId('mea-eva-evaluate-button')).toBeInTheDocument();

  const hideButton: HTMLButtonElement = screen.getByTestId('mea-eva-hide-section-button');
  fireEvent.click(hideButton);
});


test(thisTestFile + ' success scenario: evaluate data', async () => {
  const dataServers: Server[] = Constants.serverTestData;
  const mockMeasureList: Measure[] = await buildMeasureData(dataServers[0].baseUrl);
  const mockPatientList: Patient[] = await buildPatientData(dataServers[0].baseUrl);

  await act(async () => {
    render(<App />);
  });

  const startDateControl: HTMLInputElement = screen.getByTestId('start-date-control');
  const startDate = startDateControl.value;

  const endDateControl: HTMLInputElement = screen.getByTestId('end-date-control');
  const endDate = endDateControl.value;


  //Select a measure via knowledge repository:
  {
    const serverDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-server-dropdown');
    const measureDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-measure-dropdown');

    //mock measure list server selection will return 
    await act(async () => {
      const measureFetch = new MeasureFetch(dataServers[0]);
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

    fetchMock.mock(dataServers[0].baseUrl + 'Patient?_summary=count', mockPatientTotalCountJSON);

    //select server, mock list should return:
    await act(async () => {
      const patientFetch = await PatientFetch.createInstance(dataServers[0]);
      const mockJsonPatientData = jsonTestPatientsData;
      fetchMock.once(patientFetch.getUrl(),
        JSON.stringify(mockJsonPatientData)
        , { method: 'GET' });

      const groupFetch = new GroupFetch(dataServers[0]);

      const mockJsonGroupData = jsonTestGroupData;
      fetchMock.once(groupFetch.getUrl(),
        JSON.stringify(mockJsonGroupData)
        , { method: 'GET' });

      userEvent.selectOptions(serverDropdown, dataServers[0].baseUrl);
    });
    fetchMock.restore();

    //mock measure list server selection will return 
    const measureFetch = new MeasureFetch(dataServers[0]);
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

    //mock returned measure evaluation data
    const evaluateDataFetch = new EvaluateMeasureFetch(dataServers[0],
      mockMeasureList[0].name,
      startDate,
      endDate,
      useSubject,
      mockPatientList[0]);
    const mockJsonResultsData = jsonTestMeasureEvaluationData;
    fetchMock.once(evaluateDataFetch.getUrl(),
      JSON.stringify(mockJsonResultsData)
      , { method: 'GET' });

    await act(async () => {
      const evaluateButton: HTMLButtonElement = screen.getByTestId('mea-eva-evaluate-button');
      await fireEvent.click(evaluateButton);
    });
    fetchMock.restore();
    const resultsTextField: HTMLElement = screen.getByTestId('results-text');
    expect(resultsTextField.textContent).toEqual(JSON.stringify(mockJsonResultsData, undefined, 2));

  }
});

test(thisTestFile + ' success scenario: submit data', async () => {
  const dataServers: Server[] = Constants.serverTestData;
  const mockMeasureList: Measure[] = await buildMeasureData(dataServers[0].baseUrl);
  const mockPatientList: Patient[] = await buildPatientData(dataServers[0].baseUrl);

  await act(async () => {
    render(<App />);
  });

  const startDateControl: HTMLInputElement = screen.getByTestId('start-date-control');
  const startDate = startDateControl.value;

  const endDateControl: HTMLInputElement = screen.getByTestId('end-date-control');
  const endDate = endDateControl.value;


  //Select a measure via knowledge repository:
  {
    const serverDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-server-dropdown');
    const measureDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-measure-dropdown');

    //mock measure list server selection will return 
    await act(async () => {
      const measureFetch = new MeasureFetch(dataServers[0]);
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

    fetchMock.mock(dataServers[0].baseUrl + 'Patient?_summary=count', mockPatientTotalCountJSON);

    //select server, mock list should return:
    await act(async () => {
      const patientFetch = await PatientFetch.createInstance(dataServers[0]);
      const mockJsonPatientData = jsonTestPatientsData;
      fetchMock.once(patientFetch.getUrl(),
        JSON.stringify(mockJsonPatientData)
        , { method: 'GET' });

      const groupFetch = new GroupFetch(dataServers[0]);

      const mockJsonGroupData = jsonTestGroupData;
      fetchMock.once(groupFetch.getUrl(),
        JSON.stringify(mockJsonGroupData)
        , { method: 'GET' });

      userEvent.selectOptions(serverDropdown, dataServers[0].baseUrl);
    });
    fetchMock.restore();

    //mock measure list server selection will return 
    const measureFetch = new MeasureFetch(dataServers[0]);
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

    //mock returned data repo data
    const collectDataFetch = new CollectDataFetch(dataServers[0],
      mockMeasureList[0].name,
      startDate,
      endDate,
      useSubject,
      mockPatientList[0]);
    const mockJsonCollectDataData = jsonTestCollectDataData;
    fetchMock.once(collectDataFetch.getUrl(),
      JSON.stringify(mockJsonCollectDataData)
      , { method: 'GET' });

    await act(async () => {
      //select server, mock list should return:
      const collectDataButton: HTMLButtonElement = screen.getByTestId('data-repo-collect-data-button');
      fireEvent.click(collectDataButton);
    });
    fetchMock.restore();
  }


  //Evaluate Measure via Measure Evaluation section:
  {
    expect(screen.getByTestId('mea-eva-show-section-button')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('mea-eva-show-section-button'));
    await waitFor(() => expect(screen.getByTestId('mea-eva-submit-button')).toBeInTheDocument());

    const serverDropdown: HTMLSelectElement = screen.getByTestId('mea-eva-server-dropdown');
    userEvent.selectOptions(serverDropdown, dataServers[0].baseUrl);

    //mock submit data fetch
    const submitDataFetch = new SubmitDataFetch(dataServers[0], mockMeasureList[0].name, JSON.stringify(jsonTestCollectDataData));
    fetchMock.once(submitDataFetch.getUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/fhir+json' },
      body: Constants.submitPostTestBody,
    });

    await act(async () => {
      const submitButton: HTMLButtonElement = screen.getByTestId('mea-eva-submit-button');
      await fireEvent.click(submitButton);
    });
    fetchMock.restore();
    const resultsTextField: HTMLElement = screen.getByTestId('results-text');


    expect(resultsTextField?.textContent?.length).toEqual(134);
  }
});

test(thisTestFile + ' fail scenario: submit data', async () => {
  const dataServers: Server[] = Constants.serverTestData;
  const mockMeasureList: Measure[] = await buildMeasureData(dataServers[0].baseUrl);
  const mockPatientList: Patient[] = await buildPatientData(dataServers[0].baseUrl);

  await act(async () => {
    render(<App />);
  });

  //Select a measure via knowledge repository:
  {
    const serverDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-server-dropdown');
    const measureDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-measure-dropdown');

    //mock measure list server selection will return 
    await act(async () => {
      const measureFetch = new MeasureFetch(dataServers[0]);
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

    fetchMock.mock(dataServers[0].baseUrl + 'Patient?_summary=count', mockPatientTotalCountJSON);

    //select server, mock list should return:
    await act(async () => {
      const patientFetch = await PatientFetch.createInstance(dataServers[0]);
      const mockJsonPatientData = jsonTestPatientsData;
      fetchMock.once(patientFetch.getUrl(),
        JSON.stringify(mockJsonPatientData)
        , { method: 'GET' });

      const groupFetch = new GroupFetch(dataServers[0]);

      const mockJsonGroupData = jsonTestGroupData;
      fetchMock.once(groupFetch.getUrl(),
        JSON.stringify(mockJsonGroupData)
        , { method: 'GET' });

      userEvent.selectOptions(serverDropdown, dataServers[0].baseUrl);
    });
    fetchMock.restore();

    //mock measure list server selection will return 
    const measureFetch = new MeasureFetch(dataServers[0]);
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
    await waitFor(() => expect(screen.getByTestId('mea-eva-submit-button')).toBeInTheDocument());

    const serverDropdown: HTMLSelectElement = screen.getByTestId('mea-eva-server-dropdown');
    userEvent.selectOptions(serverDropdown, dataServers[0].baseUrl);

    const submitDataFetch = new SubmitDataFetch(dataServers[0], mockMeasureList[0].name, 'collectedData');
    fetchMock.once(submitDataFetch.getUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/fhir+json' },
      body: Constants.submitPostTestBody,
    });

    await act(async () => {
      const submitButton: HTMLButtonElement = screen.getByTestId('mea-eva-submit-button');
      await fireEvent.click(submitButton);
    });
    fetchMock.restore();
    const resultsTextField: HTMLElement = screen.getByTestId('results-text');

    expect(resultsTextField.textContent).toEqual(Constants.error_submitData_collectData);
  }
});


test(thisTestFile + ' fail scenario: evaluate data without selecting Server', async () => {
  const dataServers: Server[] = Constants.serverTestData;
  const mockMeasureList: Measure[] = await buildMeasureData(dataServers[0].baseUrl);
  const mockPatientList: Patient[] = await buildPatientData(dataServers[0].baseUrl);

  await act(async () => {
    render(<App />);
  });

  const startDateControl: HTMLInputElement = screen.getByTestId('start-date-control');
  const startDate = startDateControl.value;

  const endDateControl: HTMLInputElement = screen.getByTestId('end-date-control');
  const endDate = endDateControl.value;


  //Select a measure via knowledge repository:
  {
    const serverDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-server-dropdown');
    const measureDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-measure-dropdown');

    //mock measure list server selection will return 
    await act(async () => {
      const measureFetch = new MeasureFetch(dataServers[0]);
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

    fetchMock.mock(dataServers[0].baseUrl + 'Patient?_summary=count', mockPatientTotalCountJSON);

    //select server, mock list should return:
    await act(async () => {
      const patientFetch = await PatientFetch.createInstance(dataServers[0]);
      const mockJsonPatientData = jsonTestPatientsData;
      fetchMock.once(patientFetch.getUrl(),
        JSON.stringify(mockJsonPatientData)
        , { method: 'GET' });

      const groupFetch = new GroupFetch(dataServers[0]);

      const mockJsonGroupData = jsonTestGroupData;
      fetchMock.once(groupFetch.getUrl(),
        JSON.stringify(mockJsonGroupData)
        , { method: 'GET' });

      userEvent.selectOptions(serverDropdown, dataServers[0].baseUrl);
    });
    fetchMock.restore();

    //mock measure list server selection will return 
    const measureFetch = new MeasureFetch(dataServers[0]);
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

    //NORMALLY WOULD SELECT SERVER, THIS TIME, DON'T

    //mock returned measure evaluation data
    const evaluateDataFetch = new EvaluateMeasureFetch(dataServers[0],
      mockMeasureList[0].name,
      startDate,
      endDate,
      useSubject,
      mockPatientList[0]);
    const mockJsonResultsData = jsonTestMeasureEvaluationData;
    fetchMock.once(evaluateDataFetch.getUrl(),
      JSON.stringify(mockJsonResultsData)
      , { method: 'GET' });

    await act(async () => {
      const evaluateButton: HTMLButtonElement = screen.getByTestId('mea-eva-evaluate-button');
      await fireEvent.click(evaluateButton);
    });
    fetchMock.restore();
    const resultsTextField: HTMLElement = screen.getByTestId('results-text');

    expect(resultsTextField.textContent).toEqual(Constants.error_measureEvaluationServer);

  }

});


//mock measure and patient data
async function buildMeasureData(url: string): Promise<Measure[]> {
  const measureFetch = new MeasureFetch(Constants.serverTestData[0]);
  const mockJsonMeasureData = jsonTestMeasureData;
  fetchMock.once(measureFetch.getUrl(),
    JSON.stringify(mockJsonMeasureData)
    , { method: 'GET' });
  let measureList: Measure[] = (await measureFetch.fetchData()).operationData;
  fetchMock.restore();
  return measureList;
}

async function buildPatientData(url: string): Promise<Patient[]> {
  fetchMock.mock(url + 'Patient?_summary=count', mockPatientTotalCountJSON);

  const patientFetch = await PatientFetch.createInstance(Constants.serverTestData[0]);
  const mockJsonPatientData = jsonTestPatientsData;
  fetchMock.once(patientFetch.getUrl(),
    JSON.stringify(mockJsonPatientData)
    , { method: 'GET' });
  let patientList: Patient[] = (await patientFetch.fetchData()).operationData;
  fetchMock.restore();
  return patientList;
}