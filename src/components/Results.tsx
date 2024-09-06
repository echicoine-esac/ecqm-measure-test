import React from 'react';
import { Form } from 'react-bootstrap';

// Props for Results panel
interface props {
  results: string;
}

// Results component displays the status messages
const Results: React.FC<props> = ({ results }) => {
  return (
    results.length > 0 ? (
      <div className='row'>
        <div className='col-md-12 order-md-1'>
          <label>Results</label>
          <Form.Control data-testid='results-text' as='textarea' name='results' rows={20} value={results} readOnly />
        </div>
      </div>
    ) : <div />

  );
};

export default Results;