import React, { useRef } from 'react';
import { Constants } from '../constants/Constants';

// Props for Results panel
interface Props {
  results: string;
}

// Results component displays the status messages
const SectionalResults: React.FC<Props> = ({ results }) => {

  //we use this panel to inform the user an input error, but also if a fetch is occurring as well:
  const isError = !results.startsWith(Constants.preFetchMessage);

  //scroll results into view when it changes:
  const resultsDivRef = useRef<HTMLDivElement | null>(null);



  return (
    <div>
      {results && results.length > 0 && (
        <div
          ref={resultsDivRef}
          className='row mt-1'
          style={{
            background: isError ? '#ce5454' : '#F7F7F7',
            border: 'solid 1px lightgrey',
            margin: '0px',
            borderRadius: '4px',
            padding: '6px',
            maxWidth: '97.6%',
            display: 'inline-block',
            position: 'relative',
            top: '-8px',
            left: '15px',
            zIndex: '-1',
          }}
        >
          <div className='col-md-12 order-md-1'>
            <div
              style={{
                height: 'auto',
                width: 'auto',
                border: '0px',
                display: 'inline-block',
              }}
            >
              <h6
                data-testid="results-text"
                style={{
                  height: 'auto',
                  borderRadius: '4px',
                  fontSize: '13pt',
                  margin: '0px',
                  display: 'block',
                  whiteSpace: 'pre-wrap',
                  color: isError ? 'white' : 'black',
                }}
              >
                {results}
              </h6>
            </div>
          </div>
        </div>
      )}
    </div>


  );
};

export default SectionalResults;