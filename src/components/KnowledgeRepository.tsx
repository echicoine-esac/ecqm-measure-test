import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { Button, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap';
import { Measure } from '../models/Measure';
import { Server } from '../models/Server';
import { StringUtils } from '../utils/StringUtils';
import { Constants } from '../constants/Constants';

// Props for KnowledgeRepository
interface props {
  showKnowledgeRepo: boolean;
  setShowKnowledgeRepo: React.Dispatch<React.SetStateAction<boolean>>;
  servers: any;
  fetchMeasures: (knowledgeRepo: Server) => void;
  selectedKnowledgeRepo: Server | undefined;
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
                      <select data-testid='knowledge-repo-server-dropdown' className='custom-select d-block w-100' id='server' value={selectedKnowledgeRepo?.baseUrl}
                              onChange={(e) => fetchMeasures(servers[e.target.selectedIndex - 1]!)}>
                          <option value={'Select a Server...'}>
                          Select a Server...</option>
                          {servers.map((server: any, index: React.Key | null | undefined) => (
                              <option key={index}
                              title={
                                StringUtils.generateTitleString(server, Constants.ignoredServerToolTipProperties)
                              }
                              >{server!.baseUrl}</option>
                          ))}
                      </select>
                    </div>
                    <div className='col-md-1 order-md-2'>
                        <OverlayTrigger placement={'top'} overlay={
                            <Tooltip>Add an Endpoint</Tooltip>
                            }>
                          <Button data-testid='knowledge-repo-server-add-button' variant='outline-primary' onClick={() => setModalShow(true)}>+</Button>
                        </OverlayTrigger>
                    </div>
                    <div className='col-md-6 order-md-3'>
                      <select data-testid='knowledge-repo-measure-dropdown' className='custom-select d-block w-100' id='measure' value={selectedMeasure}
                        onChange={(e) => setSelectedMeasure(e.target.value)}>
                      <option value=''>Select a Measure...</option>
                        {measures.map((measure, index) => (
                          <option key={index}
                          title={
                            StringUtils.generateTitleString(measure, [])
                          }
                          >{measure!.name}</option>
                        ))}
                      </select>
                    </div>
                </div>
              <div className='row'>
                <div className='col-md-5 order-md-2'>
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