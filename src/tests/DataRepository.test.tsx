import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import DataRepository from '../components/DataRepository';

test('evaluate function calls', () => {
    const measures = ['test-measure-1', 'test-measure-2'];
    const patients = ['test-patient-1', 'test-patient-2'];
    const serverUrls = ['test-server-1', 'test-server-2'];

    let loadingFlag: boolean = false;

    const evaluateMeasure = jest.fn();
    const setSelectedServer = jest.fn();
    const fetchMeasures = jest.fn();
    const setSelectedMeasure = jest.fn();
    const setSelectedPatient = jest.fn();

    render(<DataRepository
        serverUrls={serverUrls}
        measures={measures}
        patients={patients}
        setSelectedServer={setSelectedServer}
        fetchMeasures={fetchMeasures}
        setSelectedMeasure={setSelectedMeasure}
        setSelectedPatient={setSelectedPatient}
        evaluateMeasure={evaluateMeasure}
        loading={loadingFlag} />);

    const serverDropdown: HTMLSelectElement = screen.getByTestId('server-dropdown');
    const measureDropdown: HTMLSelectElement = screen.getByTestId('measure-dropdown');
    const patientDropdown: HTMLSelectElement = screen.getByTestId('patient-dropdown');
    const evaluateButton: HTMLButtonElement = screen.getByTestId('evaluate-button');

    expect(serverDropdown).toBeInTheDocument;
    expect(measureDropdown).toBeInTheDocument;
    expect(patientDropdown).toBeInTheDocument;
    expect(evaluateButton).toBeInTheDocument;

    userEvent.selectOptions(serverDropdown, 'test-server-2');
    expect(fetchMeasures).toBeCalledWith('test-server-2')

    userEvent.selectOptions(measureDropdown, 'test-measure-2');
    expect(setSelectedMeasure).toHaveBeenCalledWith('test-measure-2')

    userEvent.selectOptions(patientDropdown, 'test-patient-2');
    expect(setSelectedPatient).toHaveBeenCalledWith('test-patient-2');

    fireEvent.click(evaluateButton);
    expect(evaluateMeasure).toBeCalled();

});

test('evaluate spinner test', () => {
    const measures = ['test-measure-1', 'test-measure-2'];
    const patients = ['test-patient-1', 'test-patient-2'];
    const serverUrls = ['test-server-1', 'test-server-2'];

    let loadingFlag: boolean = true;

    const evaluateMeasure = jest.fn();
    const setSelectedServer = jest.fn();
    const fetchMeasures = jest.fn();
    const setSelectedMeasure = jest.fn();
    const setSelectedPatient = jest.fn();

    render(<DataRepository
        serverUrls={serverUrls}
        measures={measures}
        patients={patients}
        setSelectedServer={setSelectedServer}
        fetchMeasures={fetchMeasures}
        setSelectedMeasure={setSelectedMeasure}
        setSelectedPatient={setSelectedPatient}
        evaluateMeasure={evaluateMeasure}
        loading={loadingFlag} />);


    let evaluateButton = screen.getByTestId('evaluate-button-spinner');
    expect(evaluateButton).toBeInTheDocument;

});


