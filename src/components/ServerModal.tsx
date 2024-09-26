import React, {useState} from 'react';
import {Button, Form, Modal} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Constants } from '../constants/Constants';

// Props for ServerModal
interface Props {
    modalShow: boolean;
    setModalShow: React.Dispatch<React.SetStateAction<boolean>>;
    createServer: (baseUrl: string, authUrl: string, tokenUrl: string, clientId: string,
                   clientSecret: string, scope: string) => void;
}

// ServerModal component collects the information for adding an endpoint
const ServerModal: React.FC<Props> = ({modalShow, setModalShow, createServer}) => {
    const [baseUrl, setBaseUrl] = useState<string>('');
    const [authUrl, setAuthUrl] = useState<string>('');
    const [tokenUrl, setTokenUrl] = useState<string>('');
    const [clientId, setClientId] = useState<string>('');
    const [clientSecret, setClientSecret] = useState<string>('');
    const [scope, setScope] = useState<string>('user/*.read');
    const [validated, setValidated] = useState<boolean>(false);
    const [errors, setErrors] = useState({'baseUrl': '',
        'authUrl': '', 'tokenUrl': ''});

    const baseUrlHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBaseUrl(event.target.value);
    }

    const authUrlHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAuthUrl(event.target.value);
    }

    const tokenUrlHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTokenUrl(event.target.value);
    }

    const clientIdHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setClientId(event.target.value);
    }

    const clientSecretHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setClientSecret(event.target.value);
    }

    const scopeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setScope(event.target.value);
    }

    // Takes a URL and validates that it starts with http:// or https:// and ends with /
    const validateUrl = (url: string) : string => {
        let message: string = '';

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            message = Constants.error_urlStartsWith;
        } else if (!url.endsWith('/')) {
            message = Constants.error_urlEndsWith;
        }

        return message;
    }

    // Validates the input and if valid creates the server endpoint
    const submitServer = (event: React.FormEvent<HTMLFormElement>) => {
        const form = event.currentTarget;

        event.preventDefault();

        if (!form.checkValidity()) {
            event.stopPropagation();
        } else {
            // Validate any URLs are valid URLs
            let message: string = validateUrl(baseUrl);
            if (message !== '') {
                setErrors({...errors, baseUrl: message});
                event.stopPropagation();
                return;
            }

            //only validate optional fields when values exist:
            if (authUrl) {
                message = validateUrl(authUrl);
                if (message !== '') {
                    setErrors({...errors, authUrl: message});
                    event.stopPropagation();
                    return;
                }
            }

            if (tokenUrl) {
                message = validateUrl(tokenUrl);
                if (message !== '') {
                    setErrors({...errors, tokenUrl: message});
                    event.stopPropagation();
                    return;
                }
            }

            createServer(baseUrl, authUrl, tokenUrl, clientId, clientSecret, scope);
            setModalShow(false);
            setBaseUrl('');
        }

        setValidated(true);
    }

    return (
        <Modal size='lg' centered show={modalShow}>
            <Form data-testid='server-model-form' noValidate validated={validated} onSubmit={submitServer}>
                <Modal.Header><h2>Add server endpoint</h2></Modal.Header>
                <Modal.Body>
                    <div className='row'>
                        By adding your server to this testing tool you are allowing anyone to run the tool
                        against your server and to see your server URL. Please ensure that the server does not contain
                        PHI or PII data and you may choose to secure your endpoint with OAuth2 to limit only those
                        with the username and password to access it.
                        <hr/>
                    </div>
                    <Form.Group controlId='form.baseUrl'>
                        <Form.Label>Base URL (required)</Form.Label>
                        <Form.Control data-testid='server-model-baseurl-text' type='text' value={baseUrl} placeholder='https://example.com/fhir/'
                                      onChange={baseUrlHandler} isInvalid={errors.baseUrl !== ''} required/>
                        <Form.Control.Feedback data-testid='server-model-baseurl-feedback' type='invalid'>{Constants.error_url}{errors.baseUrl}</Form.Control.Feedback>
                    </Form.Group>
                    <hr/>
                    If your server requires OAuth authentication then please provide the additional values
                    <Form.Group controlId='form.authUrl'>
                        <Form.Label>Authentication URL</Form.Label>
                        <Form.Control data-testid='server-model-authurl-text' type='text' value={authUrl} placeholder='https://example.com/auth/'
                                      onChange={authUrlHandler} isInvalid={errors.authUrl !== ''}/>
                        <Form.Control.Feedback data-testid='server-model-authurl-feedback'  type='invalid'>{Constants.error_url}{errors.authUrl}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group controlId='form.tokenUrl'>
                        <Form.Label>Token Access URL</Form.Label>
                        <Form.Control data-testid='server-model-accessurl-text' type='text' value={tokenUrl} placeholder='https://example.com/token/'
                                      onChange={tokenUrlHandler} isInvalid={errors.tokenUrl !== ''}/>
                        <Form.Control.Feedback data-testid='server-model-accessurl-feedback' type='invalid'>{Constants.error_url}{errors.tokenUrl}</Form.Control.Feedback>
 
                    </Form.Group>
                    <Form.Group controlId='form.clientId'>
                        <Form.Label>Client ID</Form.Label>
                        <Form.Control data-testid='server-model-clientid-text' type='text' value={clientId} placeholder='AC3487FB-8743-BC24-F309857698'
                                      onChange={clientIdHandler}/>
                    </Form.Group>
                    <Form.Group controlId='form.clientSecret'>
                        <Form.Label>Client Secret</Form.Label>
                        <Form.Control data-testid='server-model-clientsecret-text' type='text' value={clientSecret} placeholder='32838A84B90'
                                      onChange={clientSecretHandler}/>
                    </Form.Group>
                    <Form.Group controlId='form.scope'>
                        <Form.Label>Scope</Form.Label>
                        <Form.Control data-testid='server-model-scope-text' type='text' value={scope} placeholder='user/*.read'
                                      onChange={scopeHandler}/>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button data-testid='server-model-cancel-button' onClick={() => setModalShow(false)}>Cancel</Button>
                    <Button data-testid='server-model-submit-button' type='submit'>Save</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ServerModal;