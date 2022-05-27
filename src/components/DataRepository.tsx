import React from "react";
import {Button, Spinner} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// Props for DataRepository
interface props {
  showDataRepo: boolean;
  setShowDataRepo: React.Dispatch<React.SetStateAction<boolean>>;
  serverUrls: Array<string>;
  setSelectedDataRepo: React.Dispatch<React.SetStateAction<string>>;
  patients: Array<string>;
  fetchPatients: (url: string) => void;
  setSelectedPatient: React.Dispatch<React.SetStateAction<string>>;
  collectData: () => void;
  loading: boolean;
}

// DataRepository component displays the test server, patient, and button to collect data
const DataRepository: React.FC<props> = ({ showDataRepo, setShowDataRepo, serverUrls, setSelectedDataRepo, patients,
    fetchPatients, setSelectedPatient, collectData, loading }) => {

    return (
      <div className="card col-md-12">
        <div className="card-header">
          Data Repository
          {showDataRepo ? (
            <Button className="btn btn-primary btn-lg float-right" onClick={(e) => setShowDataRepo(false)}>
              Hide
            </Button>
          ) : (
            <Button className="btn btn-primary btn-lg float-right" onClick={(e) => setShowDataRepo(true)}>
              Show
            </Button>
          )}
        </div>
        {showDataRepo ? (
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 order-md-1">
              <label>Data Repository Server</label>
              <select className="custom-select d-block w-100" id="server" onChange={(e) => fetchPatients(e.target.value)}>
                <option value="">Select a Server...</option>
                  {serverUrls.map((server) => (
                    <option>{server}</option>
                  ))}
              </select>
            </div>
            <div className="col-md-6 order-md-2">
              <label>Patient (optional)</label>
              <select className="custom-select d-block w-100" id="patient" onChange={(e) => setSelectedPatient(e.target.value)}>
                <option value="">Select a Patient...</option>
                  {patients.map((patient) => (
                    <option>{patient}</option>
                  ))}
              </select>
            </div>
            <div className="col-md-6 order-md-2">
              <br/>
              {loading ? (
                <Button className="w-100 btn btn-primary btn-lg" id="evaluate" disabled={loading}>
                  <Spinner
                    as="span"
                    variant="light"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    animation="border"/>
                  Loading...</Button>
              ):(
                <Button className="w-100 btn btn-primary btn-lg" id="evaluate" disabled={loading}
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