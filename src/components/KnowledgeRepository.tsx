import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { Section } from '../enum/Section.enum';
import { Measure } from '../models/Measure';
import { Server } from '../models/Server';
import SectionalTitleBar from './SectionalTitleBar';
import ServerDropdown from './ServerDropdown';

// Props for KnowledgeRepository
interface Props {
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
const KnowledgeRepository: React.FC<Props> = ({ showKnowledgeRepo, setShowKnowledgeRepo, servers,
  fetchMeasures, selectedKnowledgeRepo, measures, setSelectedMeasure,
  selectedMeasure, getDataRequirements, loading, setModalShow }) => {

  return (
    <div className='card'>
      <div className='card-header'>

        <SectionalTitleBar
          section={Section.KNOWLEDGE_REPO}
          setShowSection={setShowKnowledgeRepo}
          showSection={showKnowledgeRepo}
          selectedSubjectTitling='Selected Measure'
          selectedSubject={selectedMeasure} />

      </div>
      {showKnowledgeRepo ? (
        <div className='card-body'>

          <div className='row'>

            <ServerDropdown
              section={Section.KNOWLEDGE_REPO}
              loading={loading}
              servers={servers}
              callFunction={fetchMeasures}
              baseUrlValue={selectedKnowledgeRepo?.baseUrl}
              setModalShow={setModalShow}
            />


            <div className='col-md-6 order-md-2'>

              <label>Measure</label>

              <select disabled={loading} data-testid='knowledge-repo-measure-dropdown' className='custom-select d-block w-100' id='measure' value={selectedMeasure}
                onChange={(e) => setSelectedMeasure(e.target.value)}>
                <option value=''>Select a Measure...</option>
                {measures.map((measure, index) => (
                  <option key={index}>{measure!.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className='row'>
            <div className='col-md-6 order-md-3'>
              <br />
              {loading ? (
                <Button data-testid='get-data-requirements-button-spinner' className='w-100 btn btn-primary btn-lg' id='getData' disabled={loading}>
                  <Spinner
                    as='span'
                    variant='light'
                    size='sm'
                    role='status'
                    aria-hidden='true'
                    animation='border' />
                  Loading...
                </Button>
              ) : (
                <Button data-testid='get-data-requirements-button' className='w-100 btn btn-primary btn-lg' id='getData' disabled={loading}
                  onClick={(e) => getDataRequirements()}>
                  Get Data Requirements
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div />
      )}
    </div>
  );
};

export default KnowledgeRepository;