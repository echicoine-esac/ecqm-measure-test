import React from "react";
import {Button, Spinner} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// Props for KnowledgeRepository
interface props {
  showKnowledgeRepo: boolean;
  setShowKnowledgeRepo: React.Dispatch<React.SetStateAction<boolean>>;
  serverUrls: Array<string>;
  fetchMeasures: (url: string) => void;
  measures: Array<string>;
  setSelectedMeasure: React.Dispatch<React.SetStateAction<string>>;
  getDataRequirements: () => void;
  loading: boolean;
}

// KnowledgeRepository component displays the fields for selecting and using the Knowledge Repository
const KnowledgeRepository: React.FC<props> = ({ showKnowledgeRepo, setShowKnowledgeRepo, serverUrls, fetchMeasures,
    measures, setSelectedMeasure, getDataRequirements, loading }) => {
    return (
      <div className="card col-md-12">
        <div className="card-header">
          Knowledge Repository
          {showKnowledgeRepo ? (
            <Button className="btn btn-primary btn-lg float-right" onClick={(e) => setShowKnowledgeRepo(false)}>
              Hide
            </Button>
          ) : (
            <Button className="btn btn-primary btn-lg float-right" onClick={(e) => setShowKnowledgeRepo(true)}>
              Show
            </Button>
          )}
        </div>
          {showKnowledgeRepo ? (
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 order-md-1">
                  <label>Knowledge Repository Server</label>
                  <select className="custom-select d-block w-100" id="server"
                    onChange={(e) => fetchMeasures(e.target.value)}>
                    <option value="">Select a Server...</option>
                    {serverUrls.map((server) => (
                      <option>{server}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 order-md-2">
                  <label>Measure</label>
                  <select className="custom-select d-block w-100" id="measure"
                    onChange={(e) => setSelectedMeasure(e.target.value)}>
                  <option value="">Select a Measure...</option>
                    {measures.map((measure) => (
                      <option>{measure}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 order-md-2">
                  <br/>
                  {loading ? (
                    <Button className="w-100 btn btn-primary btn-lg" id="getData" disabled={loading}>
                      <Spinner
                        as="span"
                        variant="light"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        animation="border"/>
                        Loading...
                    </Button>
                  ):(
                    <Button className="w-100 btn btn-primary btn-lg" id="getData" disabled={loading}
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