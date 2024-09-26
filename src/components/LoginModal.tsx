import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { Button, Form, Modal } from 'react-bootstrap';

// Props for LoginModal
interface Props {
    modalShow: boolean;
    setModalShow: React.Dispatch<React.SetStateAction<boolean>>;
    username: string;
    setUsername: React.Dispatch<React.SetStateAction<string>>;
    password: string;
    setPassword: React.Dispatch<React.SetStateAction<string>>;
}

// LoginModal component collects the information for logging into an OAuth system
const LoginModal: React.FC<Props> = ({modalShow, setModalShow, username, setUsername, password,
                                         setPassword}) => {

    const usernameHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(event.target.value);
    }

    const passwordHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    }

    const submitLogin = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setModalShow(false);
        setUsername('');
        setPassword('');
    }

    return (
        <Modal centered show={modalShow}>
            <Form onSubmit={submitLogin}>
                <Modal.Header><h2>Login</h2></Modal.Header>
                <Modal.Body>
                    <div className='row'>
                        This server uses OAuth authentication to access. Please login with a valid username and password.
                        <hr/>
                    </div>
                    <Form.Group controlId='form.username'>
                        <Form.Label>Username</Form.Label>
                        <Form.Control type='text' value={username} placeholder='user1'
                                      onChange={usernameHandler} required/>
                    </Form.Group>
                    <Form.Group controlId='form.password'>
                        <Form.Label>Password</Form.Label>
                        <Form.Control type='password' value={password} placeholder='P@ssPhr@s3'
                                      onChange={passwordHandler} required/>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => setModalShow(false)}>Cancel</Button>
                    <Button type='submit'>Login</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default LoginModal;