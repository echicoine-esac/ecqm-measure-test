import React from "react";
import {Button, Spinner} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// Props for DataRepository
interface props {
  showDataRepo: boolean;
  setShowDataRepo: React.Dispatch<React.SetStateAction<boolean>>;
  serverUrls: Array<string>;
  setSelectedDataRepo: React.Dispatch<React.SetStateAction<string>>;
  selectedDataRepo: string;
  patients: Array<string>;
  fetchPatients: (url: string) => void;
  setSelectedPatient: React.Dispatch<React.SetStateAction<string>>;
  selectedPatient: string;
  collectData: () => void;
  loading: boolean;
}

// DataRepository component displays the test server, patient, and button to collect data
const DataRepository: React.FC<props> = ({ showDataRepo, setShowDataRepo, serverUrls, setSelectedDataRepo,
    selectedDataRepo, patients, fetchPatients, setSelectedPatient, selectedPatient, collectData, loading }) => {

    return (
      <div className="card">
        <div className="card-header">
          <div className="row">
            <div className="col-md-3 order-md-1">Data Repository</div>
            {showDataRepo ? (
              <div className="col-md-8 order-md-2 text-muted"/>
            ) : (
              <div className="col-md-8 order-md-2 text-muted">
                Selected Patient: {selectedPatient}
              </div>
            )}
            <div className="col-md-1 order-md-3">{showDataRepo ? (
                <Button data-testid="data-repo-hide-section-button" className="btn btn-primary btn-lg float-right" 
                onClick={(e) => setShowDataRepo(false)}>
                  Hide
                </Button>
              ) : (
                <Button data-testid="data-repo-show-section-button" className="btn btn-primary btn-lg float-right" 
                onClick={(e) => setShowDataRepo(true)}>
                  Show
                </Button>
              )}
            </div>
          </div>
        </div>
        {showDataRepo ? (
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 order-md-1">
              <label>Data Repository Server</label>
              <select data-testid="data-repo-server-dropdown" className="custom-select d-block w-100" id="server" value={selectedDataRepo}
                onChange={(e) => fetchPatients(e.target.value)}>
                <option value="">Select a Server...</option>
                  {serverUrls.map((server, index) => (
                    <option key={index}>{server}</option>
                  ))}
              </select>
            </div>
            <div className="col-md-6 order-md-2">
              <label>Patient (optional)</label>
              <select data-testid="data-repo-patient-dropdown" className="custom-select d-block w-100" id="patient" value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}>
                <option value="">Select a Patient...</option>
                  {patients.map((patient, index) => (
                    <option key={index}>{patient}</option>
                  ))}
              </select>
            </div>
            <div className="col-md-6 order-md-2">
              <br/>
              {loading ? (
                <Button data-testid="data-repo-evaluate-button-spinner" className="w-100 btn btn-primary btn-lg" id="evaluate" disabled={loading}>
                  <Spinner
                    as="span"
                    variant="light"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    animation="border"/>
                  Loading...</Button>
              ):(
                <Button data-testid="data-repo-evaluate-button" className="w-100 btn btn-primary btn-lg" id="evaluate" disabled={loading}
                    onClick={(e) => collectData()}>
                  Collect Data</Button>
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

export default DataRepository;