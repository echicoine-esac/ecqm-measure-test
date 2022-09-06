import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import KnowledgeRepository from '../../components/KnowledgeRepository';
import { Measure } from '../../models/Measure';
import { ServerUtils } from '../../utils/ServerUtils';

beforeAll(() => {
    //cache the server list with test data
    ServerUtils.setMockData();
});

test('expect functions to be called when selecting items in dropdown', async () => {
    const servers = await ServerUtils.getServerList();
    const measures = buildMeasureData();
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
        selectedKnowledgeRepo={servers[0]}
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
    userEvent.selectOptions(serverDropdown, servers[0].baseUrl);
    expect(fetchMeasures).toBeCalledWith(servers[0])

    const measureDropdown: HTMLSelectElement = screen.getByTestId('knowledge-repo-measure-dropdown');
    userEvent.selectOptions(measureDropdown, measures[1].name);
    expect(setSelectedMeasure).toBeCalledWith(measures[1].name)

});

test('expect functions to be called when selecting items in dropdown', async () => {
    const servers = await ServerUtils.getServerList();
    const measures = buildMeasureData();
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
        selectedKnowledgeRepo={servers[0]}
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


