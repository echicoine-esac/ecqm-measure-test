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

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Update isMobile state on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
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
            style={{
              fontSize: isMobile ? '12pt' : '14pt',
              marginBottom: isMobile ? '0.25rem' : 0,
            }}
          >
            {title}
          </h5>
        </div>

        {!showSection && selectedSubject && selectedSubjectTitling && (
          <div

          //knowledge-repo-selected-div
            data-testid={dataTestID + '-selected-div'}
            style={{
              fontSize: isMobile ? '10pt' : 'inherit',
              marginLeft: isMobile ? '0' : 'auto',
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
              id={dataTestID + '-hide-section-button'}
              data-testid={dataTestID + '-hide-section-button'}
              className='btn btn-primary btn-lg'
              onClick={() => setShowSection(false)}
            >
              Hide
            </Button>
          ) : (
            <Button
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
