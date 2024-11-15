import React from 'react';
import { Constants } from '../constants/Constants';

// Props for Results panel
interface Props {
  results: string;
}

 /**
  * For displaying errors for each section, as well as displaying the "fetching data from" message
  * @param param0 
  * @returns 
  */
const SectionalResults: React.FC<Props> = ({ results }) => {
 
  //we use this panel to inform the user an input error, but also if a fetch is occurring as well:
  const isError = !results.startsWith(Constants.preFetchMessage);

  /**
   * Takes in our fetch string and parses it out for visual clarity
   * @param urlString 
   * @returns 
   */
  const parseAndStyleResults = (urlString: string) => {
    if (!urlString.startsWith(Constants.preFetchMessage)) return urlString;

    urlString = urlString.replace(Constants.preFetchMessage, '');
    const [baseUrl, queryString] = urlString.split('?');
    const params: Record<string, string> = {};

    if (queryString) {
      queryString.split('&').forEach(part => {
        const [key, value] = part.split('=');
        if (key) {
          params[decodeURIComponent(key)] = value ? decodeURIComponent(value) : '';
        }
      });
    }

    return stylizeUrlAndParams({ url: baseUrl, params });
  };

  /**
   * Break down the string into html (must be done inside this FC)
   * @param param0 
   * @returns 
   */
  const stylizeUrlAndParams = ({ url, params }: { url: string; params: Record<string, string> }) => {
    const elements = [
      <span key='prefetch'>{Constants.preFetchMessage}</span>,
      <span key='url' style={{ color: 'blue' }}>{'\t' + url}</span>
    ];

    const paramsEntries = Object.entries(params);
    if (paramsEntries.length > 0) {
      elements.push(<span key='params-separator'>?</span>);
      paramsEntries.forEach(([key, value]) => {
        const paramKey = <span key={`param-${key}`} style={{ color: 'black', fontWeight: 'bold' }}><br />{'\t' + key}</span>;
        const equals = <span key={`equals-${key}`}>=</span>;
        const paramValue = <span key={`value-${key}`} style={{ color: 'blue' }}>{value}</span>;

        elements.push(paramKey, equals, paramValue);
        elements.push(<span key={`and-${key}`}>&amp;</span>);
      });
      elements.pop();
    }

    return <>{elements}</>;
  };

  return (
    <div>
      {results && results.length > 0 && (
        <div
          className='card row'
          style={{
            background: isError ? 'var(--error)' : 'var(--success)',
            border: 'solid 1px lightgrey',
            margin: '0px',
            padding: '6px',
            width: isError ? 'auto' : '96.9%',
            maxWidth: '96.9%',
            display: 'inline-block',
            position: 'relative',
            top: '-30px',
            paddingTop: '13px',
            marginBottom: '-15px',
            left: '15px',
            zIndex: '-1',
          }}>
          <div className='col-md-12 order-md-1'>
            <div
              style={{
                height: 'auto',
                width: 'auto',
                border: '0px',
                display: 'inline-block',
              }}>
              <h6
                data-testid='results-text'
                style={{
                  height: 'auto',
                  borderRadius: '4px',
                  margin: '0px',
                  display: 'block',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: isError ? 'white' : 'black',
                  fontWeight: isError ? undefined : 'normal',
                  lineHeight: isError ? undefined : '1.3',
                  fontSize: '12pt'
                }}>
                {parseAndStyleResults(results)}
              </h6>
            </div>
          </div>
        </div>
      )}
    </div>


  );
};

export default SectionalResults;