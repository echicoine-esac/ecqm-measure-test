import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ReceivingSystem from '../../components/ReceivingSystem';
import {Server} from "../../models/Server";

test('expect functions to be called properly', () => {
    const servers = buildServerData();

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
        selectedReceiving={''} 
        submitData={submitData}
        evaluateMeasure={evaluateMeasure}
        loading={loadingFlag}
    />);

    const serverDropdown: HTMLSelectElement = screen.getByTestId('rec-sys-server-dropdown');
    userEvent.selectOptions(serverDropdown, 'test-server-2');
    expect(setSelectedReceiving).toBeCalledWith('test-server-2')

    const submitButton: HTMLButtonElement = screen.getByTestId('rec-sys-submit-button');
    fireEvent.click(submitButton);
    expect(submitData).toHaveBeenCalled();

});

test('expect spinner to show with loading set to true', () => {
    const servers = buildServerData();

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
        selectedReceiving={''} 
        submitData={submitData}
        evaluateMeasure={evaluateMeasure}
        loading={loadingFlag}
    />);

    const submitButton: HTMLButtonElement = screen.getByTestId('rec-sys-submit-button-spinner');
    expect(submitButton).toBeInTheDocument();

    const evalButton: HTMLButtonElement = screen.getByTestId('rec-sys-evaluate-button-spinner');
    expect(evalButton).toBeInTheDocument();

});
 
test('hide/show functionality', () => {
    const servers = buildServerData();

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
        selectedReceiving={''} 
        submitData={submitData}
        evaluateMeasure={evaluateMeasure}
        loading={loadingFlag}
    />);

    const evaluateButton: HTMLButtonElement = screen.getByTestId('rec-sys-hide-section-button');
    fireEvent.click(evaluateButton);
    expect(setShowReceiving).toHaveBeenCalledWith(false);

});

test('hide/show functionality', () => {
    const servers = buildServerData();

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
        selectedReceiving={''} 
        submitData={submitData}
        evaluateMeasure={evaluateMeasure}
        loading={loadingFlag}
    />);

    const evaluateButton: HTMLButtonElement = screen.getByTestId('rec-sys-show-section-button');
    fireEvent.click(evaluateButton);
    expect(setShowReceiving).toHaveBeenCalledWith(true);

    expect(screen.queryByText('Receiving System Server')).not.toBeInTheDocument();
    expect(screen.queryByText('Submit Data')).not.toBeInTheDocument();
    expect(screen.queryByText('Evaluate Measure')).not.toBeInTheDocument();
});

function buildServerData(): Server[] {
    return [buildAServer('1'), buildAServer('2'), buildAServer('3')]
}

function buildAServer(count: string): Server {
    return {
        id: 'ec2345-' + count,
        baseUrl: 'http://localhost:8080-' + count
    }
}