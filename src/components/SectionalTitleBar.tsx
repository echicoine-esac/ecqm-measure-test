import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { Constants } from '../constants/Constants';
import { Section } from '../enum/Section.enum';

interface Props {
  section: Section;
  showSection: boolean;
  setShowSection?: (visible: boolean) => void;

  selectedSubject?: string;
  selectedSubjectTitling?: string;
}

const SectionalTitleBar: React.FC<Props> = ({ section, showSection, selectedSubject, setShowSection, selectedSubjectTitling }) => {

  const title = Constants.sectionTitles.get(section);
  const dataTestID = Constants.sectionIDs.get(section);

  const [isTooNarrow, setIsTooNarrow] = useState(window.innerWidth < 445);

  // Update isMobile state on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsTooNarrow(window.innerWidth < 445);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup the event listener on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className='d-flex align-items-center justify-content-between'>
      <div className='flex-grow-1 d-flex flex-column flex-md-row align-items-md-center'>
        <div>
          <h5
            tabIndex={0}
            aria-label={title + ' panel. '}
            style={{
              fontSize: isTooNarrow ? '12pt' : '14pt',
              marginBottom: isTooNarrow ? '0.25rem' : 0,
            }}
          >
            {title}
          </h5>
        </div>

        {!isTooNarrow && !showSection && selectedSubject && selectedSubjectTitling && (
          <div
            tabIndex={0}
            data-testid={dataTestID + '-selected-div'}
            style={{
              fontSize: isTooNarrow ? '10pt' : 'inherit',
              marginLeft: isTooNarrow ? '0' : 'auto',
            }}
            className='text-muted' >
            {selectedSubjectTitling + ': ' + selectedSubject}
          </div>
        )}
      </div>

      {setShowSection &&
        <div className='ml-3'>
          {showSection ? (
            <Button
              aria-label={'Hide the ' + title + ' panel. '}
              id={dataTestID + '-hide-section-button'}
              data-testid={dataTestID + '-hide-section-button'}
              className='btn btn-primary btn-lg'
              onClick={() => setShowSection(false)}
            >
              Hide
            </Button>
          ) : (
            <Button
              aria-label={'Show the ' + title + ' panel. '}
              id={dataTestID + '-show-section-button'}
              data-testid={dataTestID + '-show-section-button'}
              className='btn btn-primary btn-lg'
              onClick={() => setShowSection(true)}
            >
              Show
            </Button>
          )}
        </div>
      }
    </div>
  );
};

export default SectionalTitleBar;
