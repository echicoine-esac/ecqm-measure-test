import React from 'react';
import { Form } from 'react-bootstrap';
import { Section } from '../enum/Section.enum';
import SectionalTitleBar from './SectionalTitleBar';

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
      <div className='card-header'>
        <SectionalTitleBar showSection={true} section={Section.REPORTING_PERIOD} />
      </div>
      <div className='card-body'>
        <div className='row'>
          <div className='col-md-6 order-md-1'>
            <label htmlFor='start-date'>Start Date</label>
            <Form.Control
              id='start-date'
              data-testid='start-date-control'
              type='date' name='startDate'
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ minWidth: '95%', alignContent: 'center' }}
              aria-label='Start date for the reporting period.'
            />
          </div>
          <div className='col-md-6 order-md-2'>
            <label htmlFor='end-date'>End Date</label>
            <Form.Control
              id='end-date'
              data-testid='end-date-control'
              type='date' name='endDate'
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ minWidth: '95%', alignContent: 'center' }}
              aria-label='End date for the reporting period.'
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportingPeriod;