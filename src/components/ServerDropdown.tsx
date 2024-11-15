

import React from 'react';
import { Constants } from '../constants/Constants';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Section } from '../enum/Section.enum';
interface Props {
    loading: boolean;
    servers: any;
    section: Section;
    baseUrlValue: string | undefined;
    setModalShow: (b: boolean) => void;
    resetSection?: (s: Section) => void;
    callFunction?: (a: any) => void;

}
/**
 * Common approach to a server dropdown with just a few differences assigned
 * @param param0 
 * @returns 
 */
const ServerDropdown: React.FC<Props> = ({ loading, callFunction, servers, section, baseUrlValue, setModalShow, resetSection: resetterFunction }) => {

    const dataTestID = Constants.sectionIDs.get(section);
    const labelText = Constants.sectionTitles.get(section) + ' Server'

    const triggerSelectionChange = (a: any) => {
        if (resetterFunction) {
            resetterFunction(section);
        }

        if (callFunction) {
            callFunction(a);
        }
    }

    return (
        <div className='col-md-6 order-md-1' style={{ display: 'inline-block', paddingRight: '0px' }}>
            <label htmlFor='server-dropdown'>{labelText}</label>
            <div style={{ display: 'flex', paddingRight: '12px' }}>
                <select
                    id='server-dropdown'
                    aria-label={labelText + ' dropdown.'}
                    disabled={loading}
                    data-testid={dataTestID + '-server-dropdown'}
                    className='custom-select d-block w-100'
                    value={baseUrlValue}
                    onChange={(e) => triggerSelectionChange(servers[e.target.selectedIndex - 1])}>
                    <option value=''>{Constants.label_selectServer}</option>
                    {servers.map((server: any, index: React.Key | null | undefined) => (
                        <option key={index}>{server?.baseUrl}</option>
                    ))}
                </select>
                <OverlayTrigger placement={'top'}
                    overlay={<Tooltip>Add an Endpoint</Tooltip>}>
                    <Button
                        aria-label='Add server button, add a new server entry to the server dropdown. '
                        data-testid={dataTestID + '-server-add-button'}
                        style={{
                            border: '1px solid lightgrey',
                            margin: '0xp',
                            fontSize: '17pt',
                            paddingTop: '0px',
                            maxHeight: '38px',
                            maxWidth: '40px',
                            alignItems: 'center',
                            alignContent: 'center',
                            textAlign: 'center',
                            color: 'black',
                            backgroundColor: 'white',
                            marginLeft: '5px'
                        }}
                        disabled={loading}
                        variant='outline-primary'
                        onClick={() => setModalShow(true)}>
                        +
                    </Button>
                </OverlayTrigger>
            </div>

        </div>
    );
};

export default ServerDropdown;