import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { Prism } from 'react-syntax-highlighter';
import { atomDark, coyWithoutShadows } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Props for Results panel
interface props {
  results: string;
  selectedMeasure?: string;
}

type FHIRResource = {
  resourceType?: string;
  id?: string;
  [key: string]: any;
};

// Results component displays the status messages
const Results: React.FC<props> = ({ results, selectedMeasure }) => {
  // State to handle the dark theme toggle
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const defaultFileName = selectedMeasure ? 
  selectedMeasure + '-export.json' : 
  'eCQM-Testing-Tool-export.json';

  // Used for generating the download link. Creates an ObjectURL using a blob of the json string, 
  // removes any previous entries once things change.
  const [href, setHref] = useState<string | null>(null);
  useEffect(() => {
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

  return (
    <div className='row mt-4' >
      <div className='col-md-12 order-md-1'>
        Results:
        {resultsTextIsJson ? (
          <Prism
            wrapLines={true}
            wrapLongLines={true}
            language="json"
            style={isDarkTheme ? atomDark : coyWithoutShadows}
            customStyle={{
              height: '600px',
              borderRadius: '4px',
              fontSize: '11pt',
              //line up the text between the two themes:
              paddingLeft: isDarkTheme ? '10px' : '0px',
              paddingTop: isDarkTheme ? '7px' : '6px',
              margin: '0px'
            }}>
            {results}
          </Prism>
        ) : (
          <Form.Control
            data-testid='results-text'
            as='textarea'
            name='results'
            value={results}
            readOnly
            style={{
              backgroundColor: '#e9ecef',
              height: '600px'
            }}
          />
        )}
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
  );
};

export default Results;