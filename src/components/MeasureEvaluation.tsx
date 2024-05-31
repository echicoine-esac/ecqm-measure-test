import React from 'react';
import {Button, OverlayTrigger, Spinner, Tooltip} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Server} from '../models/Server';

// Props for MeasureEvaluation
interface props {
  showMeasureEvaluation: boolean;
  setShowMeasureEvaluation: React.Dispatch<React.SetStateAction<boolean>>;
  servers: Array<Server | undefined>;
  setSelectedMeasureEvaluation: React.Dispatch<React.SetStateAction<Server>>;
  selectedMeasureEvaluation: Server | undefined;
  submitData: () => void;
  evaluateMeasure: () => void;
  loading: boolean;
  setModalShow: React.Dispatch<React.SetStateAction<boolean>>;
}

// MeasureEvaluation component displays the fields for selecting and using the measure evaluation system
const MeasureEvaluation: React.FC<props> = ({ showMeasureEvaluation, setShowMeasureEvaluation, servers, setSelectedMeasureEvaluation, selectedMeasureEvaluation, submitData, evaluateMeasure, loading, setModalShow }) => {
    return (
      <div className='card'>
        <div className='card-header'>
          Measure Evaluation Service
          {showMeasureEvaluation ? (
            <Button data-testid='mea-eva-hide-section-button' className='btn btn-primary btn-lg float-right' 
            onClick={(e) => setShowMeasureEvaluation(false)}>
              Hide
            </Button>
          ) : (
            <Button data-testid='mea-eva-show-section-button' className='btn btn-primary btn-lg float-right' 
            onClick={(e) => setShowMeasureEvaluation(true)}>
              Show
            </Button>
          )}
        </div>
          {showMeasureEvaluation ? (
            <div className='card-body'>
              <div className='row'>
                <div className='col-md-6 order-md-1'>
                  <label>Measure Evaluation Server</label>
                </div>
              </div>
              <div className='row'>
                <div className='col-md-5 order-md-1'>
                  <select data-testid='mea-eva-server-dropdown' className='custom-select d-block w-100' id='server' value={selectedMeasureEvaluation!.baseUrl}
                    onChange={(e) => setSelectedMeasureEvaluation(servers[e.target.selectedIndex - 1]!)}>
                    <option value=''>Select a Server...</option>
                    {servers.map((server, index) => (
                      <option key={index}>{server!.baseUrl}</option>
                    ))}
                  </select>
                </div>
                  <div className='col-md-1 order-md-2'>
                      <OverlayTrigger placement={'top'} overlay={
                          <Tooltip>Add an Endpoint</Tooltip>
                      }>
                          <Button variant='outline-primary' onClick={() => setModalShow(true)}>+</Button>
                      </OverlayTrigger>
                  </div>
              </div>
              <div className='row'>
                <div className='col-md-5 order-md-2'>
                  <br/>
                  {loading ? (
                    <Button data-testid='mea-eva-submit-button-spinner' className='w-100 btn btn-primary btn-lg' id='getData' disabled={loading}>
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
                    <Button data-testid='mea-eva-submit-button' className='w-100 btn btn-primary btn-lg' id='getData' disabled={loading}
                      onClick={(e) => submitData()}>
                        Submit Data
                    </Button>
                  )}
                </div>
                <div className='col-md-5 order-md-2'>
                  <br/>
                  {loading ? (
                    <Button data-testid='mea-eva-evaluate-button-spinner' className='w-100 btn btn-primary btn-lg' id='getData' disabled={loading}>
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
                    <Button  data-testid='mea-eva-evaluate-button' className='w-100 btn btn-primary btn-lg' id='getData' disabled={loading}
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

export default MeasureEvaluation;