import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ReceivingSystem from '../../components/ReceivingSystem';

test('expect functions to be called properly', () => {
    const serverUrls = ['test-server-1', 'test-server-2'];

    const loadingFlag: boolean = false;
    const showReceiving: boolean = true;

    const setShowReceiving = jest.fn();
    const setSelectedReceiving = jest.fn();
    const submitData = jest.fn();
    const evaluateMeasure = jest.fn();

    render(<ReceivingSystem
        showReceiving={showReceiving}
        setShowReceiving={setShowReceiving}
        serverUrls={serverUrls}
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
    const serverUrls = ['test-server-1', 'test-server-2'];

    const loadingFlag: boolean = true;
    const showReceiving: boolean = true;

    const setShowReceiving = jest.fn();
    const setSelectedReceiving = jest.fn();
    const submitData = jest.fn();
    const evaluateMeasure = jest.fn();

    render(<ReceivingSystem
        showReceiving={showReceiving}
        setShowReceiving={setShowReceiving}
        serverUrls={serverUrls}
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
    const serverUrls = ['test-server-1', 'test-server-2'];

    const loadingFlag: boolean = false;
    const showReceiving: boolean = true;

    const setShowReceiving = jest.fn();
    const setSelectedReceiving = jest.fn();
    const submitData = jest.fn();
    const evaluateMeasure = jest.fn();

    render(<ReceivingSystem
        showReceiving={showReceiving}
        setShowReceiving={setShowReceiving}
        serverUrls={serverUrls}
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
    const serverUrls = ['test-server-1', 'test-server-2'];

    const loadingFlag: boolean = false;
    const showReceiving: boolean = false;

    const setShowReceiving = jest.fn();
    const setSelectedReceiving = jest.fn();
    const submitData = jest.fn();
    const evaluateMeasure = jest.fn();

    render(<ReceivingSystem
        showReceiving={showReceiving}
        setShowReceiving={setShowReceiving}
        serverUrls={serverUrls}
        setSelectedReceiving={setSelectedReceiving}
        selectedReceiving={''} 
        submitData={submitData}
        evaluateMeasure={evaluateMeasure}
        loading={loadingFlag}
    />);

    const evaluateButton: HTMLButtonElement = screen.getByTestId('rec-sys-show-section-button');
    fireEvent.click(evaluateButton);
    expect(setShowReceiving).toHaveBeenCalledWith(true);

    expect(screen.queryByText("Receiving System Server")).not.toBeInTheDocument();
    expect(screen.queryByText("Submit Data")).not.toBeInTheDocument();
    expect(screen.queryByText("Evaluate Measure")).not.toBeInTheDocument();
});

 

