import { Constants, FetchType } from '../constants/Constants';
import { AppData } from '../data/AppData';
import fetchMock from 'fetch-mock';
import jsonTestMeasureData from './fetchmock-measure.json';
import jsonTestPatientsData from './fetchmock-patients.json';
import jsonTestReturnData from './fetchmock-results.json';
import { MeasureData } from '../models/MeasureData';

const url = 'https://cloud.alphora.com/sandbox/r4/cqm/fhir/';

test('get measures mock', async () => {
    const mockJsonMeasureData = jsonTestMeasureData;
    fetchMock.once(url + Constants.measureUrlEnding,
        JSON.stringify(mockJsonMeasureData)
        , { method: 'GET' });
    let measureList: string[] = await AppData.fetchItems(url, FetchType.MEASURE)
    expect(measureList.length == 1).toBeTruthy();
    fetchMock.restore();

});

test('get patients mock', async () => {
    const mockJsonPatientsData = jsonTestPatientsData;
    fetchMock.once(url + Constants.patientUrlEnding,
        JSON.stringify(mockJsonPatientsData)
        , { method: 'GET' });
    let patientList: string[] = await AppData.fetchItems(url, FetchType.PATIENT)
    expect(patientList.length == 1).toBeTruthy();
    fetchMock.restore();

});

test('get measure data mock', async () => {
    const mockJsonReturnData = jsonTestReturnData;
    let appData = new AppData('server', 'patient', 'measure', 'startDate', 'endDate');
    fetchMock.once(appData.getMeasureUrl(),
        JSON.stringify(mockJsonReturnData)
        , { method: 'GET' });
    let measureData: MeasureData = await appData.buildMeasureData();

    expect(measureData.jsonBody).toEqual(mockJsonReturnData);
    fetchMock.restore();

});

test('test urlformat', async () => {
    let appData = new AppData('server', 'patient', 'measure', 'startDate', 'endDate');
    expect(appData.getMeasureUrl()).toEqual('serverMeasure/measure/$evaluate-measure?subject=patient&periodStart=startDate&periodEnd=endDate');

    appData = new AppData('server', '', 'measure', 'startDate', 'endDate');
    expect(appData.getMeasureUrl()).toEqual('measureMeasure/measure/$evaluate-measure?periodStart=startDate&periodEnd=endDate&reportType=subject-list');
});

