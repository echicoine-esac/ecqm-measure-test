import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { Section } from '../enum/Section.enum';
import { Server } from '../models/Server';
import SectionalTitleBar from './SectionalTitleBar';
import ServerDropdown from './ServerDropdown';

// Props for ReceivingSystem
interface Props {
  showReceiving: boolean;
  setShowReceiving: React.Dispatch<React.SetStateAction<boolean>>;
  servers: Array<Server | undefined>;
  setSelectedReceiving: React.Dispatch<React.SetStateAction<Server>>;
  selectedReceiving: Server | undefined;
  postMeasureReport: () => void;
  loading: boolean;
  setModalShow: React.Dispatch<React.SetStateAction<boolean>>;
  selectedMeasureReport?: string | undefined;
  resetSection?: (s: Section) => void;
}

// ReceivingSystem component displays the fields for selecting and using the receiving system
const ReceivingSystem: React.FC<Props> = ({ showReceiving, setShowReceiving, servers, setSelectedReceiving,
  selectedReceiving, postMeasureReport, loading, setModalShow, selectedMeasureReport,
  resetSection }) => {

  const [href, setHref] = useState<string | undefined>(undefined);

  useEffect(() => {
    let objectUrl: string | undefined = undefined;

    if (selectedMeasureReport && selectedMeasureReport.trim() !== '') {
      // Create a Blob and generate an object URL if there's valid content
      const blob = new Blob([selectedMeasureReport], { type: "application/json" });
      objectUrl = URL.createObjectURL(blob);
      setHref(objectUrl);
    } else {
      // Reset href if the string is empty
      setHref(undefined);
    }

    // Cleanup: Revoke the previous URL when results change or component unmounts
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      setHref(undefined);
    };
  }, [selectedMeasureReport]);


  const handleDownload = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    window.open(href ?? '', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className='card'>
      <div className='card-header'>

        <SectionalTitleBar
          section={Section.REC_SYS}
          setShowSection={setShowReceiving}
          showSection={showReceiving} />

      </div>
      {showReceiving ? (
        <div className='card-body'>

          <div className='row'>

            <ServerDropdown
              section={Section.REC_SYS}
              loading={loading}
              servers={servers}
              callFunction={setSelectedReceiving}
              baseUrlValue={selectedReceiving?.baseUrl}
              setModalShow={setModalShow}
              resetSection={resetSection}
            />

          </div>

          {/* checklist style indicator regardin stored measurereport */}
          <div

            tabIndex={0}
            aria-label={href ? 'Generated measure report. This link will open a snapshot of the stored measure report to be posted to the recieving system.' :
              'Generated measure report. When populated, this link will open a snapshot of the stored measure report to be posted to the recieving system. You can generate a MeasureReport using the Evaluate Measure function in the Measure Evaluation panel. '}

            className='mt-3' style={{ paddingBottom: '0px' }}>
            <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>

              <li data-testid='rec-sys-checklist-measure'>
                {selectedMeasureReport ? '☑' : '☐'} {href ?
                  <a href={href ?? '#'}
                    onClick={handleDownload}>
                    Generated Measure Report↗
                  </a>
                  :
                  'Generated Measure Report'}
              </li>

            </ul>
          </div>
          <div className='row'>
            <div className='col-md-6 order-md-2' style={{ marginTop: '0px' }}>
              {loading ? (
                <Button data-testid='rec-sys-submit-button-spinner' className='w-100 btn btn-primary btn-lg' id='getData' disabled={loading}>
                  <Spinner
                    as='span'
                    variant='light'
                    size='sm'
                    role='status'
                    aria-hidden='true'
                    animation='border' />
                  Loading...
                </Button>
              ) : (
                <Button data-testid='rec-sys-submit-button' className='w-100 btn btn-primary btn-lg' id='getData' disabled={loading}
                  onClick={(e) => postMeasureReport()}>
                  Post Measure Report
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div />
      )
      }
    </div >
  );
};

export default ReceivingSystem;