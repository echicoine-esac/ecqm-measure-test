import { act, fireEvent, render } from '@testing-library/react';
import App from '../../App';
import { Constants } from '../../constants/Constants';
import { Section } from '../../enum/Section.enum';

const thisTestFile = 'Show/Hide All Panel';


beforeAll(() => {
    global.URL.createObjectURL = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    Object.defineProperty(window.screen, 'orientation', {
        writable: true,
        value: { type: 'landscape-primary' },
    });
});


test(thisTestFile + ': scenario: show all reveals every panel', async () => {
    await act(async () => {
        render(<App />);
    });
    expect(document.getElementById('app-show-all-btn')).toBeInTheDocument();
    const showAllLink: HTMLButtonElement | null = document.getElementById('app-show-all-btn') as HTMLButtonElement;
    fireEvent.click(showAllLink);

    let allPanelsShown: boolean = true;
    Constants.sectionIDs.forEach((value: string, key: Section) => {
        try {
            //Show button will be present when panel is hidden
            if (document.getElementById(value + '-show-section-button')) {
                allPanelsShown = false;
            }
        } catch (error: any) {
            console.log(error);
        }
    });
    expect(allPanelsShown).toEqual(true);
});

test(thisTestFile + ': scenario: hide all reveals every panel', async () => {
    await act(async () => {
        render(<App />);
    });
    expect(document.getElementById('app-show-all-btn')).toBeInTheDocument();
    const showAllLink: HTMLButtonElement | null = document.getElementById('app-hide-all-btn') as HTMLButtonElement;
    fireEvent.click(showAllLink);

    let allPanelsHidden: boolean = true;
    Constants.sectionIDs.forEach((value: string, key: Section) => {
        try {
            //Hide button will be present when panel is shown
            if (document.getElementById(value + '-hide-section-button')) {
                allPanelsHidden = false;
            }
        } catch (error: any) {
            console.log(error);
        }
    });
    expect(allPanelsHidden).toEqual(true);
});

