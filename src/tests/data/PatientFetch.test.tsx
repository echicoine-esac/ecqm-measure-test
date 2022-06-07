import fetchMock from 'fetch-mock';
import { PatientFetch } from '../../data/PatientFetch';
import jsonTestPatientsData from '../resources/fetchmock-patients.json';

const url = 'foo/';

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
 
test('test urlformat', async () => {
    let patientFetch = await new PatientFetch(url);
    expect(patientFetch.getUrl())
    .toEqual('foo/Patient?_count=200');
});

 

//old app data:

// import { Constants, FetchType } from '../../constants/Constants';
// import { AbstractDataFetch } from '../../data/AbstractDataFetch';
// import fetchMock from 'fetch-mock';
// import jsonTestMeasureData from '../fetchmock-measure.json';
// import jsonTestPatientsData from '../fetchmock-patients.json';
// import jsonTestReturnData from '../fetchmock-results.json';
// import { MeasureData } from '../../models/MeasureData';
// import { Measure } from '../../models/Measure';

// const url = 'https://cloud.alphora.com/sandbox/r4/cqm/fhir/';

// test('get measures mock', async () => {
//     const mockJsonMeasureData = jsonTestMeasureData;
//     fetchMock.once(url + Constants.measureUrlEnding,
//         JSON.stringify(mockJsonMeasureData)
//         , { method: 'GET' });
//     let measureList: Measure[] = await AbstractDataFetch.fetchMeasures(url)
//     expect(measureList.length == 1).toBeTruthy();
//     fetchMock.restore();

// });

// test('get patients mock', async () => {
//     const mockJsonPatientsData = jsonTestPatientsData;
//     fetchMock.once(url + Constants.patientUrlEnding,
//         JSON.stringify(mockJsonPatientsData)
//         , { method: 'GET' });
//     let patientList: string[] = await AbstractDataFetch.fetchPatients(url)
//     expect(patientList.length == 1).toBeTruthy();
//     fetchMock.restore();

// });

// test('get measure data mock', async () => {
//     const mockJsonReturnData = jsonTestReturnData;
//     let appData = new AbstractDataFetch('server', 'patient', 'measure', 'startDate', 'endDate');
//     fetchMock.once(appData.getMeasureUrl(),
//         JSON.stringify(mockJsonReturnData)
//         , { method: 'GET' });
//     let measureData: MeasureData = await appData.buildMeasureData();

//     expect(measureData.jsonBody).toEqual(mockJsonReturnData);
//     fetchMock.restore();

// });

// test('test urlformat', async () => {
//     let appData = new AbstractDataFetch('server', 'patient', 'measure', 'startDate', 'endDate');
//     expect(appData.getMeasureUrl()).toEqual('serverMeasure/measure/$evaluate-measure?subject=patient&periodStart=startDate&periodEnd=endDate');

//     appData = new AbstractDataFetch('server', '', 'measure', 'startDate', 'endDate');
//     expect(appData.getMeasureUrl()).toEqual('measureMeasure/measure/$evaluate-measure?periodStart=startDate&periodEnd=endDate&reportType=subject-list');
// });