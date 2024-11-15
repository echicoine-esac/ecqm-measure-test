import { render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import OAuthRedirectLandingPage from '../../oauth/OAuthRedirectLandingPage';

const thisTestFile = "OAuthRedirectLandingPage";

// Mock react-router-dom functions
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn(),
    useNavigate: jest.fn(),
}));

const mockNavigate = jest.fn();

beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
});

afterEach(() => {
    jest.clearAllMocks();
});

test(thisTestFile + ': renders properly', () => {
    (useLocation as jest.Mock).mockReturnValue({
        search: '',
    });

    render(
        <MemoryRouter>
            <OAuthRedirectLandingPage />
        </MemoryRouter>
    );

    const icfLogo = screen.getByAltText('ICF Logo');
    const appLogo = screen.getByAltText('eCQM Testing Tool');

    expect(icfLogo).toBeInTheDocument();
    expect(appLogo).toBeInTheDocument();
});

test(thisTestFile + ': navigates to home if no code or state is present', () => {
    (useLocation as jest.Mock).mockReturnValue({
        search: '',
    });

    render(
        <MemoryRouter>
            <OAuthRedirectLandingPage />
        </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/');
});

test(thisTestFile + ': sets dataFound to true and posts message if code and state are present', () => {
    const locationMock = {
        search: '?code=testCode&state=testState',
    };
    (useLocation as jest.Mock).mockReturnValue(locationMock);

    // Mock the postMessage and window.close functions
    const postMessageMock = jest.fn();
    window.opener = { postMessage: postMessageMock } as any;
    window.close = jest.fn();

    render(
        <MemoryRouter>
            <OAuthRedirectLandingPage />
        </MemoryRouter>
    );

    expect(postMessageMock).toHaveBeenCalledWith(
        { authCode: 'testCode', state: 'testState' },
        window.location.origin
    );
    expect(window.close).toHaveBeenCalled();
});

test(thisTestFile + ': does not post message or close window if opener is null', () => {
    const locationMock = {
        search: '?code=testCode&state=testState',
    };
    (useLocation as jest.Mock).mockReturnValue(locationMock);

    window.opener = null;
    window.close = jest.fn();

    render(
        <MemoryRouter>
            <OAuthRedirectLandingPage />
        </MemoryRouter>
    );

    expect(window.close).not.toHaveBeenCalled();
});

test(thisTestFile + ': displays "Authorization Completed" message if dataFound is true', () => {
    const locationMock = {
        search: '?code=testCode&state=testState',
    };
    (useLocation as jest.Mock).mockReturnValue(locationMock);

    render(
        <MemoryRouter>
            <OAuthRedirectLandingPage />
        </MemoryRouter>
    );

    const authorizationMessage = screen.getByText('Authorization Completed');
    const closeWindowMessage = screen.getByText('You may now close this window.');

    expect(authorizationMessage).toBeInTheDocument();
    expect(closeWindowMessage).toBeInTheDocument();
});

test(thisTestFile + ': removes sensitive data from the URL after setting data', () => {
    const originalPushState = window.history.pushState;
    window.history.pushState = jest.fn();

    const locationMock = {
        search: '?code=testCode&state=testState',
    };
    (useLocation as jest.Mock).mockReturnValue(locationMock);

    render(
        <MemoryRouter>
            <OAuthRedirectLandingPage />
        </MemoryRouter>
    );

    expect(window.history.pushState).toHaveBeenCalledWith('', document.title, window.location.pathname);

    // Restore the original pushState
    window.history.pushState = originalPushState;
});
