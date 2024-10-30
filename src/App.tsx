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
import icfLogo from './ICF-logo-black.png';
import { Measure } from './models/Measure';
import { Outcome, OutcomeTracker } from './models/OutcomeTracker';
import { Patient } from './models/Patient';
import { PatientGroup } from './models/PatientGroup';
import { PopulationScoring } from './models/PopulationScoring';
import { GroupElement } from './models/Scoring';
import { Server } from './models/Server';
import { Section } from './enum/Section.enum';
import { PatientGroupUtils } from './utils/PatientGroupUtils';
import { ServerUtils } from './utils/ServerUtils';
import './css/global-overrides.css';
import { MeasureComparisonData } from './data/MeasureComparisonData';
import { MeasureComparisonManager } from './utils/MeasureComparisonManager';

const App: React.FC = () => {
  //responsive design
  const [isMobile, setIsMobile] = useState(window.innerWidth < 667);

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
  /**
   * Selecting a new Measure should reset the selectedPatient, test comparator, collected data, and evaluated measure (measure report)
   */
  const [selectedMeasure, setSelectedMeasure] = useState<string>('');
  const setSelectedMeasureCaller = (measureName: SetStateAction<string>) => {
    setTestComparatorMap(new Map<Patient, MeasureComparisonData>());
    clearPopulationCounts();
    resetResults();
    setCollectedData('');
    setMeasureReport('');
    setSelectedMeasure(measureName);
  };

  /**
   * Selecting a new patient should reset the test comparator, collected data, and evaluated measure (measure report)
   */
  const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>(undefined);
  const setSelectedPatientCaller = (patient: SetStateAction<Patient | undefined>) => {
    setTestComparatorMap(new Map<Patient, MeasureComparisonData>());
    clearPopulationCounts();
    resetResults();
    setCollectedData('');
    setMeasureReport('');

    setSelectedPatient(patient);
  };

  const [selectedPatientGroup, setSelectedPatientGroup] = useState<PatientGroup | undefined>(undefined);
  const [selectedKnowledgeRepositoryServer, setSelectedKnowledgeRepositoryServer] = useState<Server>(Constants.serverDefault);
  const [selectedDataRepositoryServer, setSelectedDataRepositoryServer] = useState<Server>(Constants.serverDefault);
  const [selectedMeasureEvaluationServer, setSelectedMeasureEvaluationServer] = useState<Server>(Constants.serverDefault);
  const [selectedReceivingSystemServer, setSelectedReceivingSystemServer] = useState<Server>(Constants.serverDefault);

  //Output text field holding results of various operations
  const [outcomeTracker, setOutcomeTracker] = useState<OutcomeTracker | undefined>();
  const setResultsCaller = ((outcomeTracker: OutcomeTracker) => {
    resetResults();
    setOutcomeTracker(outcomeTracker);
  });

  const [dataRepositoryResults, setDataRepositoryResults] = useState<string>('');
  const [knowledgeRepositoryResults, setKnowledgeRepositoryResults] = useState<string>('');
  const [measureEvaluationResults, setMeasureEvaluationResults] = useState<string>('');
  const [receivingSystemResults, setReceivingSystemResults] = useState<string>('');

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

  const [testComparatorMap, setTestComparatorMap] = useState<Map<Patient, MeasureComparisonData>>(new Map());

  const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);

  //reset functions
  const setSectionalResults = ((message: string, section: Section) => {
    switch (section) {
      case Section.KNOWLEDGE_REPO: {
        setKnowledgeRepositoryResults(message);
        return;
      }
      case Section.DATA_REPO: {
        setDataRepositoryResults(message);
        return;
      }
      case Section.MEASURE_EVAL: {
        setMeasureEvaluationResults(message);
        return;
      }
      case Section.REC_SYS: {
        setReceivingSystemResults(message);
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

  const resetResults = () => {
    setOutcomeTracker(Constants.outcomeTrackerDefault)
    setDataRepositoryResults('');
    setKnowledgeRepositoryResults('');
    setMeasureEvaluationResults('');
    setReceivingSystemResults('');
  }

  /**
   * Used mainly when a server gets selected and in doing so would impact 
   * certain functions as new sources of data could be present
   * @param section 
   * @returns 
   */
  const resetSection = (section: Section) => {
    setSectionalResults('', section);
    switch (section) {
      case Section.KNOWLEDGE_REPO: {
        setTestComparatorMap(new Map<Patient, MeasureComparisonData>());
        setMeasureReport('');
        setCollectedData('')
        setMeasures([]);
        clearPopulationCounts();
        setSelectedMeasure('');
        resetResults();
        return;
      }
      case Section.DATA_REPO: {
        setTestComparatorMap(new Map<Patient, MeasureComparisonData>());
        clearPopulationCounts();
        setCollectedData('');
        setPatients([]);
        setSelectedPatient(undefined);
        setSelectedPatientGroup(undefined);
        setPatientGroups(undefined);
        resetResults();
        return;
      }
      case Section.MEASURE_EVAL: {
        setTestComparatorMap(new Map<Patient, MeasureComparisonData>());
        clearPopulationCounts();
        setMeasureReport('');
        resetResults();
        return;
      }
    }
  }

  // Function for clearing all population counts
  const clearPopulationCounts = () => {
    const populationScoringInstance: PopulationScoring[] = [{
      groupID: '-',
      // Optionally set:
      groupScoring: undefined,
      groupPopulations: []
    }];
    setPopulationScoring(populationScoringInstance);
    setMeasureScoringType('');
    setShowPopulations(false);
  }

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

  useEffect(() => {
    // Only call to get the servers when the list is empty
    if (servers.length === 0) {
      initializeServers();
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 667);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const initializeServers = async () => {
    setServers(await ServerUtils.getServerList());
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

  /**
   * AUTOMATICALLY CALLED:
   * fetchMeasures is called when selecting a new knowledge repository server
   */
  const fetchMeasures = async (selectedKnowledgeRepositoryServer: Server) => {
    setSelectedKnowledgeRepositoryServer(selectedKnowledgeRepositoryServer);

    //user selecting default or unselecting a server:
    if (!selectedKnowledgeRepositoryServer?.baseUrl) {
      return;
    }

    setLoading(true)
    try {
      setMeasures((await new MeasureFetch(selectedKnowledgeRepositoryServer).fetchData(setResultsCaller)).operationData);
    } catch (error: any) {
      setSectionalResults(error.message, Section.KNOWLEDGE_REPO);
    }
    setLoading(false);
  };

  /**
   * AUTOMATICALLY CALLED:
   * fetchPatients is called when selecting a new data repository server
   * @param selectedDataRepositoryServer 
   * @returns 
   */
  const fetchPatients = async (selectedDataRepositoryServer: Server) => {
    setSelectedDataRepositoryServer(selectedDataRepositoryServer);

    //user selecting default or unselecting a server:
    if (!selectedDataRepositoryServer?.baseUrl) {
      return;
    }

    setLoading(true);
    try {

      let groupsMap: Map<string, PatientGroup> = (await new GroupFetch(selectedDataRepositoryServer).fetchData()).operationData;
      const patientFetch = await PatientFetch.createInstance(selectedDataRepositoryServer);
      setPatients((await patientFetch.fetchData()).operationData);
      setPatientGroups(groupsMap);

    } catch (error: any) {
      setSectionalResults(error.message, Section.DATA_REPO);
    }
    setLoading(false);
  };


  // Function for calling the server to perform the measure evaluation
  const evaluateMeasure = async (useSubject: boolean) => {
    resetSection(Section.MEASURE_EVAL);

    if (!selectedMeasureEvaluationServer?.baseUrl) {
      setMeasureEvaluationResults(Constants.error_measureEvaluationServer);
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
      setMeasureEvaluationResults(Constants.error_selectMeasure);
      return;
    } else if (measureObj.scoring?.coding) {
      setMeasureScoringType(measureObj?.scoring?.coding[0].code);
    }

    const patientGroup: PatientGroup | undefined = patientGroups?.has(selectedMeasure) ? patientGroups.get(selectedMeasure) : undefined;

    if (!selectedPatient && !patientGroup && useSubject) {
      setMeasureEvaluationResults(Constants.error_patientGroup);
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

    if (!selectedKnowledgeRepositoryServer?.baseUrl) {
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
    const dataRequirementsFetch = new DataRequirementsFetch(selectedKnowledgeRepositoryServer,
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
    if (!selectedDataRepositoryServer || selectedDataRepositoryServer.baseUrl === '') {
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


    const collectDataFetch = new CollectDataFetch(selectedDataRepositoryServer, selectedMeasure,
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
    if (!selectedReceivingSystemServer?.baseUrl) {
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
      setResultsCaller(await new PostMeasureReportFetch(selectedReceivingSystemServer,
        measureReport).submitData());
      setLoading(false);
    } catch (error: any) {
      setSectionalResults(error.message, Section.REC_SYS);
      setLoading(false);
    }
  };


  // This function acts a lot like evaluateMeasure, except after evaluating our measure,
  // a MeasureReport based on the subject ('Patient/' + selectedPatient.id) is fetched
  // and scoring is compared, mapped, and a summary in differences/matches presented to user.
  const compareTestResults = async () => {
    resetResults();
    setTestComparatorMap(new Map<Patient, MeasureComparisonData>());

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
    const newTestComparatorMap = new Map<Patient, MeasureComparisonData>();
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
        const mcMan = await new MeasureComparisonManager(new MeasureComparisonData(patientEntry,
          measureObj,
          selectedMeasureEvaluationServer,
          selectedDataRepositoryServer,
          startDate, endDate)).fetchAndCompareGroups();

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

  return (
    <div className='container'>
      <div className="container-fluid">
        <div className="row align-items-center" style={{ height: '65px', margin: '20px', padding: '0px' }}>
          <div className="col-2 col-md-1 text-left">
            <a target="_blank" rel="noreferrer" href="http://www.icf.com">
              <img className="img-fluid" src={icfLogo} alt="ICF Logo" style={{ maxHeight: '65px' }} />
            </a>
          </div>

          <div className="col-8 col-md-10 text-center">
            <img className="img-fluid" src={appLogo} alt="eCQM Testing Tool" style={{ maxHeight: '65px', width: 'auto' }} />
          </div>

          <div className="col-2 col-md-1"></div>
        </div>
      </div>


      <ReportingPeriod startDate={startDate} endDate={endDate} setStartDate={setStartDate} setEndDate={setEndDate} />

      <KnowledgeRepository showKnowledgeRepo={showKnowledgeRepo} setShowKnowledgeRepo={setShowKnowledgeRepo}
        servers={servers} fetchMeasures={fetchMeasures}
        selectedKnowledgeRepo={selectedKnowledgeRepositoryServer}
        measures={measures} setSelectedMeasure={setSelectedMeasureCaller}
        selectedMeasure={selectedMeasure}
        getDataRequirements={getDataRequirements} loading={loading}
        setModalShow={setServerModalShow}
        resetSection={resetSection} />
      <SectionalResults results={knowledgeRepositoryResults} />
      
      <DataRepository showDataRepo={showDataRepo} setShowDataRepo={setShowDataRepo} servers={servers}
        selectedDataRepo={selectedDataRepositoryServer} patients={patients}
        fetchPatients={fetchPatients} setSelectedPatient={setSelectedPatientCaller}
        selectedPatient={selectedPatient}
        collectData={collectData} loading={loading} setModalShow={setServerModalShow}
        selectedMeasure={selectedMeasure}
        groups={patientGroups}
        setSelectedPatientGroup={setSelectedPatientGroup}
        resetSection={resetSection} />
      <SectionalResults results={dataRepositoryResults} />

      <MeasureEvaluation showMeasureEvaluation={showMeasureEvaluation} setShowMeasureEvaluation={setShowMeasureEvaluation}
        servers={servers} setSelectedMeasureEvaluation={setSelectedMeasureEvaluationServer}
        selectedMeasureEvaluation={selectedMeasureEvaluationServer} submitData={submitData}
        evaluateMeasure={evaluateMeasure} loading={loading} setModalShow={setServerModalShow}
        selectedPatient={selectedPatient} patientGroup={selectedPatientGroup}
        selectedDataRepo={selectedDataRepositoryServer}
        collectedData={collectedData}
        resetSection={resetSection} />
      <SectionalResults results={measureEvaluationResults} />

      <ReceivingSystem showReceiving={showReceiving} setShowReceiving={setShowReceiving}
        servers={servers} setSelectedReceiving={setSelectedReceivingSystemServer}
        selectedReceiving={selectedReceivingSystemServer}
        postMeasureReport={postMeasureReport} loading={loading}
        setModalShow={setServerModalShow} selectedMeasureReport={measureReport}
        resetSection={resetSection} />
      <SectionalResults results={receivingSystemResults} />

      <TestingComparator showTestCompare={showTestCompare} setShowTestCompare={setShowTestCompare}
        items={testComparatorMap} compareTestResults={compareTestResults} loading={loading}
        startDate={startDate} endDate={endDate} selectedDataRepoServer={selectedDataRepositoryServer}
        selectedPatientGroup={selectedPatientGroup} selectedMeasureEvaluationServer={selectedMeasureEvaluationServer}
        selectedMeasure={selectedMeasure} selectedKnowledgeRepositoryServer={selectedKnowledgeRepositoryServer}
        selectedPatient={selectedPatient} />

      <Results selectedMeasure={selectedMeasure}
        //Populations now captured within results card:
        populationScoring={populationScoring} showPopulations={showPopulations} measureScoringType={measureScoringType}
        outcomeTracker={outcomeTracker}
      />


      <ServerModal modalShow={serverModalShow} setModalShow={setServerModalShow} createServer={createServer} />

      <LoginModal modalShow={loginModalShow} setModalShow={setLoginModalShow} username={username}
        setUsername={setUsername} password={password} setPassword={setPassword} />



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
      <div className='card'
        style={{
          display: isMobile ? 'none' : 'flex',
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
          height: '60px',
          lineHeight: '1.75',
        }}
      >
        <div className='row md-4'>
          <button
            id='app-show-all-btn'
            className='btn btn-link showAllHideAll'
            onClick={showAll}>
            Show All
          </button>
        </div>
        <div className='row md-4'>
          <button
            id='app-hide-all-btn'
            className='btn btn-link showAllHideAll'
            onClick={hideAll}>
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
          width: '60px',
        }}>
        {Constants.upArrow}
      </button>

    </div>
  );
}

export default App;
