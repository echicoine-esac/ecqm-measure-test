import React, { SetStateAction, useEffect, useState } from 'react';
import './App.css';
import DataRepository from './components/DataRepository';
import KnowledgeRepository from './components/KnowledgeRepository';
import LoginModal from './components/LoginModal';
import MeasureEvaluation from './components/MeasureEvaluation';
import ReceivingSystem from './components/ReceivingSystem';
import ReportingPeriod from './components/ReportingPeriod';
import Results from './components/Results';
import SectionalResults from './components/SectionalResults';
import ServerModal from './components/ServerModal';
import TestingComparator from './components/TestingComparator';
import { Constants } from './constants/Constants';
import { CollectDataFetch } from './data/CollectDataFetch';
import { DataRequirementsFetch } from './data/DataRequirementsFetch';
import { EvaluateMeasureFetch } from './data/EvaluateMeasureFetch';
import { GroupFetch } from './data/GroupFetch';
import { MeasureFetch } from './data/MeasureFetch';
import { PatientFetch } from './data/PatientFetch';
import { PostMeasureReportFetch } from './data/PostMeasureReportFetch';
import { SubmitDataFetch } from './data/SubmitDataFetch';
import appLogo from './ecqmTestingToolLogo.png';
import icfLogo from './icf_logo.png';
import { Measure } from './models/Measure';
import { Outcome, OutcomeTracker } from './models/OutcomeTracker';
import { Patient } from './models/Patient';
import { PatientGroup } from './models/PatientGroup';
import { PopulationScoring } from './models/PopulationScoring';
import { GroupElement } from './models/Scoring';
import { Server } from './models/Server';

import { Section } from './enum/Section.enum';
import { MeasureComparisonManager } from './utils/MeasureComparisonManager';
import { PatientGroupUtils } from './utils/PatientGroupUtils';
import { ServerUtils } from './utils/ServerUtils';

const App: React.FC = () => {
  // Define the state variables
  // First define the state for reporting period
  const [startDate, setStartDate] = useState<string>(Constants.defaultStartDate);
  const [endDate, setEndDate] = useState<string>(Constants.defaultEndDate);

  // Then the state for the data repository
  const [servers, setServers] = useState<Array<Server | undefined>>([]);
  const [measures, setMeasures] = useState<Array<Measure | undefined>>([]);
  const [patients, setPatients] = useState<Array<Patient | undefined>>([]);
  const [patientGroups, setPatientGroups] = useState<Map<string, PatientGroup> | undefined>(undefined);

  // Selected States

  const [selectedMeasure, setSelectedMeasure] = useState<string>('');
  const setSelectedMeasureCaller = (measureName: SetStateAction<string>) => {
    //reset our test comparator when new measure is selected:
    setTestComparatorMap(new Map<Patient, MeasureComparisonManager>());
    //reset our selectedPatient to ensure patient data lines up with measure
    setSelectedPatient(undefined);
    //reset scoring:
    setShowPopulations(false);
    //reset any results panel:
    resetResults();
    //reset stored data:
    setCollectedData('');
    setMeasureReport('');
    //set the selected measure:
    setSelectedMeasure(measureName);
  };

  const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>(undefined);
  const setSelectedPatientCaller = (patient: SetStateAction<Patient | undefined>) => {
    //reset our test comparator when new patient is selected:
    setTestComparatorMap(new Map<Patient, MeasureComparisonManager>());
    setSelectedPatient(patient);
  };

  const [selectedPatientGroup, setSelectedPatientGroup] = useState<PatientGroup | undefined>(undefined);
  const [selectedKnowledgeRepo, setSelectedKnowledgeRepo] = useState<Server>({
    id: '',
    baseUrl: '',
    authUrl: '',
    tokenUrl: '',
    callbackUrl: '',
    clientID: '',
    clientSecret: '',
    scope: ''
  });
  const [selectedDataRepo, setSelectedDataRepo] = useState<Server>({
    id: '',
    baseUrl: '',
    authUrl: '',
    tokenUrl: '',
    callbackUrl: '',
    clientID: '',
    clientSecret: '',
    scope: ''
  });
  const [selectedMeasureEvaluationServer, setSelectedMeasureEvaluationServer] = useState<Server>({
    id: '',
    baseUrl: '',
    authUrl: '',
    tokenUrl: '',
    callbackUrl: '',
    clientID: '',
    clientSecret: '',
    scope: ''
  });
  const [selectedReceiving, setSelectedReceiving] = useState<Server>({
    id: '',
    baseUrl: '',
    authUrl: '',
    tokenUrl: '',
    callbackUrl: '',
    clientID: '',
    clientSecret: '',
    scope: ''
  });

  //Output text field holding results of various operations
  const [outcomeTracker, setOutcomeTracker] = useState<OutcomeTracker | undefined>();

  const setResultsCaller = ((outcomeTracker: OutcomeTracker) => {
    resetResults();
    setOutcomeTracker(outcomeTracker);
  });

  const [dataRepoResults, setDataRepoResults] = useState<string>('');
  const [knowledgeRepoResults, setKnowledgeRepoResults] = useState<string>('');
  const [measureEvalResults, setMeasureEvalResults] = useState<string>('');
  const [recSysResults, setRecSysResults] = useState<string>('');

  // Show states
  const [loading, setLoading] = useState<boolean>(false);
  const [showKnowledgeRepo, setShowKnowledgeRepo] = useState<boolean>(true);
  const [showDataRepo, setShowDataRepo] = useState<boolean>(false);
  const [showMeasureEvaluation, setShowMeasureEvaluation] = useState<boolean>(false);
  const [showReceiving, setShowReceiving] = useState<boolean>(false);
  const [showPopulations, setShowPopulations] = useState<boolean>(false);
  const [serverModalShow, setServerModalShow] = useState<boolean>(false);
  const [showTestCompare, setShowTestCompare] = useState<boolean>(false);

  // Handle authentication when required
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginModalShow, setLoginModalShow] = useState<boolean>(false);

  // Population states
  const [measureScoringType, setMeasureScoringType] = useState<string>('');
  const [populationScoring, setPopulationScoring] = useState<PopulationScoring[]>([]);


  // Saved data
  const [collectedData, setCollectedData] = useState<string>('');
  const [measureReport, setMeasureReport] = useState<string>('');

  const [testComparatorMap, setTestComparatorMap] = useState<Map<Patient, MeasureComparisonManager>>(new Map());

  const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);

  //Simple scroll to top button:
  const checkScrollTop = () => {
    if (!showScrollToTopButton && window.scrollY > 300) {
      setShowScrollToTopButton(true);
    } else if (showScrollToTopButton && window.scrollY <= 300) {
      setShowScrollToTopButton(false);
    }
  };
  const scrollScreenToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    window.addEventListener('scroll', checkScrollTop);
    return () => {
      window.removeEventListener('scroll', checkScrollTop);
    };
    // eslint-disable-next-line 
  }, [showScrollToTopButton]);


  const setSectionalResults = ((message: string, section: Section) => {
    switch (section) {
      case Section.KNOWLEDGE_REPO: {
        setKnowledgeRepoResults(message);
        return;
      }
      case Section.DATA_REPO: {
        setDataRepoResults(message);
        return;
      }
      case Section.MEASURE_EVAL: {
        setMeasureEvalResults(message);
        return;
      }
      case Section.REC_SYS: {
        setRecSysResults(message);
        return;
      }
      default: {
        setResultsCaller({
          outcomeMessage: message,
          outcomeType: Outcome.NONE,
        });
      }
    }
  });


  useEffect(() => {
    // Only call to get the servers when the list is empty
    if (servers.length === 0) {
      initializeServers();
    }
  }, []);


  useEffect(() => {
    // When a server is selected store it in the session
    if (selectedKnowledgeRepo?.baseUrl !== '') {
      sessionStorage.setItem('selectedKnowledgeRepo', JSON.stringify(selectedKnowledgeRepo));
      //console.log('stored selectedKnowledgeRepo in session ' + JSON.stringify(selectedKnowledgeRepo));
    }
  }, [selectedKnowledgeRepo]);


  const initializeServers = async () => {
    setServers(await ServerUtils.getServerList());
  }

  const resetResults = () => {
    setOutcomeTracker({
      outcomeMessage: '',
      outcomeType: Outcome.NONE
    })
    setDataRepoResults('');
    setKnowledgeRepoResults('');
    setMeasureEvalResults('');
    setRecSysResults('');
    setOutcomeTracker(undefined);
  }

  // Uses the GraphQL API to create a server
  const createServer = async (baseUrl: string, authUrl: string, tokenUrl: string, clientId: string,
    clientSecret: string, scope: string) => {
    try {
      await ServerUtils.createServer(baseUrl, authUrl, tokenUrl, clientId, clientSecret, scope);
      setServers(await ServerUtils.getServerList());
    } catch (error: any) {
      setResultsCaller({
        outcomeMessage: 'An error occurred while attempting to add a server to the system:',
        outcomeType: Outcome.FAIL,
        //uses jsonString to convey error:
        jsonFormattedString: error.message
      });
    }
  }


  // Queries the selected server for the list of measures it has
  const fetchMeasures = async (knowledgeRepo: Server) => {
    resetResults();
    setLoading(true);

    if (!knowledgeRepo?.baseUrl) {
      setSelectedKnowledgeRepo(knowledgeRepo);
      setShowPopulations(false);
      setLoading(false);
      setMeasures([]);
      setSelectedMeasure('');
      return;
    }

    setSelectedKnowledgeRepo(knowledgeRepo);
    setShowPopulations(false);

    try {
      setMeasures((await new MeasureFetch(knowledgeRepo).fetchData(setResultsCaller)).operationData);
    } catch (error: any) {
      setSectionalResults(error.message, Section.KNOWLEDGE_REPO);
    }
    setLoading(false);
  };

  // Function for retrieving the patients from the selected server
  const fetchPatients = async (dataRepo: Server) => {
    resetResults();
    setLoading(true);

    if (!dataRepo?.baseUrl) {
      setLoading(false);
      setPatients([]);
      setSelectedPatient(undefined);
      setSelectedPatientGroup(undefined);
      setPatientGroups(undefined);
      setSelectedDataRepo(dataRepo);
      return;
    }

    setSelectedDataRepo(dataRepo);
    setShowPopulations(false);

    try {

      const groupFetch = new GroupFetch(dataRepo);

      let groupsMap: Map<string, PatientGroup> = (await groupFetch.fetchData()).operationData;

      setPatientGroups(groupsMap);

      const patientFetch = await PatientFetch.createInstance(dataRepo);
      setPatients((await patientFetch.fetchData()).operationData);


    } catch (error: any) {
      setSectionalResults(error.message, Section.DATA_REPO);
    }
    setLoading(false);
  };

  // Function for calling the server to perform the measure evaluation
  const evaluateMeasure = async (useSubject: boolean) => {
    resetResults();
    setTestComparatorMap(new Map<Patient, MeasureComparisonManager>());
    clearPopulationCounts();

    // Make sure all required elements are set
    if (!selectedMeasureEvaluationServer?.baseUrl) {
      setMeasureEvalResults(Constants.error_measureEvaluationServer);
      return;
    }

    //Establish the Measure object
    let measureObj: Measure | undefined;
    if (selectedMeasure !== '') {
      for (let measure of measures) {
        if (measure!.name === selectedMeasure) {
          measureObj = measure;
        }
      }
    }

    if (!measureObj) {
      setMeasureEvalResults(Constants.error_selectMeasure);
      return;
    } else if (measureObj.scoring?.coding) {
      setMeasureScoringType(measureObj?.scoring?.coding[0].code);
    }

    const patientGroup: PatientGroup | undefined = patientGroups?.has(selectedMeasure) ? patientGroups.get(selectedMeasure) : undefined;

    if (!selectedPatient && !patientGroup && useSubject) {
      setMeasureEvalResults(Constants.error_patientGroup);
      return;
    }

    // Set the loading state since this call can take a while to return
    setLoading(true);

    const evaluateMeasureFetch = new EvaluateMeasureFetch(selectedMeasureEvaluationServer,
      selectedMeasure, startDate, endDate, useSubject, selectedPatient, patientGroup)

    try {
      let evaluateMeasureOutcomeTracker: OutcomeTracker = await evaluateMeasureFetch.fetchData(setSectionalResults, Section.MEASURE_EVAL);
      setResultsCaller(evaluateMeasureOutcomeTracker);
  
      if (evaluateMeasureOutcomeTracker.jsonFormattedString) {
        setMeasureReport(evaluateMeasureOutcomeTracker.jsonFormattedString);
      }

      if (evaluateMeasureOutcomeTracker.operationData) {
        const measureGroups: GroupElement[] = evaluateMeasureOutcomeTracker.operationData;
        let populationScoringCollection: PopulationScoring[] = [];

        for (const group of measureGroups) {
          const groupElement: GroupElement = group;

          populationScoringCollection.push({
            groupID: groupElement.id,
            groupScoring: evaluateMeasureOutcomeTracker.jsonRawData?.scoring ?
              evaluateMeasureOutcomeTracker.jsonRawData?.scoring.coding[0].code : undefined,
            groupPopulations: group.population
          })
        }

        //show the results:
        setPopulationScoring(populationScoringCollection);

        // Show the populations
        setShowPopulations(true);
      }
    } catch (error: any) {
      setSectionalResults(error.message, Section.MEASURE_EVAL);
    }

    setLoading(false);
  };

  // Function for calling the server to get the data requirements
  const getDataRequirements = async () => {
    resetResults();

    setShowPopulations(false);

    // Make sure all required elements are set
    if (!selectedKnowledgeRepo || selectedKnowledgeRepo.baseUrl === '') {
      setSectionalResults(Constants.error_selectKnowledgeRepository, Section.KNOWLEDGE_REPO);
      return;
    }
    if (selectedMeasure === '') {
      setSectionalResults(Constants.error_selectMeasureDR, Section.KNOWLEDGE_REPO);
      return;
    }

    // Set the loading state since this call can take a while to return
    setLoading(true);

    // Build the data requirements URL based on the options selected
    const dataRequirementsFetch = new DataRequirementsFetch(selectedKnowledgeRepo,
      selectedMeasure, startDate, endDate)

    try {
      setResultsCaller(await dataRequirementsFetch.fetchData(setSectionalResults, Section.KNOWLEDGE_REPO));
      setLoading(false);
    } catch (error: any) {
      setSectionalResults(error.message, Section.KNOWLEDGE_REPO);
      setLoading(false);
    }

  };

  // Function for calling the server to collect the data for a measure
  const collectData = async (useSubject: boolean) => {
    resetResults();

    setShowPopulations(false);

    // Make sure all required elements are set
    if (!selectedDataRepo || selectedDataRepo.baseUrl === '') {
      setSectionalResults(Constants.error_selectDataRepository, Section.DATA_REPO);
      return;
    }
    if (selectedMeasure === '') {
      setSectionalResults(Constants.error_collectData_selectMeasure, Section.DATA_REPO);
      return;
    }

    const patientGroup: PatientGroup | undefined = patientGroups?.has(selectedMeasure) ? patientGroups.get(selectedMeasure) : undefined;

    if (!selectedPatient && !patientGroup && useSubject) {
      setSectionalResults(Constants.error_patientGroup, Section.DATA_REPO);
      return;
    }


    // Set loading to true for spinner
    setLoading(true);


    const collectDataFetch = new CollectDataFetch(selectedDataRepo, selectedMeasure,
      startDate, endDate, useSubject, selectedPatient, patientGroup)

    // Call the FHIR server to collect the data
    try {
      const collectDataOutcomeTracker = await collectDataFetch.fetchData(setSectionalResults, Section.DATA_REPO);

      if (collectDataOutcomeTracker.jsonFormattedString) {
        setCollectedData(collectDataOutcomeTracker.jsonFormattedString);
      }

      setResultsCaller(collectDataOutcomeTracker);

      setLoading(false);
    } catch (error: any) {
      setSectionalResults(error.message, Section.DATA_REPO);
      setLoading(false);
    }

  };

  // Function for calling the server to submit the data for a measure
  const submitData = async () => {
    resetResults();

    setShowPopulations(false);

    // Make sure all required elements are set
    if (!selectedMeasureEvaluationServer?.baseUrl) {
      setSectionalResults(Constants.error_measureEvaluationServer, Section.MEASURE_EVAL);
      return;
    }

    if (!selectedMeasure) {
      setSectionalResults(Constants.error_submitData_selectMeasure, Section.MEASURE_EVAL);
      return;
    }

    if (collectedData?.length === 0) {
      setSectionalResults(Constants.error_submitData_collectData, Section.MEASURE_EVAL);
      return;
    }

    // Set loading to true for spinner
    setLoading(true);

    try {
      setResultsCaller(await new SubmitDataFetch(selectedMeasureEvaluationServer,
        selectedMeasure, collectedData).submitData());

      setLoading(false);
    } catch (error: any) {
      setSectionalResults(error.message, Section.MEASURE_EVAL);
      setLoading(false);
    }
  };

  // Function for posting the measure report to the receiving server
  const postMeasureReport = async () => {
    resetResults();

    setShowPopulations(false);

    // Make sure all required elements are set
    if (!selectedReceiving?.baseUrl) {
      setSectionalResults(Constants.error_receivingSystemServer, Section.REC_SYS);
      return;
    }
    if (!measureReport) {
      setSectionalResults(Constants.error_generateMeasureReport, Section.REC_SYS);
      return;
    }

    // Set loading to true for spinner
    setLoading(true);

    try {
      setResultsCaller(await new PostMeasureReportFetch(selectedReceiving,
        measureReport).submitData());
      setLoading(false);
    } catch (error: any) {
      setSectionalResults(error.message, Section.REC_SYS);
      setLoading(false);
    }
  };

  // Function for clearing all population counts
  const clearPopulationCounts = () => {
    const populationScoringInstance: PopulationScoring[] = [{
      groupID: '-',
      // Optionally set:
      groupScoring: undefined,
      groupPopulations: []
    }];
    setPopulationScoring(populationScoringInstance);
    resetResults();
    setMeasureScoringType('');
    setShowPopulations(false);
  }


  // This function acts a lot like evaluateMeasure, except after evaluating our measure,
  // a MeasureReport based on the subject ('Patient/' + selectedPatient.id) is fetched
  // and scoring is compared, mapped, and a summary in differences/matches presented to user.
  const compareTestResults = async () => {
    resetResults();
    setTestComparatorMap(new Map<Patient, MeasureComparisonManager>());

    //validation of required fields done via checklist which enables/disables generate button

    //Patient Group data:
    const patientCompareList: Patient[] = [];
    if (patientGroups?.has(selectedMeasure)) {
      const selectedMeasureGroup: PatientGroup | undefined = patientGroups.get(selectedMeasure);
      //Whether its one Patient selected or the user intends all patients,
      //build a list by verifying Group has the Patient in it.
      if (selectedMeasureGroup && selectedPatient &&
        (PatientGroupUtils.patientExistsInGroup(selectedPatient, selectedMeasureGroup))) {
        patientCompareList.push(selectedPatient);
      } else {
        for (const patient of patients) {
          if (selectedMeasureGroup && patient &&
            (PatientGroupUtils.patientExistsInGroup(patient, selectedMeasureGroup))) {
            patientCompareList.push(patient);
          }
        }
      }
    }

    if (patientCompareList.length === 0) {
      return;
    }

    //Now begin processing valid patients in our list:
    const newTestComparatorMap = new Map<Patient, MeasureComparisonManager>();
    setLoading(true);
    clearPopulationCounts();

    //Establish the Measure object
    let measureObj: Measure | undefined;
    if (selectedMeasure !== '') {
      for (let measure of measures) {
        if (measure!.name === selectedMeasure) {
          measureObj = measure;
        }
      }
    }

    if (measureObj) {
      for (const patientEntry of patientCompareList) {
        //patient belongs to this group, proceed:
        const mcMan = new MeasureComparisonManager(patientEntry,
          measureObj,
          selectedMeasureEvaluationServer,
          selectedDataRepo,
          startDate, endDate);

        await mcMan.fetchGroups();

        const patientDisplayKey = '' + patientEntry?.display;

        if (patientDisplayKey.length > 0) {
          newTestComparatorMap.set(patientEntry, mcMan);
        }
      }
    }

    //setting this Map triggers the ui in TestingComparator to automatically present the data
    resetResults();
    setTestComparatorMap(newTestComparatorMap);
    setLoading(false);
  };

  const hideAll = () => {
    Constants.sectionIDs.forEach((value: string, key: Section) => {
      try {
        if (document.getElementById(value + '-hide-section-button')) {
          document.getElementById(value + '-hide-section-button')?.click();
        }
      } catch (error: any) {
        console.log(error);
      }
    });
  }

  const showAll = () => {
    Constants.sectionIDs.forEach((value: string, key: Section) => {
      try {
        if (document.getElementById(value + '-show-section-button')) {
          document.getElementById(value + '-show-section-button')?.click();
        }
      } catch (error: any) {
        console.log(error);
      }
    });
  }

  const showAllHideAllStyling = {
    padding: 0,
    textDecoration: 'underline',
    color: '#007bff',
    background: 'none',
    outline: 'none',
    boxShadow: '0 0 0 0px',
    fontSize: '11pt'
  };

  return (
    <div className='container'>
      <div className='row text-center col-md-11' style={{ marginTop: '20px', padding: '0px', height: '65px' }}>
        <div className='text-center col-md-1'>
          <a target='_blank' rel='noreferrer' href='http://www.icf.com'>
            <img className='d-block mx-auto mb-4' src={icfLogo} alt='ICF Logo' />
          </a>
        </div>
        <div className='col-md-11'>
          <img className='d-block mx-auto mb-4' src={appLogo} alt='eCQM Testing Tool' width='180px' />
        </div>

      </div>
      <ReportingPeriod startDate={startDate} endDate={endDate} setStartDate={setStartDate} setEndDate={setEndDate} />
      <br />
      <KnowledgeRepository showKnowledgeRepo={showKnowledgeRepo} setShowKnowledgeRepo={setShowKnowledgeRepo}
        servers={servers} fetchMeasures={fetchMeasures}
        selectedKnowledgeRepo={selectedKnowledgeRepo}
        measures={measures} setSelectedMeasure={setSelectedMeasureCaller}
        selectedMeasure={selectedMeasure}
        getDataRequirements={getDataRequirements} loading={loading}
        setModalShow={setServerModalShow} />
      <SectionalResults results={knowledgeRepoResults} />
      <br />
      <DataRepository showDataRepo={showDataRepo} setShowDataRepo={setShowDataRepo} servers={servers}
        selectedDataRepo={selectedDataRepo} patients={patients}
        fetchPatients={fetchPatients} setSelectedPatient={setSelectedPatientCaller}
        selectedPatient={selectedPatient}
        collectData={collectData} loading={loading} setModalShow={setServerModalShow}
        selectedMeasure={selectedMeasure}
        groups={patientGroups}
        setSelectedPatientGroup={setSelectedPatientGroup} />
      <SectionalResults results={dataRepoResults} />
      <br />
      <MeasureEvaluation showMeasureEvaluation={showMeasureEvaluation} setShowMeasureEvaluation={setShowMeasureEvaluation}
        servers={servers} setSelectedMeasureEvaluation={setSelectedMeasureEvaluationServer}
        selectedMeasureEvaluation={selectedMeasureEvaluationServer} submitData={submitData}
        evaluateMeasure={evaluateMeasure} loading={loading} setModalShow={setServerModalShow}

        selectedPatient={selectedPatient} patientGroup={selectedPatientGroup}
        //used for href to subject
        selectedDataRepo={selectedDataRepo}
        collectedData={collectedData} />
      <SectionalResults results={measureEvalResults} />
      <br />
      <ReceivingSystem showReceiving={showReceiving} setShowReceiving={setShowReceiving}
        servers={servers} setSelectedReceiving={setSelectedReceiving}
        selectedReceiving={selectedReceiving}
        postMeasureReport={postMeasureReport} loading={loading}
        setModalShow={setServerModalShow} selectedMeasureReport={measureReport} />
      <SectionalResults results={recSysResults} />
      <br />
      <TestingComparator showTestCompare={showTestCompare} setShowTestCompare={setShowTestCompare}
        items={testComparatorMap} compareTestResults={compareTestResults} loading={loading}
        startDate={startDate} endDate={endDate} selectedDataRepoServer={selectedDataRepo}
        selectedPatientGroup={selectedPatientGroup} selectedMeasureEvaluationServer={selectedMeasureEvaluationServer}
        selectedMeasure={selectedMeasure} selectedKnowledgeRepositoryServer={selectedKnowledgeRepo}
        selectedPatient={selectedPatient} />

      <Results selectedMeasure={selectedMeasure}
        //Populations now captured within results card:
        populationScoring={populationScoring} showPopulations={showPopulations} measureScoringType={measureScoringType}
        outcomeTracker={outcomeTracker}
      />

      <br />
      <ServerModal modalShow={serverModalShow} setModalShow={setServerModalShow} createServer={createServer} />

      <LoginModal modalShow={loginModalShow} setModalShow={setLoginModalShow} username={username}
        setUsername={setUsername} password={password} setPassword={setPassword} />
      <br />


      {/* Authorized servers section used in testing and tracking of multiple oauth servers
      {OAuthHandler.cachedAuthenticationByServer.size > 0 &&
        Array.from(OAuthHandler.cachedAuthenticationByServer.values()).some(value => value.accessCode) && (


          <div style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            top: '10px',
            left: '15px',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100,
            width: 'auto',
            maxWidth: '200px',
            fontSize: '10pt',
            background: '#F7F7F7',
            borderRadius: '4px',
            height: 'auto',
            border: '1px solid lightgrey',
            lineHeight: '1.75',
            padding: '5px'
          }}>


            <h6>Authorized:</h6>
            <div style={{ marginLeft: '0px', maxWidth: '155px', wordBreak: 'break-all', fontWeight: 'normal' }}>
              {Array.from(OAuthHandler.cachedAuthenticationByServer).map(([key, value]) => (
                <div key={key}>
                  {value.accessCode &&
                    <span>{StringUtils.shrinkUrlDisplay(key)}</span>
                  }
                </div>

              ))}
            </div>

          </div>
        )} */}


      {/* Show All / Hide All  */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: '10px',
        right: '15px',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
        width: '80px',
        fontSize: '10pt',
        background: '#F7F7F7',
        borderRadius: '4px',
        height: '60px',
        border: '1px solid lightgrey',
        lineHeight: '1.75'
      }}>
        <div className='row md-4'>
          <button
            id='app-show-all-btn'
            className='btn btn-link'
            onClick={showAll}
            style={showAllHideAllStyling}>
            Show All
          </button>
        </div>
        <div className='row md-4'>
          <button
            id='app-hide-all-btn'
            className='btn btn-link'
            onClick={hideAll}
            style={showAllHideAllStyling}>
            Hide All
          </button>
        </div>
      </div>

      {/* Scroll to top button */}
      <button
        onClick={scrollScreenToTop}
        style={{
          display: showScrollToTopButton ? 'flex' : 'none',
          position: 'fixed',
          bottom: '10px',
          right: '25px',
          backgroundColor: '#0D6EFD',
          color: 'white',
          border: 'none',
          padding: '10px',
          borderRadius: '50%',
          cursor: 'pointer',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
          fontSize: '24px',
          transition: 'opacity 0.3s',
          width: '60px'
        }}>
        {Constants.upArrow}
      </button>

    </div>
  );
}

export default App;
