

import React from 'react';
import { Constants } from '../constants/Constants';
interface Props {
    loading: boolean;
    servers: any;
    dataTestID: string;
    baseUrlValue: string | undefined;
    callFunction?: (a: any) => void;
}
const ServerDropdown: React.FC<Props> = ({ loading, callFunction, servers, dataTestID, baseUrlValue }) => {
    return (
        <div className='col-md-5 order-md-1'>
            <select style={{ transition: 'all .5s' }} disabled={loading} data-testid={dataTestID + '-server-dropdown'}
                className='custom-select d-block w-100' id='server'
                value={baseUrlValue}
                onChange={(e) => callFunction && callFunction(servers[e.target.selectedIndex - 1])}>
                <option value=''>{Constants.label_selectServer}</option>
                {servers.map((server: any, index: React.Key | null | undefined) => (
                    <option key={index}>{server?.baseUrl}</option>
                ))}
            </select>
        </div>
    );
};

export default ServerDropdown;