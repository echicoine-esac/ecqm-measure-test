import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MeasureEvaluation from '../../components/MeasureEvaluation';
import { ServerUtils } from '../../utils/ServerUtils';
import { Constants } from '../../constants/Constants';
import { PopulationScoring } from '../../models/PopulationScoring';

beforeEach(() => {
    jest.spyOn(ServerUtils, 'getServerList').mockImplementation(async () => {
        return Constants.serverTestData;
    });
});

test('MeasureEvaluation expect functions to be called properly', async () => {
    const servers = await ServerUtils.getServerList();

    const loadingFlag: boolean = false;
    const showMeasureEvaluation: boolean = true;

    const setShowMeasureEvaluation = jest.fn();
    const setSelectedMeasureEvaluation = jest.fn();
    const submitData = jest.fn();
    const evaluateMeasure = jest.fn();

    const showPopulations: boolean = false;
    const populationScoring: PopulationScoring[] = [];
    const measureScoringType: string = '';

    render(<MeasureEvaluation
        showMeasureEvaluation={showMeasureEvaluation}
        setShowMeasureEvaluation={setShowMeasureEvaluation}
        servers={servers}
        setSelectedMeasureEvaluation={setSelectedMeasureEvaluation}
        selectedMeasureEvaluation={servers[0]}
        submitData={submitData}
        evaluateMeasure={evaluateMeasure}
        loading={loadingFlag}
        setModalShow={jest.fn()}
        populationScoring={populationScoring}
        showPopulations={showPopulations}
        measureScoringType={measureScoringType}
        selectedDataRepo={servers[0]}
    />);

    const serverDropdown: HTMLSelectElement = screen.getByTestId('mea-eva-server-dropdown');
    userEvent.selectOptions(serverDropdown, servers[0].baseUrl);
    expect(setSelectedMeasureEvaluation).toBeCalledWith(servers[0])

    const submitDataButton: HTMLButtonElement = screen.getByTestId('mea-eva-submit-button');
    fireEvent.click(submitDataButton);
    expect(submitData).toHaveBeenCalled();

    const evaluateMeasureButton: HTMLButtonElement = screen.getByTestId('mea-eva-evaluate-button');
    fireEvent.click(evaluateMeasureButton);
    expect(evaluateMeasure).toHaveBeenCalled();

});

test('MeasureEvaluation expect spinner buttons to show with loading set to true', async () => {
    const servers = await ServerUtils.getServerList();

    const loadingFlag: boolean = true;
    const showMeasureEvaluation: boolean = true;

    const setShowMeasureEvaluation = jest.fn();
    const setSelectedMeasureEvaluation = jest.fn();
    const submitData = jest.fn();
    const evaluateMeasure = jest.fn();

    const showPopulations: boolean = false;
    const populationScoring: PopulationScoring[] = [];
    const measureScoringType: string = '';

    render(<MeasureEvaluation
        showMeasureEvaluation={showMeasureEvaluation}
        setShowMeasureEvaluation={setShowMeasureEvaluation}
        servers={servers}
        setSelectedMeasureEvaluation={setSelectedMeasureEvaluation}
        selectedMeasureEvaluation={servers[0]}
        submitData={submitData}
        evaluateMeasure={evaluateMeasure}
        loading={loadingFlag}
        setModalShow={jest.fn()}
        populationScoring={populationScoring}
        showPopulations={showPopulations}
        measureScoringType={measureScoringType}
        selectedDataRepo={servers[0]}
    />);

    const submitDataButtonSpinner: HTMLButtonElement = screen.getByTestId('mea-eva-submit-button-spinner');
    expect(submitDataButtonSpinner).toBeInTheDocument();

    const evaluateMeasureButtonSpinner: HTMLButtonElement = screen.getByTestId('mea-eva-evaluate-button-spinner');
    expect(evaluateMeasureButtonSpinner).toBeInTheDocument();
});

test('MeasureEvaluation hide/show functionality', async () => {
    const servers = await ServerUtils.getServerList();

    const loadingFlag: boolean = false;
    const showMeasureEvaluation: boolean = true;

    const setShowMeasureEvaluation = jest.fn();
    const setSelectedMeasureEvaluation = jest.fn();
    const submitData = jest.fn();
    const evaluateMeasure = jest.fn();

    const showPopulations: boolean = false;
    const populationScoring: PopulationScoring[] = [];
    const measureScoringType: string = '';

    render(<MeasureEvaluation
        showMeasureEvaluation={showMeasureEvaluation}
        setShowMeasureEvaluation={setShowMeasureEvaluation}
        servers={servers}
        setSelectedMeasureEvaluation={setSelectedMeasureEvaluation}
        selectedMeasureEvaluation={servers[0]}
        submitData={submitData}
        evaluateMeasure={evaluateMeasure}
        loading={loadingFlag}
        setModalShow={jest.fn()}
        populationScoring={populationScoring}
        showPopulations={showPopulations}
        measureScoringType={measureScoringType}
        selectedDataRepo={servers[0]}
    />);

    const showHideButton: HTMLButtonElement = screen.getByTestId('mea-eva-hide-section-button');
    fireEvent.click(showHideButton);
    expect(setShowMeasureEvaluation).toHaveBeenCalledWith(false);

});

test('MeasureEvaluation hide/show functionality 2', async () => {
    const servers = await ServerUtils.getServerList();

    const loadingFlag: boolean = false;
    const showMeasureEvaluation: boolean = false;

    const setShowMeasureEvaluation = jest.fn();
    const setSelectedMeasureEvaluation = jest.fn();
    const submitData = jest.fn();
    const evaluateMeasure = jest.fn();

    const showPopulations: boolean = false;
    const populationScoring: PopulationScoring[] = [];
    const measureScoringType: string = '';

    render(<MeasureEvaluation
        showMeasureEvaluation={showMeasureEvaluation}
        setShowMeasureEvaluation={setShowMeasureEvaluation}
        servers={servers}
        setSelectedMeasureEvaluation={setSelectedMeasureEvaluation}
        selectedMeasureEvaluation={servers[0]}
        submitData={submitData}
        evaluateMeasure={evaluateMeasure}
        loading={loadingFlag}
        setModalShow={jest.fn()}
        populationScoring={populationScoring} showPopulations={showPopulations} measureScoringType={measureScoringType}
        selectedDataRepo={servers[0]}
    />);

    const showHideButton: HTMLButtonElement = screen.getByTestId('mea-eva-show-section-button');
    fireEvent.click(showHideButton);
    expect(setShowMeasureEvaluation).toHaveBeenCalledWith(true);

    expect(screen.queryByText('Measure Evaluation Server')).not.toBeInTheDocument();
    expect(screen.queryByText('Submit Data')).not.toBeInTheDocument();
    expect(screen.queryByText('Evaluate Measure')).not.toBeInTheDocument();
});

