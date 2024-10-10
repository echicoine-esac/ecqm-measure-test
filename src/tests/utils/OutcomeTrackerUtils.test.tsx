import { OutcomeTrackerUtils } from '../../utils/OutcomeTrackerUtils';
import jsonTestCollectDataData from '../resources/fetchmock-data-repo.json';
import jsonTestOperationOutcomeFatal from '../resources/fetchmock-operation-outcome-fatal.json';
import jsonTestOperationOutcomeWarn from '../resources/fetchmock-operation-outcome-warn.json';
import jsonTestOperationOutcomeInfo from '../resources/fetchmock-operation-outcome-info.json';
import jsonTestOperationOutcomeError from '../resources/fetchmock-operation-outcome-error.json';
import { Constants } from '../../constants/Constants';

const url = Constants.serverTestData[0].baseUrl;

test('OutcomeTracker builds correctly with jsonData', () => {
    const testOutcomeTracker = OutcomeTrackerUtils.buildOutcomeTracker(
        jsonTestCollectDataData,
        'OutcomeTracker Test with JsonData',
        Constants.serverTestData[0]);

    expect(testOutcomeTracker.jsonFormattedString).toEqual(JSON.stringify(jsonTestCollectDataData, undefined, 2))
    expect(testOutcomeTracker.outcomeMessage).toEqual('OutcomeTracker Test with JsonData with ' + url + ' completed successfully:');
})

test('OutcomeTracker builds correctly with jsonString', () => {
    const jsonString = JSON.stringify(jsonTestCollectDataData, undefined, 2);

    const testOutcomeTracker = OutcomeTrackerUtils.buildOutcomeTracker(
        jsonString,
        'OutcomeTracker Test with JsonString',
        Constants.serverTestData[0]);

    expect(testOutcomeTracker.jsonRawData).toEqual(JSON.parse(jsonString))
    expect(testOutcomeTracker.outcomeMessage).toEqual('OutcomeTracker Test with JsonString with ' + url + ' completed successfully:');
})

test('OutcomeTracker fatal message', () => {
    runOutcomeTrackerTest(
        jsonTestOperationOutcomeFatal,
        'OutcomeTracker Test Fatal',
        'OutcomeTracker Test Fatal with ' + url + ' returned with error(s):'
    );
});

test('OutcomeTracker warn message', () => {
    runOutcomeTrackerTest(
        jsonTestOperationOutcomeWarn,
        'OutcomeTracker Test Warn',
        'OutcomeTracker Test Warn with ' + url + ' had warning(s):'
    );
});

test('OutcomeTracker info message', () => {
    runOutcomeTrackerTest(
        jsonTestOperationOutcomeInfo,
        'OutcomeTracker Test Info',
        'OutcomeTracker Test Info with ' + url + ':'
    );
});

test('OutcomeTracker error message', () => {
    runOutcomeTrackerTest(
        jsonTestOperationOutcomeError,
        'OutcomeTracker Test Error',
        'OutcomeTracker Test Error with ' + url + ' returned with error(s):'
    );
});

const runOutcomeTrackerTest = (
    jsonOutcome: any,
    operationName: string,
    expectedOutcomeMessage: string) => {

    const testOutcomeTracker = OutcomeTrackerUtils.buildOutcomeTracker(
        jsonOutcome,
        operationName,
        Constants.serverTestData[0]
    );

    expect(testOutcomeTracker.jsonFormattedString).toEqual(JSON.stringify(jsonOutcome, undefined, 2));
    expect(testOutcomeTracker.outcomeMessage).toEqual(expectedOutcomeMessage);
};