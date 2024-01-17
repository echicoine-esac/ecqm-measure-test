import fetchMock from 'fetch-mock';
import { Constants } from '../../constants/Constants';
import { PatientFetch } from '../../data/PatientFetch';
import { StringUtils } from '../../utils/StringUtils';
import jsonTestPatientsData from '../resources/fetchmock-patients.json';
import jsonTestPatientsGroupData from '../resources/fetchmock-patients-group.json';

const url = 'foo/';

beforeEach(() => {
    fetchMock.restore(); // Clear mock routes before each test
    fetchMock.mock('foo/Patient?_summary=count', `{
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
        "total": 200
      }`);
});

 

test('required properties check', async () => {
    try {
        const patientFetch = await PatientFetch.createInstance('');
    } catch (error: any) {
        expect(error.message).toEqual(StringUtils.format(Constants.missingProperty, 'url'))
    }

});

test('get patients mock', async () => {
    const patientFetch = await PatientFetch.createInstance(url);
    const mockJsonPatientsData = jsonTestPatientsData;
    fetchMock.once(patientFetch.getUrl(),
        JSON.stringify(mockJsonPatientsData)
        , { method: 'GET' });

        let patientList: string[] = await patientFetch.fetchData('')

    expect(patientList.length).toEqual(21);
    fetchMock.restore();

});

test('get group patients mock', async () => {
    const patientFetch = await PatientFetch.createInstance(url);
    const mockJsonPatientsData = jsonTestPatientsGroupData;
    fetchMock.once(patientFetch.getUrl(),
        JSON.stringify(mockJsonPatientsData)
        , { method: 'GET' });
    let patientList: string[] = await patientFetch.fetchData('')

    expect(patientList.length).toEqual(59);
    fetchMock.restore();

});

test('get patients mock function error', async () => {
    const errorMsg = 'this is a test'
    let errorCatch = '';
    const patientFetch = await PatientFetch.createInstance(url);

    fetchMock.once(patientFetch.getUrl(), {
        throws: new Error(errorMsg)
    });

    try {
        let patientList: string[] = await patientFetch.fetchData('')
    } catch (error: any) {
        errorCatch = error.message;
    }

    expect(errorCatch).toEqual('Using foo/Patient?_count=200 to retrieve Patients caused: Error: this is a test');

    fetchMock.restore();

});

test('get patients mock return error', async () => {
    let errorCatch = '';
    const patientFetch = await PatientFetch.createInstance(url);

    fetchMock.once(patientFetch.getUrl(), 400);

    try {
        await patientFetch.fetchData('')
    } catch (error: any) {
        errorCatch = error.message;
    }

    expect(errorCatch).toEqual('Using foo/Patient?_count=200 to retrieve Patients caused: Bad Request');

    fetchMock.restore();
});

test('test urlformat', async () => {
    let patientFetch = await PatientFetch.createInstance(url);
    expect(patientFetch.getUrl())
        .toEqual('foo/Patient?_count=200');
});

