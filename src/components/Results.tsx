import React, { useEffect, useRef, useState } from 'react';
import Light from 'react-syntax-highlighter';
//NOTE: Careful with which style gets imported (can break Jest). Follow similar import structure:
import lightfair from 'react-syntax-highlighter/dist/cjs/styles/hljs/lightfair';
import nnfxDark from 'react-syntax-highlighter/dist/cjs/styles/hljs/nnfx-dark';
import { Outcome, OutcomeTracker } from '../models/OutcomeTracker';
import { PopulationScoring } from '../models/PopulationScoring';
import Populations from './Populations';


// Props for Results panel
interface Props {
  // results: string;
  outcome: OutcomeTracker | undefined;
  selectedMeasure?: string;
  showPopulations?: boolean | undefined;
  populationScoring?: PopulationScoring[] | undefined;
  measureScoringType?: string | undefined;

}

// Results component displays the status messages
const Results: React.FC<Props> = ({ selectedMeasure, showPopulations, populationScoring, measureScoringType, outcome }) => {
  const results = outcome?.jsonString ? outcome?.jsonString : '';
  
  // State to handle the dark theme toggle
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const defaultFileName = selectedMeasure ?
    selectedMeasure + '-export.json' :
    'eCQM-Testing-Tool-export.json';

  // Used for generating the download link. Creates an ObjectURL using a blob of the json string, 
  // removes any previous entries once things change.
  const [href, setHref] = useState<string | null>(null);
  useEffect(() => {

    scrollToResultsDiv();

    let objectUrl: string | null = null;

    if (results) {
      // Create a Blob and generate an object URL for the results
      const blob = new Blob([results], { type: "application/json" });
      objectUrl = URL.createObjectURL(blob);
      setHref(objectUrl);
    }

    // Cleanup: Revoke the previous URL when results change or component unmounts
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [results]);

  //establish a filename for the json download link:
  const buildHrefFileName = (): string => {
    try {
      const jsonData = JSON.parse(results);
      resultsTextIsJson = true;
      if (jsonData?.resourceType) {
        return selectedMeasure ? jsonData?.resourceType + '-' + selectedMeasure + '.json' : jsonData?.resourceType + '-eCQM-Testing-Tool-export.json';
      }
    } catch (error) {
      resultsTextIsJson = false;
    }
    return defaultFileName;
  };

  //simple boolean based on parse fail
  let resultsTextIsJson = false;

  const hrefFileName = buildHrefFileName();

  const resultsDivRef = useRef<HTMLDivElement | null>(null);
  const scrollToResultsDiv = () => {
    if (resultsDivRef.current) {
      resultsDivRef?.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getOutcomeFontColor = () => {
    if (!outcome) return 'black';
    if (outcome.outcomeType === Outcome.FAIL) {
      return 'red';
    } else if (outcome.outcomeType === Outcome.SUCCESS) {
      return 'green';
    } else if (outcome.outcomeType === Outcome.INFO) {
      return 'black'
    } else {
      return 'black';
    }
  }

  

  return (
    <div>

      {results && results.length > 0 && (

        <div ref={resultsDivRef} className='row mt-4'
          style={{
            background: '#F7F7F7', border: '1px solid lightgrey',
            transition: 'border 2s', margin: '2px', borderRadius: '4px', paddingTop: resultsTextIsJson && !outcome?.outcomeMessage.length ? '15px' : '0px'
          }}>

          {outcome && outcome.outcomeMessage.length > 0 && (

            <div ref={resultsDivRef} className='row mt-1'
              style={{
                background: '#F7F7F7', border: 'none',
                transition: 'border 1s', margin: '0px', borderRadius: '4px', padding: '0px'
              }}>

              <div className='col-md-12 order-md-1'>
                <div style={{ height: 'auto', width: 'auto', border: '0px' }}>

                  <h6
                    data-testid="outcome-results-text"
                    style={{
                      height: 'auto',
                      borderRadius: '4px',
                      // fontSize: '14pt',
                      marginTop: '10px',
                      marginBottom: '5px',
                      display: 'block',
                      whiteSpace: 'pre-wrap',
                      color: getOutcomeFontColor()
                    }}>
                    {outcome.outcomeMessage}
                  </h6>
                </div>
              </div>
            </div >
          )}

          <Populations populationScoring={populationScoring} showPopulations={showPopulations} measureScoringType={measureScoringType} />

          <div className='col-md-12 order-md-1'>
            <div style={{ height: 'auto', width: 'auto', border: resultsTextIsJson ? '1px solid lightgrey' : '0px' }}>

              <Light
                data-testid='results-text'
                wrapLines={true}
                wrapLongLines={true}
                language="json"
                useInlineStyles={resultsTextIsJson}
                style={isDarkTheme ? nnfxDark : lightfair}
                customStyle={{
                  height: resultsTextIsJson ? '600px' : 'auto',
                  borderRadius: '4px',
                  fontFamily: '"Courier New", Courier, monospace',
                  fontSize: '11pt',
                  margin: '0px'
                }}>
                {results}
              </Light>
            </div>
            {resultsTextIsJson && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%' }}>
                <label style={{ marginRight: 'auto', display: 'flex', alignItems: 'center' }}>
                  <input
                    type='checkbox'
                    checked={isDarkTheme}
                    onChange={() => setIsDarkTheme(!isDarkTheme)}
                    style={{ marginRight: '8px' }}></input>
                  Dark theme
                </label>

                <a href={href ?? '#'} download={hrefFileName}>
                  Download {hrefFileName}
                </a>

              </div>
            )}

          </div>
        </div >
      )}
    </div >
  );
};

export default Results;