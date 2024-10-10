import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import appLogo from '../ecqmTestingToolLogo.png';
import icfLogo from '../icf_logo.png';

const OAuthRedirectLandingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [dataFound, setDataFound] = useState(false);

  const setReturnedData = () => {
    const urlParams = new URLSearchParams(location.search);
    const authCode: string | null = urlParams.get('code');
    const state: string | null = urlParams.get('state');

    if ((authCode !== null && authCode.length > 0) && (state !== null && state.length > 0)) {
      setDataFound(true);
      //clear the url of sensitive data:
      window.history.pushState('', document.title, window.location.pathname);

      // Send the authCode and state back to the main window
      if (window.opener) {
        window.opener.postMessage({ authCode, state }, window.location.origin);
        window.close();  
      }
      // console.log('Stored Auth Code:', sessionStorage.getItem('authCode'));
      // console.log('Stored State:', sessionStorage.getItem('state'));

    } else {
      navigate('/');
    }

  };

  useEffect(() => {
    setReturnedData();
  }, [location.search]);

  return (
    <div className='container'>
      <div>
        <div className='row text-center' style={{ width: '100%', marginTop: '50px', padding: '0px', height: '65px', justifyContent: 'center', alignContent: 'center' }}>

          <div className='row text-center' style={{ width: '335px', justifyContent: 'center', alignContent: 'center' }}>
            <div className='col'>
              <a target='_blank' rel='noreferrer' href='http://www.icf.com'>
                <img className='d-block mx-auto mb-4' src={icfLogo} alt='ICF Logo' />
              </a>
            </div>

            <div className='col'>
              <img className='d-block mx-auto mb-4' src={appLogo} alt='eCQM Testing Tool' width='180px' />
            </div>
          </div>
        </div>
        {dataFound && (
          <div className='row text-center' style={{ width: '100%', margin: '0px', padding: '20px' }}>
            <h4>Authorization Completed</h4>
            <span>You may now close this window.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuthRedirectLandingPage;
