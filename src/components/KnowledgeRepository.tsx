import React, {useState} from 'react';
import { Button, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Measure } from '../models/Measure';
import { Server } from "../models/Server";
import ServerModal from "./ServerModal";

// Props for KnowledgeRepository
interface props {
  showKnowledgeRepo: boolean;
  setShowKnowledgeRepo: React.Dispatch<React.SetStateAction<boolean>>;
  servers: Array<Server | undefined>;
  fetchMeasures: (url: string) => void;
  selectedKnowledgeRepo: string;
  measures: Array<Measure | undefined>;
  setSelectedMeasure: React.Dispatch<React.SetStateAction<string>>;
  selectedMeasure: string;
  getDataRequirements: () => void;
  loading: boolean;
  setModalShow: React.Dispatch<React.SetStateAction<boolean>>;
}

// KnowledgeRepository component displays the fields for selecting and using the Knowledge Repository
const KnowledgeRepository: React.FC<props> = ({ showKnowledgeRepo, setShowKnowledgeRepo, servers,
    fetchMeasures, selectedKnowledgeRepo, measures, setSelectedMeasure,
    selectedMeasure, getDataRequirements, loading, setModalShow }) => {

    return (
      <div className='card'>
        <div className='card-header'>
          <div className='row'>
            <div className='col-md-3 order-md-1'>Knowledge Repository</div>
            {showKnowledgeRepo ? (
              <div className='col-md-8 order-md-2 text-muted'/>
            ) : (
              <div data-testid='selected-measure-div' className='col-md-8 order-md-2 text-muted'>
                Selected Measure: {selectedMeasure}
              </div>
            )}
            <div className='col-md-1 order-md-3'>
              {showKnowledgeRepo ? (
                <Button data-testid='knowledge-repo-hide-section-button' className='btn btn-primary btn-lg float-right' onClick={(e) => setShowKnowledgeRepo(false)}>
                  Hide
                </Button>
              ) : (
                <Button data-testid='knowledge-repo-show-section-button' className='btn btn-primary btn-lg float-right' onClick={(e) => setShowKnowledgeRepo(true)}>
                  Show
                </Button>
              )}
            </div>
          </div>
        </div>
          {showKnowledgeRepo ? (
            <div className='card-body'>
                 <div className='row'>
                     <div className='col-md-6 order-md-1'>
                            <label>Knowledge Repository Server</label>
                       </div>
                      <div className='col-md-6 order-md-1'>
                          <label>Measure</label>
                      </div>
                </div>
                <div className='row'>
                    <div className='col-md-5 order-md-1'>
                      <select data-testid='knowledge-repo-server-dropdown' className='custom-select d-block w-100' id='server' value={selectedKnowledgeRepo}
                              onChange={(e) => fetchMeasures(e.target.value)}>
                          <option value=''>Select a Server...</option>
                          {servers.map((server, index) => (
                              <option key={index}>{server!.baseUrl}</option>
                          ))}
                      </select>
                    </div>
                    <div className='col-md-1 order-md-2'>
                          <Button variant='outline-primary' onClick={() => setModalShow(true)}>+</Button>
                    </div>
                    <div className='col-md-6 order-md-3'>
                      <select data-testid='knowledge-repo-measure-dropdown' className='custom-select d-block w-100' id='measure' value={selectedMeasure}
                        onChange={(e) => setSelectedMeasure(e.target.value)}>
                      <option value=''>Select a Measure...</option>
                        {measures.map((measure, index) => (
                          <option key={index}>{measure!.name}</option>
                        ))}
                      </select>
                    </div>
                </div>
              <div className='row'>
                <div className='col-md-6 order-md-2'>
                  <br/>
                  {loading ? (
                    <Button data-testid='get-data-requirements-button-spinner' className='w-100 btn btn-primary btn-lg' id='getData' disabled={loading}>
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
                    <Button data-testid='get-data-requirements-button' className='w-100 btn btn-primary btn-lg' id='getData' disabled={loading}
                      onClick={(e) => getDataRequirements()}>
                        Get Data Requirements
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

export default KnowledgeRepository;