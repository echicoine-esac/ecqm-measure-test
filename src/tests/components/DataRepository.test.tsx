import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DataRepository from '../../components/DataRepository';
import { ServerUtils } from '../../utils/ServerUtils';
import { Constants } from '../../constants/Constants';
import { PatientFetch } from '../../data/PatientFetch';
import { Patient } from '../../models/Patient';

beforeEach(() => {
    jest.spyOn(ServerUtils, 'getServerList').mockImplementation(async () => {
        return Constants.serverTestData;
    });
});

test('expect functions to be called when selecting items in dropdown', async () => {
    const patients = [{display: 'Jane Doe', id:'test-patient-1'}, {display: 'John Doe', id:'test-patient-2'}];
    const servers = await ServerUtils.getServerList();

    const loadingFlag: boolean = false;
    const showDataRepo: boolean = true;

    const fetchPatients = jest.fn();
    const setSelectedPatient = jest.fn();
    const setSelectedPatientGroup = jest.fn();

    render(<DataRepository
        showDataRepo={showDataRepo}
        setShowDataRepo={jest.fn()}
        servers={servers}
        selectedDataRepo={servers[1]}
        patients={patients}
        fetchPatients={fetchPatients}
        setSelectedPatient={setSelectedPatient}
        selectedPatient={patients[0]}
        collectData={jest.fn()}
        loading={loadingFlag}
        setModalShow={jest.fn()}
        setSelectedPatientGroup={setSelectedPatientGroup}
    />);

    //select first server
    const serverDropdown: HTMLSelectElement = screen.getByTestId('data-repo-server-dropdown');
    userEvent.selectOptions(serverDropdown, servers[0].baseUrl);
    expect(fetchPatients).toBeCalledWith(servers[0])

    //select first patient
    const expectedPatient: Patient = {display: 'Jane Doe', id:'test-patient-1'};
    const expectedDisplayName:string = PatientFetch.buildUniquePatientIdentifier(expectedPatient) + '';
    const patientDropdown: HTMLSelectElement = screen.getByTestId('data-repo-patient-dropdown');
    userEvent.selectOptions(patientDropdown, expectedDisplayName);
    expect(setSelectedPatient).toBeCalledWith(expectedPatient)

});

test('expect spinner to show when loading is true', async () => {
    const patients = [{display: 'Jane Doe', id:'test-patient-1'}, {display: 'John Doe', id:'test-patient-2'}];
    const servers = await ServerUtils.getServerList();

    const loadingFlag: boolean = true;
    const showDataRepo: boolean = true;

    const fetchPatients = jest.fn();
    const setSelectedPatient = jest.fn();
    const setSelectedPatientGroup = jest.fn();

    render(<DataRepository
        showDataRepo={showDataRepo}
        setShowDataRepo={jest.fn()}
        servers={servers}
        selectedDataRepo={servers[1]}
        patients={patients}
        fetchPatients={fetchPatients}
        setSelectedPatient={setSelectedPatient}
        selectedPatient={patients[0]}
        collectData={jest.fn()}
        loading={loadingFlag}
        setModalShow={jest.fn()}
        setSelectedPatientGroup={setSelectedPatientGroup}
    />);

    const evaluateButtonWithSpinner: HTMLButtonElement = screen.getByTestId('data-repo-collect-data-button-spinner');
    expect(evaluateButtonWithSpinner).toBeInTheDocument();
});

test('hide section', async () => {
    const patients = [{display: 'Jane Doe', id:'test-patient-1'}, {display: 'John Doe', id:'test-patient-2'}];
    const servers = await ServerUtils.getServerList();

    const loadingFlag: boolean = false;
    const showDataRepo: boolean = false;

    const setShowDataRepo = jest.fn();
    const fetchPatients = jest.fn();
    const setSelectedPatient = jest.fn();
    const collectData = jest.fn();
    const setSelectedPatientGroup = jest.fn();


    render(<DataRepository
        showDataRepo={showDataRepo}
        setShowDataRepo={setShowDataRepo}
        servers={servers}
        selectedDataRepo={servers[0]}
        patients={patients}
        fetchPatients={fetchPatients}
        setSelectedPatient={setSelectedPatient}
        selectedPatient={{display: '', id: ''}}
        collectData={collectData}
        loading={loadingFlag}
        setModalShow={jest.fn()}
        setSelectedPatientGroup={setSelectedPatientGroup}
    />);

    const hideShowButton: HTMLButtonElement = screen.getByTestId('data-repo-show-section-button');
    fireEvent.click(hideShowButton);
    expect(setShowDataRepo).toHaveBeenCalledWith(true);
});

test('show section', async () => {
    const patients = [{display: 'Jane Doe', id:'test-patient-1'}, {display: 'John Doe', id:'test-patient-2'}];
    const servers = await ServerUtils.getServerList();

    const loadingFlag: boolean = false;
    const showDataRepo: boolean = true;

    const setShowDataRepo = jest.fn();
    const fetchPatients = jest.fn();
    const setSelectedPatient = jest.fn();
    const collectData = jest.fn();
    const setSelectedPatientGroup = jest.fn();

    render(<DataRepository
        showDataRepo={showDataRepo}
        setShowDataRepo={setShowDataRepo}
        servers={servers}
        selectedDataRepo={servers[0]}
        patients={patients}
        fetchPatients={fetchPatients}
        setSelectedPatient={setSelectedPatient}
        selectedPatient={{display: '', id: ''}}
        collectData={collectData}
        loading={loadingFlag}
        setModalShow={jest.fn()}
        setSelectedPatientGroup={setSelectedPatientGroup}
    />);

    const evaluateButton: HTMLButtonElement = screen.getByTestId('data-repo-hide-section-button');
    fireEvent.click(evaluateButton);
    expect(setShowDataRepo).toHaveBeenCalledWith(false);
});

 