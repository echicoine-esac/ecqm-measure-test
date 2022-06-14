import fetchMock from 'fetch-mock';
import { Constants } from '../../constants/Constants';
import { PatientFetch } from '../../data/PatientFetch';
import { StringUtils } from '../../utils/StringUtils';
import jsonTestPatientsData from '../resources/fetchmock-patients.json';

const url = 'foo/';

test('required properties check', () => {
    try {
        new PatientFetch('')
    } catch (error: any) {
        expect(error.message).toEqual(StringUtils.format(Constants.missingProperty, 'url'))
    }

});

test('get patients mock', async () => {
    const patientFetch = new PatientFetch(url);
    const mockJsonPatientsData = jsonTestPatientsData;
    fetchMock.once(patientFetch.getUrl(),
        JSON.stringify(mockJsonPatientsData)
        , { method: 'GET' });
    let patientList: string[] = await patientFetch.fetchData()
    expect(patientList.length).toEqual(18);
    fetchMock.restore();

});

test('get patients mock function error', async () => {
    const errorMsg = 'this is a test'
    let errorCatch = '';
    const patientFetch = new PatientFetch(url);

    fetchMock.once(patientFetch.getUrl(), {
        throws: new Error(errorMsg)
    });

    try {
        let patientList: string[] = await patientFetch.fetchData()
    } catch (error: any) {
        errorCatch = error.message;
    }

    expect(errorCatch).toEqual('Using foo/Patient?_count=200 to retrieve Patients caused: Error: this is a test');

    fetchMock.restore();

});

test('get patients mock return error', async () => {
    let errorCatch = '';
    const patientFetch = new PatientFetch(url);

    fetchMock.once(patientFetch.getUrl(), 400);

    try {
        await patientFetch.fetchData()
    } catch (error: any) {
        errorCatch = error.message;
    }

    expect(errorCatch).toEqual('Using foo/Patient?_count=200 to retrieve Patients caused: Error: Bad Request');

    fetchMock.restore();

});

test('test urlformat', async () => {
    let patientFetch = await new PatientFetch(url);
    expect(patientFetch.getUrl())
        .toEqual('foo/Patient?_count=200');
});

