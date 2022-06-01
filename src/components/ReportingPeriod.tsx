import React from "react";
import {Form} from 'react-bootstrap';

// Props for ReportingPeriod
interface props {
  startDate: string;
  endDate: string;
  setStartDate: React.Dispatch<React.SetStateAction<string>>;
  setEndDate: React.Dispatch<React.SetStateAction<string>>;
}

// ReportingPeriod component displays the reporting period card and fields
const ReportingPeriod: React.FC<props> = ({ startDate, endDate, setStartDate, setEndDate }) => {
    return (
      <div className="card">
        <div className="card-header">
          Reporting Period
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 order-md-1">
              <label>Start Date</label>
              <Form.Control type="date" name="startDate"
                value={startDate} onChange={(e) => setStartDate(e.target.value)}/>
            </div>
            <div className="col-md-6 order-md-2">
              <label>End Date</label>
                <Form.Control type="date" name="endDate"
                  value={endDate} onChange={(e) => setEndDate(e.target.value)}/>
            </div>
          </div>
        </div>
      </div>
    );
};

export default ReportingPeriod;