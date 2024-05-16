import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MeasureEvaluation from '../../components/MeasureEvaluation';
import { ServerUtils } from '../../utils/ServerUtils';
import { Constants } from '../../constants/Constants';

beforeEach(() => {
    jest.spyOn(ServerUtils, 'getServerList').mockImplementation(async () => {
        return Constants.serverTestData;
    });
});

test('expect functions to be called properly', async () => {
    const servers = await ServerUtils.getServerList();

    const loadingFlag: boolean = false;
    const showMeasureEvaluation: boolean = true;

    const setShowMeasureEvaluation = jest.fn();
    const setSelectedMeasureEvaluation = jest.fn();
    const submitData = jest.fn();
    const evaluateMeasure = jest.fn();

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
    />);

    const serverDropdown: HTMLSelectElement = screen.getByTestId('rec-sys-server-dropdown');
    userEvent.selectOptions(serverDropdown, servers[0].baseUrl);
    expect(setSelectedMeasureEvaluation).toBeCalledWith(servers[0])

    const submitDataButton: HTMLButtonElement = screen.getByTestId('rec-sys-submit-button');
    fireEvent.click(submitDataButton);
    expect(submitDataButton).toHaveBeenCalled();

    const evaluateMeasureButton: HTMLButtonElement = screen.getByTestId('rec-sys-evaluate-button');
    fireEvent.click(evaluateMeasureButton);
    expect(evaluateMeasureButton).toHaveBeenCalled();

});

test('expect spinner to show with loading set to true', async () => {
    const servers = await ServerUtils.getServerList();

    const loadingFlag: boolean = true;
    const showMeasureEvaluation: boolean = true;

    const setShowMeasureEvaluation = jest.fn();
    const setSelectedMeasureEvaluation = jest.fn();
    const submitData = jest.fn();
    const evaluateMeasure = jest.fn();

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
    />);

    const submitDataButton: HTMLButtonElement = screen.getByTestId('rec-sys-submit-button');
    expect(submitDataButton).toBeInTheDocument();

    const evaluateMeasureButton: HTMLButtonElement = screen.getByTestId('rec-sys-evaluate-button');
    expect(evaluateMeasureButton).toBeInTheDocument();
});

test('hide/show functionality', async () => {
    const servers = await ServerUtils.getServerList();

    const loadingFlag: boolean = false;
    const showMeasureEvaluation: boolean = true;

    const setShowMeasureEvaluation = jest.fn();
    const setSelectedMeasureEvaluation = jest.fn();
    const submitData = jest.fn();
    const evaluateMeasure = jest.fn();

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
    />);

    const showHideButton: HTMLButtonElement = screen.getByTestId('rec-sys-hide-section-button');
    fireEvent.click(showHideButton);
    expect(setShowMeasureEvaluation).toHaveBeenCalledWith(false);

});

test('hide/show functionality', async () => {
    const servers = await ServerUtils.getServerList();

    const loadingFlag: boolean = false;
    const showMeasureEvaluation: boolean = false;

    const setShowMeasureEvaluation = jest.fn();
    const setSelectedMeasureEvaluation = jest.fn();
    const submitData = jest.fn();
    const evaluateMeasure = jest.fn();

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
    />);

    const showHideButton: HTMLButtonElement = screen.getByTestId('rec-sys-show-section-button');
    fireEvent.click(showHideButton);
    expect(setShowMeasureEvaluation).toHaveBeenCalledWith(true);

    expect(screen.queryByText('Measure Evaluation Server')).not.toBeInTheDocument();
    expect(screen.queryByText('Submit Data')).not.toBeInTheDocument();
    expect(screen.queryByText('Evaluate Measure')).not.toBeInTheDocument();
});

