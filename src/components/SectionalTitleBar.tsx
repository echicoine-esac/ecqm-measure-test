import React from 'react';
import { Button } from 'react-bootstrap';
import { Section } from '../enum/Section.enum';
import { Constants } from '../constants/Constants';

interface Props {
  section: Section;
  showSection: boolean;
  setShowSection: (visible: boolean) => void;

  selectedSubject?: string;
  selectedSubjectTitling?: string;
}

const SectionalTitleBar: React.FC<Props> = ({ section, showSection, selectedSubject, setShowSection, selectedSubjectTitling }) => {

  const title = Constants.sectionTitles.get(section);
  const dataTestID = Constants.sectionIDs.get(section);

  return (
    <div className='row align-items-center'>
      {/* Title Section */}
      <div className='col-12 col-md-3 text-md-left mb-2 mb-md-0'>
        <h5 style={{ fontSize: '14pt' }}>
          {title}
        </h5>
      </div>

      {/* Selected Subject Section */}
      <div
        data-testid={dataTestID + '-selected-div'}
        className='col-12 col-md-8 text-muted text-md-right mb-2 mb-md-0'
        style={{ textAlign: 'right' }}
      >
        {!showSection && selectedSubject && selectedSubjectTitling && (
          selectedSubjectTitling + ': ' + selectedSubject
        )}
      </div>

      {/* Button Section */}
      <div className='col-12 col-md-1 text-md-right'>
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
    </div>
  );
};

export default SectionalTitleBar;
