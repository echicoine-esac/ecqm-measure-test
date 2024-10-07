import React from 'react';
import { Button } from 'react-bootstrap';

interface Props {
  title: string;
  showSection: boolean;
  dataTestID: string;
  setshowSection: (visible: boolean) => void;

  selectedSubject?: string;
  selectedSubjectTitling?: string;
}

const SectionalTitleBar: React.FC<Props> = ({ title, showSection, selectedSubject, dataTestID, setshowSection, selectedSubjectTitling }) => {
  return (
    <div className='row' style={{ display: 'flex', flexWrap: 'nowrap' }}>
      <div style={{
        width: 'auto',
        display: 'flex',
        justifyContent: 'left',
        alignItems: 'center',
      }}
        className='col-md-3 order-md-1'>
        <h5 style={{ fontSize: '14pt', textAlign: 'left' }}>
          {title}
        </h5>
      </div>

      <div data-testid={dataTestID + 'selected-div'} style={{ textAlign: 'right', paddingTop: '10px', flexGrow: 1, flexShrink: 1, minWidth: 0 }} className='col-md-8 order-md-2 text-muted'>
        {!showSection && selectedSubject && selectedSubjectTitling && (selectedSubjectTitling + ': ' + selectedSubject)}
      </div>

      <div style={{ width: 'auto' }} className='col-md-1 order-md-3'>
        {showSection ? (
          <Button
            id={dataTestID + 'hide-section-button'}
            data-testid={dataTestID + 'hide-section-button'}
            className='btn btn-primary btn-lg float-right'
            onClick={(e) => setshowSection(false)}
          >
            Hide
          </Button>
        ) : (
          <Button
            id={dataTestID + 'show-section-button'}
            data-testid={dataTestID + 'show-section-button'}
            className='btn btn-primary btn-lg float-right'
            onClick={(e) => setshowSection(true)}
          >
            Show
          </Button>
        )}
      </div>
    </div>

  );
};

export default SectionalTitleBar;