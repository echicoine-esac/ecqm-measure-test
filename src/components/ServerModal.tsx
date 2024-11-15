import React, { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Constants } from '../constants/Constants';

interface Props {
  modalShow: boolean;
  setModalShow: React.Dispatch<React.SetStateAction<boolean>>;
  createServer: (
    baseUrl: string,
    authUrl: string,
    tokenUrl: string,
    clientId: string,
    clientSecret: string,
    scope: string
  ) => void;
}

const ServerModal: React.FC<Props> = ({ modalShow, setModalShow, createServer }) => {
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [authUrl, setAuthUrl] = useState<string>('');
  const [tokenUrl, setTokenUrl] = useState<string>('');
  const [clientId, setClientId] = useState<string>('');
  const [clientSecret, setClientSecret] = useState<string>('');
  const [scope, setScope] = useState<string>('user/*.read');
  const [validated, setValidated] = useState<boolean>(false);
  const [errors, setErrors] = useState({ 'baseUrl': '', 'authUrl': '', 'tokenUrl': '' });

  const validateUrl = (url: string): string => {
    let message = '';
    if (url.length > 0) {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        message = Constants.error_url + Constants.error_urlStartsWith;
      } else if (!url.endsWith('/')) {
        message = Constants.error_url + Constants.error_urlEndsWith;
      }
    }

    return message;
  };

  const submitServer = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    // Perform basic validation
    let hasErrors = false;
    const newErrors = { ...errors };

    // Validate Base URL
    if (!baseUrl) {
      newErrors.baseUrl = "Base URL is required.";
      hasErrors = true;
    } else {
      const message = validateUrl(baseUrl);
      if (message !== '') {
        newErrors.baseUrl = message;
        hasErrors = true;
      } else {
        newErrors.baseUrl = '';
      }
    }

    // Validate optional authUrl
    if (authUrl) {
      const message = validateUrl(authUrl);
      if (message !== '') {
        newErrors.authUrl = message;
        hasErrors = true;
      } else {
        newErrors.authUrl = '';
      }
    }

    // Validate optional tokenUrl
    if (tokenUrl) {
      const message = validateUrl(tokenUrl);
      if (message !== '') {
        newErrors.tokenUrl = message;
        hasErrors = true;
      } else {
        newErrors.tokenUrl = '';
      }
    }

    setErrors(newErrors);

    // If there are errors, prevent submission
    if (hasErrors) {
      setValidated(false);
      return;
    }

    // Otherwise, mark the form as validated and submit the data
    setValidated(true);
    createServer(baseUrl, authUrl, tokenUrl, clientId, clientSecret, scope);

    // Clear the form and close the modal
    setBaseUrl('');
    setAuthUrl('');
    setTokenUrl('');
    setClientId('');
    setClientSecret('');
    setScope('user/*.read');
    setModalShow(false);
  };


  return (
    <Modal
      size='lg'
      centered
      show={modalShow}
      style={{
        margin: '0px',
        transition: 'opacity 0.3s',
      }}
    >
      <Form
        style={{ padding: '10px' }}
        data-testid='server-model-form'
        noValidate
        validated={validated}
        onSubmit={submitServer} >
        <Modal.Header>
          <h2>Add Server Endpoint</h2>
        </Modal.Header>

        <Modal.Body>


          By adding your server to this testing tool you are allowing
          anyone to run the tool against your server and to see your server
          URL. Please ensure that the server does not contain PHI or PII
          data, and you may choose to secure your endpoint with OAuth2 to
          limit only those with the username and password to access it.



          <Form.Group controlId='form.baseUrl'>
            <Form.Label
              style={{
                marginBottom: '0px',
                marginTop: '10px',
                fontSize: '11pt',
                fontWeight: 'bold'
              }}>Base URL (required)</Form.Label>
            <Form.Control
              data-testid='server-model-baseurl-text'
              type='text'
              value={baseUrl}
              placeholder='https://example.com/fhir/'
              onChange={(e) => setBaseUrl(e.target.value)}
              isInvalid={errors.baseUrl !== ''}
              required />
            <Form.Control.Feedback type='invalid'
              data-testid='server-model-baseurl-feedback'>
              {errors.baseUrl || Constants.error_url}
            </Form.Control.Feedback>
          </Form.Group>
          <hr />
          <h4>OAuth Authentication</h4>
          If your server requires OAuth authentication then please provide the additional settings:

          <Form.Group controlId='form.authUrl'>
            <Form.Label
              style={{
                marginBottom: '0px',
                marginTop: '10px',
                fontSize: '11pt',
                fontWeight: 'bold'
              }}>
              Authentication URL</Form.Label>
            <Form.Control
              data-testid='server-model-authurl-text'
              type='text'
              value={authUrl}
              placeholder='https://example.com/auth/'
              onChange={(e) => setAuthUrl(e.target.value)}
              isInvalid={errors.authUrl !== ''} />
            <Form.Control.Feedback type='invalid'
              data-testid='server-model-authurl-feedback'>
              {errors.authUrl || Constants.error_url}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId='form.tokenUrl'>
            <Form.Label
              style={{
                marginBottom: '0px',
                marginTop: '5px',
                fontSize: '11pt',
                fontWeight: 'bold'
              }}>Token Access URL</Form.Label>
            <Form.Control
              data-testid='server-model-accessurl-text'
              type='text'
              value={tokenUrl}
              placeholder='https://example.com/token/'
              onChange={(e) => setTokenUrl(e.target.value)}
              isInvalid={errors.tokenUrl !== ''} />
            <Form.Control.Feedback type='invalid'
              data-testid='server-model-accessurl-feedback'>
              {errors.tokenUrl || Constants.error_url}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId='form.clientId'>
            <Form.Label
              style={{
                marginBottom: '0px',
                marginTop: '5px',
                fontSize: '11pt',
                fontWeight: 'bold'
              }}>Client ID</Form.Label>
            <Form.Control
              data-testid='server-model-clientid-text'
              type='text'
              value={clientId}
              onChange={(e) => setClientId(e.target.value)} />
          </Form.Group>
          <Form.Group controlId='form.clientSecret'>
            <Form.Label
              style={{
                marginBottom: '0px',
                marginTop: '5px',
                fontSize: '11pt',
                fontWeight: 'bold'
              }}>Client Secret</Form.Label>
            <Form.Control
              data-testid='server-model-clientsecret-text'
              type='text'
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)} />
          </Form.Group>
          <Form.Group controlId='form.scope'>
            <Form.Label
              style={{
                marginBottom: '0px',
                marginTop: '5px',
                fontSize: '11pt',
                fontWeight: 'bold'
              }}>Scope</Form.Label>
            <Form.Control
              data-testid='server-model-scope-text'
              type='text'
              value={scope}
              onChange={(e) => setScope(e.target.value)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            data-testid='server-model-cancel-button'
            onClick={() => {
              // Clear form fields
              setBaseUrl('');
              setAuthUrl('');
              setTokenUrl('');
              setClientId('');
              setClientSecret('');
              setScope('');

              // Clear validation errors
              setErrors({ baseUrl: '', authUrl: '', tokenUrl: '' });

              // Reset validation state
              setValidated(false);

              // Close the modal
              setModalShow(false)
            }
            } >
            Cancel
          </Button>
          <Button
            data-testid='server-model-submit-button'
            type='submit'>
            Save
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ServerModal;
