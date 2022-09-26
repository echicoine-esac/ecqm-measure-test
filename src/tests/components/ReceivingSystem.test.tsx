import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReceivingSystem from '../../components/ReceivingSystem';
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
    const showReceiving: boolean = true;

    const setShowReceiving = jest.fn();
    const setSelectedReceiving = jest.fn();
    const submitData = jest.fn();
    const evaluateMeasure = jest.fn();

    render(<ReceivingSystem
        showReceiving={showReceiving}
        setShowReceiving={setShowReceiving}
        servers={servers}
        setSelectedReceiving={setSelectedReceiving}
        selectedReceiving={servers[0]}
        submitData={submitData}
        evaluateMeasure={evaluateMeasure}
        loading={loadingFlag}
        setModalShow={jest.fn()}
    />);

    const serverDropdown: HTMLSelectElement = screen.getByTestId('rec-sys-server-dropdown');
    userEvent.selectOptions(serverDropdown, servers[0].baseUrl);
    expect(setSelectedReceiving).toBeCalledWith(servers[0])

    const submitButton: HTMLButtonElement = screen.getByTestId('rec-sys-submit-button');
    fireEvent.click(submitButton);
    expect(submitData).toHaveBeenCalled();

});

test('expect spinner to show with loading set to true', async () => {
    const servers = await ServerUtils.getServerList();

    const loadingFlag: boolean = true;
    const showReceiving: boolean = true;

    const setShowReceiving = jest.fn();
    const setSelectedReceiving = jest.fn();
    const submitData = jest.fn();
    const evaluateMeasure = jest.fn();

    render(<ReceivingSystem
        showReceiving={showReceiving}
        setShowReceiving={setShowReceiving}
        servers={servers}
        setSelectedReceiving={setSelectedReceiving}
        selectedReceiving={servers[0]}
        submitData={submitData}
        evaluateMeasure={evaluateMeasure}
        loading={loadingFlag}
        setModalShow={jest.fn()}
    />);

    const submitButton: HTMLButtonElement = screen.getByTestId('rec-sys-submit-button-spinner');
    expect(submitButton).toBeInTheDocument();

    const evalButton: HTMLButtonElement = screen.getByTestId('rec-sys-evaluate-button-spinner');
    expect(evalButton).toBeInTheDocument();

});

test('hide/show functionality', async () => {
    const servers = await ServerUtils.getServerList();

    const loadingFlag: boolean = false;
    const showReceiving: boolean = true;

    const setShowReceiving = jest.fn();
    const setSelectedReceiving = jest.fn();
    const submitData = jest.fn();
    const evaluateMeasure = jest.fn();

    render(<ReceivingSystem
        showReceiving={showReceiving}
        setShowReceiving={setShowReceiving}
        servers={servers}
        setSelectedReceiving={setSelectedReceiving}
        selectedReceiving={servers[0]}
        submitData={submitData}
        evaluateMeasure={evaluateMeasure}
        loading={loadingFlag}
        setModalShow={jest.fn()}
    />);

    const evaluateButton: HTMLButtonElement = screen.getByTestId('rec-sys-hide-section-button');
    fireEvent.click(evaluateButton);
    expect(setShowReceiving).toHaveBeenCalledWith(false);

});

test('hide/show functionality', async () => {
    const servers = await ServerUtils.getServerList();

    const loadingFlag: boolean = false;
    const showReceiving: boolean = false;

    const setShowReceiving = jest.fn();
    const setSelectedReceiving = jest.fn();
    const submitData = jest.fn();
    const evaluateMeasure = jest.fn();

    render(<ReceivingSystem
        showReceiving={showReceiving}
        setShowReceiving={setShowReceiving}
        servers={servers}
        setSelectedReceiving={setSelectedReceiving}
        selectedReceiving={servers[0]}
        submitData={submitData}
        evaluateMeasure={evaluateMeasure}
        loading={loadingFlag}
        setModalShow={jest.fn()}
    />);

    const evaluateButton: HTMLButtonElement = screen.getByTestId('rec-sys-show-section-button');
    fireEvent.click(evaluateButton);
    expect(setShowReceiving).toHaveBeenCalledWith(true);

    expect(screen.queryByText('Receiving System Server')).not.toBeInTheDocument();
    expect(screen.queryByText('Submit Data')).not.toBeInTheDocument();
    expect(screen.queryByText('Evaluate Measure')).not.toBeInTheDocument();
});

