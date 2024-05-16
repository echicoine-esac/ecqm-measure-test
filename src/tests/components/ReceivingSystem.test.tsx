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
    const postMeasureReport = jest.fn();

    render(<ReceivingSystem
        showReceiving={showReceiving}
        setShowReceiving={setShowReceiving}
        servers={servers}
        setSelectedReceiving={setSelectedReceiving}
        selectedReceiving={servers[0]}
        postMeasureReport={postMeasureReport}
        loading={loadingFlag}
        setModalShow={jest.fn()}
    />);

    const serverDropdown: HTMLSelectElement = screen.getByTestId('rec-sys-server-dropdown');
    userEvent.selectOptions(serverDropdown, servers[0].baseUrl);
    expect(setSelectedReceiving).toBeCalledWith(servers[0])

    const postMeasureReportButton: HTMLButtonElement = screen.getByTestId('rec-sys-submit-button');
    fireEvent.click(postMeasureReportButton);
    expect(postMeasureReportButton).toHaveBeenCalled();

});

test('expect spinner to show with loading set to true', async () => {
    const servers = await ServerUtils.getServerList();

    const loadingFlag: boolean = true;
    const showReceiving: boolean = true;

    const setShowReceiving = jest.fn();
    const setSelectedReceiving = jest.fn();
    const postMeasureReport = jest.fn();

    render(<ReceivingSystem
        showReceiving={showReceiving}
        setShowReceiving={setShowReceiving}
        servers={servers}
        setSelectedReceiving={setSelectedReceiving}
        selectedReceiving={servers[0]}
        postMeasureReport={postMeasureReport}
        loading={loadingFlag}
        setModalShow={jest.fn()}
    />);

    const postMeasureReportButton: HTMLButtonElement = screen.getByTestId('rec-sys-submit-button-spinner');
    expect(postMeasureReportButton).toBeInTheDocument();
});

test('hide/show functionality', async () => {
    const servers = await ServerUtils.getServerList();

    const loadingFlag: boolean = false;
    const showReceiving: boolean = true;

    const setShowReceiving = jest.fn();
    const setSelectedReceiving = jest.fn();
    const postMeasureReport = jest.fn();

    render(<ReceivingSystem
        showReceiving={showReceiving}
        setShowReceiving={setShowReceiving}
        servers={servers}
        setSelectedReceiving={setSelectedReceiving}
        selectedReceiving={servers[0]}
        postMeasureReport={postMeasureReport}
        loading={loadingFlag}
        setModalShow={jest.fn()}
    />);

    const showHideButton: HTMLButtonElement = screen.getByTestId('rec-sys-hide-section-button');
    fireEvent.click(showHideButton);
    expect(setShowReceiving).toHaveBeenCalledWith(false);

});

test('hide/show functionality', async () => {
    const servers = await ServerUtils.getServerList();

    const loadingFlag: boolean = false;
    const showReceiving: boolean = false;

    const setShowReceiving = jest.fn();
    const setSelectedReceiving = jest.fn();
    const postMeasureReport = jest.fn();

    render(<ReceivingSystem
        showReceiving={showReceiving}
        setShowReceiving={setShowReceiving}
        servers={servers}
        setSelectedReceiving={setSelectedReceiving}
        selectedReceiving={servers[0]}
        postMeasureReport={postMeasureReport}
        loading={loadingFlag}
        setModalShow={jest.fn()}
    />);

    const showHideButton: HTMLButtonElement = screen.getByTestId('rec-sys-show-section-button');
    fireEvent.click(showHideButton);
    expect(setShowReceiving).toHaveBeenCalledWith(true);

    expect(screen.queryByText('Receiving System Server')).not.toBeInTheDocument();
    expect(screen.queryByText('Post Measure Report')).not.toBeInTheDocument();
});

