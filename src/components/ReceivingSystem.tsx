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
}

// ReceivingSystem component displays the fields for selecting and using the receiving system
const ReceivingSystem: React.FC<Props> = ({ showReceiving, setShowReceiving, servers, setSelectedReceiving,
  selectedReceiving, postMeasureReport, loading, setModalShow, selectedMeasureReport }) => {


  const [href, setHref] = useState<string | undefined>(undefined);
  useEffect(() => {
    let objectUrl: string | undefined = undefined;
    if (selectedMeasureReport) {
      // Create a Blob and generate an object URL
      const blob = new Blob([selectedMeasureReport], { type: "application/json" });
      objectUrl = URL.createObjectURL(blob);
      setHref(objectUrl);
    }

    // Cleanup: Revoke the previous URL when results change or component unmounts
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        setHref(undefined)
      }
    };
  }, [selectedMeasureReport]);


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
            />

          </div>

          {/* checklist style indicator regardin stored measurereport */}
          <div className='mt-3' style={{ paddingBottom: '0px' }}>
            <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>

              <li data-testid='rec-sys-checklist-measure'>
                {selectedMeasureReport ? '☑' : '☐'} {href ? <a target='_blank' rel='noreferrer' href={href}>Generated Measure Report↗</a> : 'Generated Measure Report'}
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