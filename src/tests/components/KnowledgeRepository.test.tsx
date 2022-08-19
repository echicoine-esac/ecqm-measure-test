import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import DataRepository from '../../components/DataRepository';
import KnowledgeRepository from '../../components/KnowledgeRepository';
import { Measure } from '../../models/Measure';
import { Server } from "../../models/Server";

test('expect functions to be called when selecting items in dropdown', () => {
    const serverUrls = ['test-server-1', 'test-server-2'];
    const measures = buildMeasureData();
    const servers = buildServerData();
    const loadingFlag: boolean = false;
    const showKnowledgeRepo: boolean = true;

    const fetchMeasures = jest.fn();
    const setSelectedMeasure = jest.fn();
    const getDataRequirements = jest.fn();

    const measureDivText = 'text-measure-div';

    render(<KnowledgeRepository
        showKnowledgeRepo={showKnowledgeRepo}
        setShowKnowledgeRepo={jest.fn()}
        servers={servers}
        fetchMeasures={fetchMeasures}
        selectedKnowledgeRepo={''}
        measures={measures}
        setSelectedMeasure={setSelectedMeasure}
        selectedMeasure={measureDivText} 
        getDataRequirements={getDataRequirements}
        loading={loadingFlag}
        setModalShow={jest.fn()}
    />);

    //Selected Measure should hide if showKnowledgeRepo is true
    expect(screen.queryByText('Selected Measure:')).not.toBeInTheDocument();
    
    //select first server
    const serverDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-server-dropdown');
    userEvent.selectOptions(serverDropdown, 'test-server-2');
    expect(fetchMeasures).toBeCalledWith('test-server-2')

    const measureDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-measure-dropdown');
    userEvent.selectOptions(measureDropdown, measures[1].name);
    expect(setSelectedMeasure).toBeCalledWith(measures[1].name)

});
 
test('expect functions to be called when selecting items in dropdown', () => {
    const serverUrls = ['test-server-1', 'test-server-2'];
    const measures = buildMeasureData();
    const servers = buildServerData();
    const loadingFlag: boolean = false;
    const showKnowledgeRepo: boolean = false;

    const fetchMeasures = jest.fn();
    const setSelectedMeasure = jest.fn();
    const getDataRequirements = jest.fn();

    const measureDivText = 'text-measure-div';

    render(<KnowledgeRepository
        showKnowledgeRepo={showKnowledgeRepo}
        setShowKnowledgeRepo={jest.fn()}
        servers={servers}
        fetchMeasures={fetchMeasures}
        selectedKnowledgeRepo={''}
        measures={measures}
        setSelectedMeasure={setSelectedMeasure}
        selectedMeasure={measureDivText} 
        getDataRequirements={getDataRequirements}
        loading={loadingFlag}
        setModalShow={jest.fn()}
    />);

    //Selected Measure should hide if showKnowledgeRepo is true
    const measureDiv: HTMLDivElement = screen.getByTestId('selected-measure-div');
    expect(measureDiv.innerHTML).toEqual('Selected Measure: ' + measureDivText);

});

function buildMeasureData(): Measure[] {
    return [buildAMeasure('1'), buildAMeasure('2'), buildAMeasure('3')]
}

function buildServerData(): Server[] {
    return [buildAServer('1'), buildAServer('2'), buildAServer('3')]
}

function buildAMeasure(count: string): Measure {
    return {
        name: 'test-measure-' + count,
        scoring: {
            coding: [
                {
                    system: 'test-code-system-' + count,
                    code: 'test-code-code-' + count
                }
            ]
        }
    }
}

function buildAServer(count: string): Server {
    return {
        id: 'ec2345-' + count,
        baseUrl: 'http://localhost:8080-' + count
    }
}

