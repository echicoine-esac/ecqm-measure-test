import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import KnowledgeRepository from '../../components/KnowledgeRepository';
import { Constants } from '../../constants/Constants';
import { Measure } from '../../models/Measure';
import { ServerUtils } from '../../utils/ServerUtils';

beforeEach(() => {
    jest.spyOn(ServerUtils, 'getServerList').mockImplementation(async () => {
        return Constants.serverTestData;
    });
});

test('expect setModal called with true when add server button selected', async () => {
    const servers = await ServerUtils.getServerList();
    const measures = buildMeasureData();

    const setModalShow = jest.fn();

    const measureDivText = 'text-measure-div';

    render(<KnowledgeRepository
        showKnowledgeRepo={true}
        setShowKnowledgeRepo={jest.fn()}
        servers={servers}
        fetchMeasures={jest.fn()}
        selectedKnowledgeRepo={servers[0]}
        measures={measures}
        setSelectedMeasure={jest.fn()}
        selectedMeasure={measureDivText}
        getDataRequirements={jest.fn()}
        loading={false}
        setModalShow={setModalShow}
    />);
    const addButton = 'knowledge-repo-server-add-button';
    const addButtonField: HTMLButtonElement = screen.getByTestId(addButton);


    await act(async () => {
        fireEvent.click(addButtonField);
    });


    expect(setModalShow).toBeCalledWith(true)

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


