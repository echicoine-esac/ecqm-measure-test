import React, {useState} from 'react';
import {Button, Col, Form, Modal} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Constants} from "../constants/Constants";

// Props for ServerModal
interface props {
    modalShow: boolean;
    setModalShow: React.Dispatch<React.SetStateAction<boolean>>;
    createServer: (url: string) => void;
}

// ServerModal component collects the information for adding an endpoint
const ServerModal: React.FC<props> = ({modalShow, setModalShow, createServer}) => {
    const [baseUrl, setBaseUrl] = useState<string>('');

    const baseUrlHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBaseUrl(event.target.value);
    }
    const submitServer = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        createServer(baseUrl);
        setModalShow(false);
        setBaseUrl('');
    }

    return (
        <Modal size='lg' centered show={modalShow}>
            <Form onSubmit={submitServer}>
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
                        <Form.Label>Base URL</Form.Label>
                        <Form.Control type='text' value={baseUrl} placeholder='FHIR endpoint'
                                      onChange={baseUrlHandler} required/>
                        <Form.Control.Feedback type='invalid'>Please provide a valid URL</Form.Control.Feedback>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => setModalShow(false)}>Cancel</Button>
                    <Button type='submit'>Save</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ServerModal;