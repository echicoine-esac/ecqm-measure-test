import React from 'react';
import {Button, Spinner} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// Props for ReceivingSystem
interface props {
  showReceiving: boolean;
  setShowReceiving: React.Dispatch<React.SetStateAction<boolean>>;
  serverUrls: Array<string>;
  setSelectedReceiving: React.Dispatch<React.SetStateAction<string>>;
  selectedReceiving: string;
  submitData: () => void;
  evaluateMeasure: () => void;
  loading: boolean;
}

// ReceivingSystem component displays the fields for selecting and using the receiving system
const ReceivingSystem: React.FC<props> = ({ showReceiving, setShowReceiving, serverUrls, setSelectedReceiving,
    selectedReceiving, submitData, evaluateMeasure, loading }) => {
    return (
      <div className='card'>
        <div className='card-header'>
          Receiving System
          {showReceiving ? (
            <Button data-testid='rec-sys-hide-section-button' className='btn btn-primary btn-lg float-right' 
            onClick={(e) => setShowReceiving(false)}>
              Hide
            </Button>
          ) : (
            <Button data-testid='rec-sys-show-section-button' className='btn btn-primary btn-lg float-right' 
            onClick={(e) => setShowReceiving(true)}>
              Show
            </Button>
          )}
        </div>
          {showReceiving ? (
            <div className='card-body'>
              <div className='row'>
                <div className='col-md-6 order-md-1'>
                  <label>Receiving System Server</label>
                  <select data-testid='rec-sys-server-dropdown' className='custom-select d-block w-100' id='server' value={selectedReceiving}
                    onChange={(e) => setSelectedReceiving(e.target.value)}>
                    <option value=''>Select a Server...</option>
                    {serverUrls.map((server, index) => (
                      <option key={index}>{server}</option>
                    ))}
                  </select>
                </div>
                <div className='col-md-6 order-md-2'>
                  <br/>
                  {loading ? (
                    <Button data-testid='rec-sys-submit-button-spinner' className='w-100 btn btn-primary btn-lg' id='getData' disabled={loading}>
                      <Spinner
                        as='span'
                        variant='light'
                        size='sm'
                        role='status'
                        aria-hidden='true'
                        animation='border'/>
                        Loading...
                    </Button>
                  ):(
                    <Button data-testid='rec-sys-submit-button' className='w-100 btn btn-primary btn-lg' id='getData' disabled={loading}
                      onClick={(e) => submitData()}>
                        Submit Data
                    </Button>
                  )}
                </div>
              </div>
              <div className='row'>
                <div className='col-md-6 order-md-2'>
                  <br/>
                  {loading ? (
                    <Button data-testid='rec-sys-evaluate-button-spinner' className='w-100 btn btn-primary btn-lg' id='getData' disabled={loading}>
                      <Spinner
                        as='span'
                        variant='light'
                        size='sm'
                        role='status'
                        aria-hidden='true'
                        animation='border'/>
                        Loading...
                    </Button>
                  ):(
                    <Button  data-testid='rec-sys-evaluate-button' className='w-100 btn btn-primary btn-lg' id='getData' disabled={loading}
                      onClick={(e) => evaluateMeasure()}>
                        Evaluate Measure
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div/>
          )}
      </div>
    );
};

export default ReceivingSystem;