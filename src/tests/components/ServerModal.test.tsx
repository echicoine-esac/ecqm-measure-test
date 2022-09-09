import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ServerModal from '../../components/ServerModal';

test('ServerModel form validation - base url, auth url, access url', async () => {
    const modalShow = true;

    const createServer = jest.fn();
    const setModalShow = jest.fn();

    const baseUrlText = 'server-model-baseurl-text';
    const baseUrlFeedback = 'server-model-authurl-feedback';
    const authUrlText = 'server-model-authurl-text';
    const accessUrlText = 'server-model-accessurl-text';

    render(
        <ServerModal
            modalShow={modalShow}
            setModalShow={setModalShow}
            createServer={createServer}
        />
    );
    const baseUrlTextField: HTMLInputElement = screen.getByTestId(baseUrlText);
    const authUrlTextField: HTMLInputElement = screen.getByTestId(authUrlText);
    const accessUrlTextField: HTMLInputElement = screen.getByTestId(accessUrlText);

    await userEvent.type(baseUrlTextField, 'invalid url user input');
    expect(screen.getByTestId(baseUrlFeedback)).toBeInTheDocument();

    await userEvent.type(authUrlTextField, 'invalid url user input');
    expect(screen.getByTestId(baseUrlFeedback)).toBeInTheDocument();

    await userEvent.type(accessUrlTextField, 'invalid url user input');
    expect(screen.getByTestId(baseUrlFeedback)).toBeInTheDocument();

});

test('Server Model - createServer called with correct data', async () => {
    const modalShow = true;

    const createServer = jest.fn();
    const setModalShow = jest.fn();

    const baseUrlText = 'server-model-baseurl-text';
    const authUrlText = 'server-model-authurl-text';
    const accessUrlText = 'server-model-accessurl-text';
    const clientIdText = 'server-model-clientid-text';
    const scopeText = 'server-model-scope-text';
    const submitButton = 'server-model-submit-button';

    render(
        <ServerModal
            modalShow={modalShow}
            setModalShow={setModalShow}
            createServer={createServer}
        />
    );
    const baseUrlTextField: HTMLInputElement = screen.getByTestId(baseUrlText);
    const authUrlTextField: HTMLInputElement = screen.getByTestId(authUrlText);
    const accessUrlTextField: HTMLInputElement = screen.getByTestId(accessUrlText);
    const clientIdTextField: HTMLInputElement = screen.getByTestId(clientIdText);
    const scopeTextField: HTMLInputElement = screen.getByTestId(scopeText);
    const submitButtonField: HTMLButtonElement = screen.getByTestId(submitButton);


    await userEvent.type(baseUrlTextField, 'http://localhost:8080/baseUrl');
    await userEvent.type(authUrlTextField, 'http://localhost:8080/authUrl');
    await userEvent.type(accessUrlTextField, 'http://localhost:8080/accessUrl');
    await userEvent.type(clientIdTextField, 'clientId');
    await userEvent.type(scopeTextField, 'Scope');

    fireEvent.click(submitButtonField);
    expect(createServer).toHaveBeenCalledWith(
        'http://localhost:8080/baseUrl',
        'http://localhost:8080/authUrl',
        'http://localhost:8080/accessUrl',
        'clientId',
        '',
        'user/*.readScope');
});

test('Server Model - cancel sets modalShow to false', async () => {
    const modalShow = true;

    const createServer = jest.fn();
    const setModalShow = jest.fn();

    const cancelButton = 'server-model-cancel-button';

    render(
        <ServerModal
            modalShow={modalShow}
            setModalShow={setModalShow}
            createServer={createServer}
        />
    );

    const cancelButtonField: HTMLButtonElement = screen.getByTestId(cancelButton);

    fireEvent.click(cancelButtonField);

    expect(setModalShow).toHaveBeenCalledWith(false);

});

test('Server Model - ', async () => {
    const modalShow = true;

    const createServer = jest.fn();
    const setModalShow = jest.fn();

    const form = 'server-model-form';
    const baseUrlText = 'server-model-baseurl-text';
    const authUrlText = 'server-model-authurl-text';
    const accessUrlText = 'server-model-accessurl-text';
    const clientIdText = 'server-model-clientid-text';
    const clientSecretText = 'server-model-clientsecret-text';
    const scopeText = 'server-model-scope-text';
    const cancelButton = 'server-model-cancel-button';
    const submitButton = 'server-model-submit-button';

    render(
        <ServerModal
            modalShow={modalShow}
            setModalShow={setModalShow}
            createServer={createServer}
        />
    );
    const formField: HTMLFormElement = screen.getByTestId(form);
    const baseUrlTextField: HTMLInputElement = screen.getByTestId(baseUrlText);
    const authUrlTextField: HTMLInputElement = screen.getByTestId(authUrlText);
    const accessUrlTextField: HTMLInputElement = screen.getByTestId(accessUrlText);
    const clientIdTextField: HTMLInputElement = screen.getByTestId(clientIdText);
    const clientSecretTextField: HTMLInputElement = screen.getByTestId(clientSecretText);
    const scopeTextField: HTMLInputElement = screen.getByTestId(scopeText);
    const cancelButtonField: HTMLButtonElement = screen.getByTestId(cancelButton);
    const submitButtonField: HTMLButtonElement = screen.getByTestId(submitButton);

    expect(formField).toBeInTheDocument();
    expect(baseUrlTextField).toBeInTheDocument();
    expect(authUrlTextField).toBeInTheDocument();
    expect(accessUrlTextField).toBeInTheDocument();
    expect(clientIdTextField).toBeInTheDocument();
    expect(clientSecretTextField).toBeInTheDocument();
    expect(scopeTextField).toBeInTheDocument();
    expect(cancelButtonField).toBeInTheDocument();
    expect(submitButtonField).toBeInTheDocument();

});