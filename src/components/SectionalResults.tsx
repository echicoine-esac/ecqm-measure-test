import React, { useEffect, useRef, useState } from 'react';
import { Constants } from '../constants/Constants';

// Props for Results panel
interface Props {
  results: string;
}

// Results component displays the status messages
const SectionalResults: React.FC<Props> = ({ results }) => {

  useEffect(() => {
    drawAttentionToResults();
  }, [results]);


  //scroll results into view when it changes:
  const resultsDivRef = useRef<HTMLDivElement | null>(null);
  const [attentionBorder, setAttentionBorder] = useState(false);
  const drawAttentionToResults = () => {
    if (resultsDivRef.current) {
      setAttentionBorder(true);
      setTimeout(() => {
        setAttentionBorder(false);
      }, 500);
    }
  };


  const errorAttentionFrame = '2px solid red';
  const normalStateAttentionFrame = '1px solid lightgrey'
  const borderStyle = attentionBorder && !results.startsWith(Constants.preFetchMessage) ? errorAttentionFrame : normalStateAttentionFrame;

  return (
    <div>
      {results && results.length > 0 && (

        <div ref={resultsDivRef} className='row mt-1'
          style={{
            background: '#F7F7F7', border: borderStyle,
            transition: 'border 1s', margin: '0px', borderRadius: '4px', padding: '6px'
          }}>

          <div className='col-md-12 order-md-1'>
            <div style={{ height: 'auto', width: 'auto', border: '0px' }}>

              <label
                data-testid="results-text"
                style={{
                  height: 'auto',
                  borderRadius: '4px',
                  fontSize: '13pt',
                  margin: '0px',
                  display: 'block',
                  whiteSpace: 'pre-wrap',
                  color: !results.startsWith(Constants.preFetchMessage) ? 'red' : 'black',
                }}>
                {results}
              </label>
            </div>
          </div>
        </div >
      )}
    </div >
  );
};

export default SectionalResults;