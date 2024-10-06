import React from 'react';
import { Form } from 'react-bootstrap';
import { Constants } from '../constants/Constants';

// Props for ReportingPeriod
interface Props {
  startDate: string;
  endDate: string;
  setStartDate: (text: string) => void;
  setEndDate: (text: string) => void;
}

// ReportingPeriod component displays the reporting period card and fields
const ReportingPeriod: React.FC<Props> = ({ startDate, endDate, setStartDate, setEndDate }) => {
  return (
    <div className='card'>
      <div className='card-header' style={{height: '63.71px'}}>
        <div className='row' style={{ height: '47px', display: 'flex', flexWrap: 'nowrap' }}>
          <div style={{
            width: 'auto',
            display: 'flex',
            justifyContent: 'left',  // Horizontally center
            alignItems: 'center',      // Vertically center
          }} className='col-md-3 order-md-1'>
            <h6 style={{ fontSize: '14pt', textAlign: 'center' }}>
              {Constants.title_reportingPeriod}
            </h6>
          </div>
        </div>
      </div>
      <div className='card-body' style={{ transition: 'all .1s' }}>
        <div className='row'>
          <div className='col-md-6 order-md-1'>
            <label>Start Date</label>
            <Form.Control data-testid='start-date-control' type='date' name='startDate'
              value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className='col-md-6 order-md-2'>
            <label>End Date</label>
            <Form.Control data-testid='end-date-control' type='date' name='endDate'
              value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportingPeriod;