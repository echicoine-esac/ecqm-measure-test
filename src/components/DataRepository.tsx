import React from "react";
import {Button, Spinner} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// Props for DataRepository
interface props {
  serverUrls: Array<string>;
  setSelectedServer: React.Dispatch<React.SetStateAction<string>>;
  measures: Array<string>;
  patients: Array<string>;
  fetchMeasures: (url: string) => void;
  setSelectedMeasure: React.Dispatch<React.SetStateAction<string>>;
  setSelectedPatient: React.Dispatch<React.SetStateAction<string>>;
  evaluateMeasure: () => void;
  loading: boolean;
}

// DataRepository component displays the test server, measure, patient, and button to evaluate
const DataRepository: React.FC<props> = ({ serverUrls, setSelectedServer, measures, patients, fetchMeasures,
    setSelectedMeasure, setSelectedPatient, evaluateMeasure, loading }) => {

    return (
      <div>
          <div className="row">
            <div className="col-md-6 order-md-1">
              <label>Test Server</label>
              <select data-testid="server-dropdown" className="custom-select d-block w-100" id="server" onChange={(e) => fetchMeasures(e.target.value)}>
                <option value="">Select a Test Server...</option>
                  {serverUrls.map((server, index) => (
                    <option key={index}>{server}</option>
                  ))}
              </select>
            </div>
            <div className="col-md-6 order-md-2">
              <label>Measure</label>
              <select data-testid="measure-dropdown" className="custom-select d-block w-100" id="measure" onChange={(e) => setSelectedMeasure(e.target.value)}>
                <option value="">Select a Measure...</option>
                  {measures.map((measure, index) => (
                    <option key={index}>{measure}</option>
                  ))}
              </select>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 order-md-1">
              <label>Patient (optional)</label>
              <select data-testid="patient-dropdown" className="custom-select d-block w-100" id="patient" onChange={(e) => setSelectedPatient(e.target.value)}>
                <option value="">Select a Patient...</option>
                  {patients.map((patient, index) => (
                    <option key={index}>{patient}</option>
                  ))}
              </select>
            </div>
            <div className="col-md-6 order-md-2">
              <br/>
              {loading ? (
                <Button data-testid="evaluate-button-spinner" className="w-100 btn btn-primary btn-lg" id="evaluate" disabled={loading}>
                  <Spinner
                    as="span"
                    variant="light"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    animation="border"/>
                  Loading...</Button>
              ):(
                <Button data-testid="evaluate-button" className="w-100 btn btn-primary btn-lg" id="evaluate" disabled={loading}
                    onClick={(e) => evaluateMeasure()}>
                  Evaluate Measure</Button>
              )}
            </div>
          </div>
      </div>
    );
};

export default DataRepository;