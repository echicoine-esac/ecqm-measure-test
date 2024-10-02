import React, { SetStateAction, useEffect, useState } from 'react';
import './App.css';
import DataRepository from './components/DataRepository';
import KnowledgeRepository from './components/KnowledgeRepository';
import LoginModal from './components/LoginModal';
import MeasureEvaluation from "./components/MeasureEvaluation";
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
import logo from './icf_logo.png';
import { Measure } from './models/Measure';
import { Patient } from './models/Patient';
import { PatientGroup } from './models/PatientGroup';
import { PopulationScoring } from './models/PopulationScoring';
import { GroupElement } from './models/Scoring';
import { Server } from './models/Server';
import { OAuthHandler } from './oauth/OAuthHandler';
import { HashParamUtils } from './utils/HashParamUtils';
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
    //set the selected measure:
    setSelectedMeasure(measureName);

    setShowPopulations(false);

    resetResults();
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
  const [results, setResults] = useState<string>('');
  const setResultsCaller = ((message: string) => {
    resetResults();
    setResults(message);
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


  // Handle OAuth redirect
  const [accessToken, setAccessToken] = useState<string>('');

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
  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  useEffect(() => {
    window.addEventListener('scroll', checkScrollTop);
    return () => {
      window.removeEventListener('scroll', checkScrollTop);
    };
  }, [showScrollToTopButton]);

  const enum Section {
    KNOWLEDGE_REPO,
    DATA_REPO,
    MEASURE_EVAL,
    REC_SYS,
  }

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
        setResultsCaller(message);
      }
    }
  });

  const resumeOAuthFlow = async (previouslySelectedKnowledgeRepo: string) => {
    //remove the entry:
    sessionStorage.setItem('selectedKnowledgeRepo', JSON.stringify(''));

    //ensure generatedStateCode
    HashParamUtils.buildHashParams();

    //attempt to set the knowledge repo and fetchMeasures (resume flow)
    let sessionString;
    try {
      sessionString = JSON.parse(previouslySelectedKnowledgeRepo);
      setSelectedKnowledgeRepo(sessionString);
      // Call fetchMeasures again to finish the workflow
      await fetchMeasures(sessionString);
    } catch (error: any) {
      //sessionString likely 'undefined' 
      HashParamUtils.removeCodeParam();
      return;
    }

    // Remove the code from the URL
    HashParamUtils.removeCodeParam();

  }

  useEffect(() => {
    // Only call to get the servers when the list is empty
    if (servers.length === 0) {
      initializeServers();
    }

    // Get selected oauth server from session  (likely redirected back to here if selectedKnowledgeRepo has value)
    let previouslySelectedKnowledgeRepo = sessionStorage.getItem('selectedKnowledgeRepo');
    if (previouslySelectedKnowledgeRepo && previouslySelectedKnowledgeRepo !== 'undefined' && previouslySelectedKnowledgeRepo?.length > 0) {
      resumeOAuthFlow(previouslySelectedKnowledgeRepo);
    }
    // eslint-disable-next-line 
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
    setResults('');
    setDataRepoResults('');
    setKnowledgeRepoResults('');
    setMeasureEvalResults('');
    setRecSysResults('');
  }

  // Uses the GraphQL API to create a server
  const createServer = async (baseUrl: string, authUrl: string, tokenUrl: string, clientId: string,
    clientSecret: string, scope: string) => {
    try {
      await ServerUtils.createServer(baseUrl, authUrl, tokenUrl, clientId, clientSecret, scope);
      setServers(await ServerUtils.getServerList());
    } catch (error: any) {
      setResultsCaller(error.message);
    }
  }


  // Queries the selected server for the list of measures it has
  const fetchMeasures = async (knowledgeRepo: Server) => {
    resetResults();

    if (knowledgeRepo !== selectedKnowledgeRepo) {
      setMeasures([]);
      setSelectedMeasure('');
    }

    setLoading(true);
    if (!knowledgeRepo?.hasOwnProperty('id')) {
      setSelectedKnowledgeRepo(knowledgeRepo);
      setShowPopulations(false);
      HashParamUtils.clearCachedValues();
      setLoading(false);
      setMeasures([]);
      setSelectedMeasure('');
      return;
    }

    setSelectedKnowledgeRepo(knowledgeRepo);
    setShowPopulations(false);

    if (HashParamUtils.getAccessCode() && HashParamUtils.getAccessCode() !== '') {
      try {
        setAccessToken(await OAuthHandler.getAccessToken(HashParamUtils.getAccessCode(), knowledgeRepo));
      } catch (error: any) {
        setAccessToken('');
      }

    } else {
      if (knowledgeRepo?.authUrl && knowledgeRepo?.authUrl !== '') {

        //initiate authentication sequence 
        try {
          await OAuthHandler.getAccessCode(knowledgeRepo);
        } catch (error: any) {
          setLoading(false);
          return;
        }
      }
    }
    try {
      setMeasures(await new MeasureFetch(knowledgeRepo.baseUrl).fetchData(accessToken));
    } catch (error: any) {
      setSectionalResults(error.message, Section.KNOWLEDGE_REPO);
    }
    setLoading(false);
  };

  // Function for retrieving the patients from the selected server
  const fetchPatients = async (dataRepo: Server) => {
    setLoading(true);
    resetResults();

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

      const groupFetch = new GroupFetch(dataRepo.baseUrl);

      let groupsMap: Map<string, PatientGroup> = await groupFetch.fetchData(accessToken);

      setPatientGroups(groupsMap);

      const patientFetch = await PatientFetch.createInstance(dataRepo.baseUrl);
      setPatients(await patientFetch.fetchData(accessToken));


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
    if (!selectedMeasureEvaluationServer || selectedMeasureEvaluationServer.baseUrl === '') {
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
    } else if (measureObj.scoring) {
      setMeasureScoringType(measureObj.scoring.coding[0].code);
    }

    const patientGroup: PatientGroup | undefined = patientGroups?.has(selectedMeasure) ? patientGroups.get(selectedMeasure) : undefined;

    if (!selectedPatient && !patientGroup && useSubject) {
      setMeasureEvalResults(Constants.evaluateMeasure_noGroupFound);
      return;
    }

    const evaluateMeasureFetch = new EvaluateMeasureFetch(selectedMeasureEvaluationServer,
      selectedMeasure, startDate, endDate, useSubject, selectedPatient, patientGroup)

    setSectionalResults(Constants.preFetchMessage + evaluateMeasureFetch.getUrl() + '...', Section.MEASURE_EVAL);

    // Set the loading state since this call can take a while to return
    setLoading(true);

    try {
      let evaluateMeasureResult = await evaluateMeasureFetch.fetchData(accessToken);

      if (!evaluateMeasureResult) {
        setSectionalResults('Operation returned with erroneous data structure.', Section.MEASURE_EVAL);
        setShowPopulations(false);
        setLoading(false);
        return;
      }

      // Handle the error case where an OperationOutcome was returned instead of a MeasureReport
      if (evaluateMeasureResult.jsonBody.resourceType === 'OperationOutcome') {
        setResultsCaller('Operation returned with unexpected error:\n\n' + JSON.stringify(evaluateMeasureResult, undefined, 2));
        setShowPopulations(false);
        setLoading(false);
        return;
      } else {
        const retJSON = JSON.stringify(evaluateMeasureResult.jsonBody, undefined, 2);
        setMeasureReport(retJSON);
        setResultsCaller(retJSON);
        // Iterate through the population names to set the state
        const measureGroups: GroupElement[] = evaluateMeasureResult.measureGroups;
        if (!measureGroups) {
          setResultsCaller('Operation returned with unexpected data structure: \n' + evaluateMeasureResult.jsonBody);
          setShowPopulations(false);
          setLoading(false);
          return;
        }

        let populationScoringCollection: PopulationScoring[] = [];

        // //used for testing
        // const scoringConcept: CodeableConcept = {
        //   coding: [{
        //     system: "http://terminology.hl7.org/CodeSystem/measure-scoring",
        //     code: "proportion",
        //     display: "Proportion"
        //   }]
        // };

        for (const group of measureGroups) {
          const groupElement: GroupElement = group;

          populationScoringCollection.push({
            groupID: groupElement.id,
            groupScoring: evaluateMeasureResult.jsonBody.scoring ? evaluateMeasureResult.jsonBody.scoring.coding[0].code : undefined,
            groupPopulations: group.population
          })
        }

        setPopulationScoring(populationScoringCollection);

      }

      // Show the populations
      setShowPopulations(true);

      setLoading(false);
    } catch (error: any) {
      setSectionalResults(error.message, Section.MEASURE_EVAL);
      setLoading(false);
    }
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

    setSectionalResults(Constants.preFetchMessage + dataRequirementsFetch.getUrl() + '...', Section.KNOWLEDGE_REPO);

    try {
      setResultsCaller(await dataRequirementsFetch.fetchData(accessToken));
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
      setSectionalResults(Constants.error_selectMeasureDataCollection, Section.DATA_REPO);
      return;
    }

    const patientGroup: PatientGroup | undefined = patientGroups?.has(selectedMeasure) ? patientGroups.get(selectedMeasure) : undefined;

    if (!selectedPatient && !patientGroup && useSubject) {
      setSectionalResults(Constants.evaluateMeasure_noGroupFound, Section.DATA_REPO);
      return;
    }


    // Set loading to true for spinner
    setLoading(true);


    const collectDataFetch = new CollectDataFetch(selectedDataRepo, selectedMeasure,
      startDate, endDate, useSubject, selectedPatient, patientGroup)

    setSectionalResults(Constants.preFetchMessage + collectDataFetch.getUrl() + '...', Section.DATA_REPO);

    // Call the FHIR server to collect the data
    try {
      const retJSON = await collectDataFetch.fetchData(accessToken);
      setCollectedData(retJSON);
      setResultsCaller(retJSON);
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
    if (!selectedMeasureEvaluationServer) {
      setSectionalResults(Constants.error_measureEvaluationServer, Section.MEASURE_EVAL);
      return;
    }
    if (!selectedMeasure) {
      setSectionalResults(Constants.error_selectMeasureToSubmit, Section.MEASURE_EVAL);
      return;
    }

    // Set loading to true for spinner
    setLoading(true);

    try {
      setResultsCaller(await new SubmitDataFetch(selectedMeasureEvaluationServer,
        selectedMeasure, collectedData).submitData(accessToken));
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
    if (!selectedReceiving) {
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
        measureReport).submitData(accessToken));
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

    // Make sure all required elements are set
    let missingData = '';

    if (!selectedMeasureEvaluationServer || selectedMeasureEvaluationServer.baseUrl === '') {
      missingData = Constants.error_measureEvaluationServer + '\n';
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
      missingData += Constants.error_selectMeasure + '\n';
    }

    //Data Repository server
    if (!selectedDataRepo || selectedDataRepo.baseUrl === '') {
      missingData += Constants.error_selectDataRepository + '\n';
    }

    if (missingData.length > 0) {
      setResultsCaller(missingData);
      return;
    }

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
      setResultsCaller(Constants.evaluateMeasure_noGroupFound);
      return;
    }

    //Now begin processing valid patients in our list:
    const newTestComparatorMap = new Map<Patient, MeasureComparisonManager>();
    setLoading(true);
    clearPopulationCounts();

    if (measureObj) {
      for (const patientEntry of patientCompareList) {
        //patient belongs to this group, proceed:
        const mcMan = new MeasureComparisonManager(patientEntry,
          measureObj,
          selectedMeasureEvaluationServer,
          startDate, endDate,
          accessToken);

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

  return (
    <div className="container">
      <div className="row text-center col-md-11" style={{ marginTop: '20px' }}>
        <div className="text-center col-md-1">
          <img className="d-block mx-auto mb-4" src={logo} alt="ICF Logo" width="72" height="72" />
        </div>
        <div className="text-center col-md-11">
          <h2 style={{ marginTop: '20px' }}>eCQM Testing Tool</h2>
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
        selectedDataRepo={selectedDataRepo} />
      <SectionalResults results={measureEvalResults} />
      <br />
      <ReceivingSystem showReceiving={showReceiving} setShowReceiving={setShowReceiving}
        servers={servers} setSelectedReceiving={setSelectedReceiving}
        selectedReceiving={selectedReceiving}
        postMeasureReport={postMeasureReport} loading={loading}
        setModalShow={setServerModalShow} />
      <SectionalResults results={recSysResults} />
      <br />
      <TestingComparator showTestCompare={showTestCompare} setShowTestCompare={setShowTestCompare}
        items={testComparatorMap} compareTestResults={compareTestResults} loading={loading}
        startDate={startDate} endDate={endDate} selectedDataRepoServer={selectedDataRepo}
        selectedPatientGroup={selectedPatientGroup} selectedMeasureEvaluationServer={selectedMeasureEvaluationServer}
        selectedMeasure={selectedMeasure} selectedKnowledgeRepositoryServer={selectedKnowledgeRepo}
        selectedPatient={selectedPatient} />

      <Results results={results} selectedMeasure={selectedMeasure}
        //Populations now captured within results card:
        populationScoring={populationScoring} showPopulations={showPopulations} measureScoringType={measureScoringType} />

      <br />
      <ServerModal modalShow={serverModalShow} setModalShow={setServerModalShow} createServer={createServer} />

      <LoginModal modalShow={loginModalShow} setModalShow={setLoginModalShow} username={username}
        setUsername={setUsername} password={password} setPassword={setPassword} />
      <br />


      {/* Scroll-to-top button */}
      <button
        onClick={scrollTop}
        style={{
          display: showScrollToTopButton ? 'flex' : 'none',
          position: 'fixed',
          bottom: '10px',
          right: '10px',
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
        }}
      >
        {Constants.upArrow}
      </button>

    </div>
  );
}

export default App;
