import React, { useEffect, useState } from 'react';
import './App.css';
import DataRepository from './components/DataRepository';
import KnowledgeRepository from './components/KnowledgeRepository';
import LoginModal from './components/LoginModal';
import MeasureEvaluation from "./components/MeasureEvaluation";
import Populations from './components/Populations';
import ReceivingSystem from './components/ReceivingSystem';
import ReportingPeriod from './components/ReportingPeriod';
import Results from './components/Results';
import ServerModal from './components/ServerModal';
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
import { Group } from './models/Group';
import { Measure } from './models/Measure';
import { Patient } from './models/Patient';
import { Server } from './models/Server';
import { OAuthHandler } from './oauth/OAuthHandler';
import { HashParamUtils } from './utils/HashParamUtils';
import { ServerUtils } from './utils/ServerUtils';
import TestingComparator from './components/TestingComparator';
import { MeasureComparisonManager } from './utils/MeasureComparisonManager';

const App: React.FC = () => {
  // Define the state variables
  // First define the state for reporting period
  const [startDate, setStartDate] = useState<string>(Constants.defaultStartDate);
  const [endDate, setEndDate] = useState<string>(Constants.defaultEndDate);

  // Then the state for the data repository
  const [servers, setServers] = useState<Array<Server | undefined>>([]);
  const [measures, setMeasures] = useState<Array<Measure | undefined>>([]);
  const [patients, setPatients] = useState<Array<Patient | undefined>>([]);
  const [groups, setGroups] = useState<Map<string, Group> | undefined>(undefined);

  // Selected States
  const [selectedMeasure, setSelectedMeasure] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>(undefined);
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
  const [selectedMeasureEvaluation, setSelectedMeasureEvaluation] = useState<Server>({
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

  // Then set the state for the results
  const [results, setResults] = useState<string>('');

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
  const [initialPopulation, setInitialPopulation] = useState<string>('-');
  const [denominator, setDenominator] = useState<string>('-');
  const [denominatorExclusion, setDenominatorExclusion] = useState<string>('-');
  const [denominatorException, setDenominatorException] = useState<string>('-');
  const [numerator, setNumerator] = useState<string>('-');
  const [numeratorExclusion, setNumeratorExclusion] = useState<string>('-');
  const [measureScoring, setMeasureScoring] = useState<string>('');

  // Saved data
  const [collectedData, setCollectedData] = useState<string>('');
  const [measureReport, setMeasureReport] = useState<string>('');
 

  // Handle OAuth redirect
  const [accessToken, setAccessToken] = useState<string>('');

  const [testComparatorMap, setTestComparatorMap] = useState<Map<Patient, MeasureComparisonManager>>(new Map());


  //tells us when app is busy loading and not to disrupt variable assignment
  const reportErrorToUser = ((source: string, err: any) => {
    const message = err.message;
    setResults(message);
  });



  useEffect(() => {
    HashParamUtils.buildHashParams();

    // Get selected server from session since we will be redirected back to here
    let selectedKnowledgeRepo = sessionStorage.getItem('selectedKnowledgeRepo');
    if (selectedKnowledgeRepo) {
      setSelectedKnowledgeRepo(JSON.parse(selectedKnowledgeRepo));
      // If we got access Code but not token then call fetchMeasures again to finish the workflow
      fetchMeasures(JSON.parse(selectedKnowledgeRepo));
    }

    // Only call to get the servers when the list is empty
    if (servers.length === 0) {
      initializeServers().then(r => {
      });
    }

    // Remove the code from the URL
    HashParamUtils.removeCodeParam();

    // console.log('HashParamUtils.getAccessCode' + ': ' + HashParamUtils.getAccessCode());
    // console.log('HashParamUtils.getGeneratedStateCode' + ': ' + HashParamUtils.getGeneratedStateCode());
    // console.log('HashParamUtils.getStateCode' + ': ' + HashParamUtils.getStateCode());

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
  }

  // Uses the GraphQL API to create a server
  const createServer = async (baseUrl: string, authUrl: string, tokenUrl: string, clientId: string,
    clientSecret: string, scope: string) => {
    try {
      await ServerUtils.createServer(baseUrl, authUrl, tokenUrl, clientId, clientSecret, scope);
      setServers(await ServerUtils.getServerList());
    } catch (error: any) {
      reportErrorToUser('createServer', error);
    }
  }


  // Queries the selected server for the list of measures it has
  const fetchMeasures = async (knowledgeRepo: Server) => {
    resetResults();

    setLoading(true);
    if (!knowledgeRepo || !knowledgeRepo.hasOwnProperty('id')) {
      setSelectedKnowledgeRepo(knowledgeRepo);
      setShowPopulations(false);
      HashParamUtils.clearCachedValues();
      setLoading(false);
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
      reportErrorToUser('fetchMeasures', error);
    }
    setLoading(false);
  };

  // Function for retrieving the patients from the selected server
  const fetchPatients = async (dataRepo: Server) => {
    resetResults();

    setSelectedDataRepo(dataRepo);
    setShowPopulations(false);

    try {
      setLoading(true);
      const groupFetch = new GroupFetch(dataRepo.baseUrl);

      let  groupsMap: Map<string, Group> = await groupFetch.fetchData(accessToken);
      
      setGroups(groupsMap);
      
      const patientFetch = await PatientFetch.createInstance(dataRepo.baseUrl);
      setPatients(await patientFetch.fetchData(accessToken));


    } catch (error: any) {
      reportErrorToUser('fetchPatients', error);
    }
    setLoading(false);
  };

  // Function for calling the server to perform the measure evaluation
  const evaluateMeasure = async () => {
    resetResults();

    // Make sure all required elements are set
    if (!selectedMeasureEvaluation || selectedMeasureEvaluation.baseUrl === '') {
      setResults(Constants.error_measureEvaluationServer);
      return;
    }
    if (selectedMeasure === '') {
      setResults(Constants.error_selectMeasure);
      return;
    }

    // Set the loading state since this call can take a while to return
    setLoading(true);
    clearPopulationCounts();

    // Get the scoring from the selected measure
    for (let measure of measures) {
      if (measure!.name === selectedMeasure) {
        setMeasureScoring(measure!.scoring.coding[0].code);
      }
    }

    const evaluateMeasureFetch = new EvaluateMeasureFetch(selectedMeasureEvaluation,
      selectedPatient, selectedMeasure, startDate, endDate)

    setResults('Calling ' + evaluateMeasureFetch.getUrl());

    try {
      let measureData = await evaluateMeasureFetch.fetchData(accessToken);

      // Handle the error case where an OperationOutcome was returned instead of a MeasureReport
      if (measureData.resourceType === 'OperationOutcome') {
        setResults(JSON.stringify(measureData, undefined, 2));
      } else {
        const retJSON = JSON.stringify(measureData.jsonBody, undefined, 2);
        setMeasureReport(retJSON);
        setResults(retJSON);
        // Iterate through the population names to set the state
        const popNames = measureData.popNames;
        const counts = measureData.counts;
        for (let x = 0; x < popNames.length; x++) {
          if (popNames[x] === 'initial-population') {
            setInitialPopulation(counts[x]);
          } else if (popNames[x] === 'denominator') {
            setDenominator(counts[x]);
          } else if (popNames[x] === 'denominator-exclusion') {
            setDenominatorExclusion(counts[x]);
          } else if (popNames[x] === 'denominator-exception') {
            setDenominatorException(counts[x]);
          } else if (popNames[x] === 'numerator') {
            setNumerator(counts[x]);
          } else if (popNames[x] === 'numerator-exclusion') {
            setNumeratorExclusion(counts[x]);
          }
        }
      }

      // Show the populations
      setShowPopulations(true);

      setLoading(false);
    } catch (error: any) {
      reportErrorToUser('evaluateMeasure', error);
      setLoading(false);
    }
  };

  // Function for calling the server to get the data requirements
  const getDataRequirements = async () => {
    resetResults();

    setShowPopulations(false);

    // Make sure all required elements are set
    if (!selectedKnowledgeRepo || selectedKnowledgeRepo.baseUrl === '') {
      setResults(Constants.error_selectKnowledgeRepository);
      return;
    }
    if (selectedMeasure === '') {
      setResults(Constants.error_selectMeasureDR);
      return;
    }

    // Set the loading state since this call can take a while to return
    setLoading(true);

    // Build the data requirements URL based on the options selected
    const dataRequirementsFetch = new DataRequirementsFetch(selectedKnowledgeRepo,
      selectedMeasure, startDate, endDate)

    let message = 'Calling ' + dataRequirementsFetch.getUrl() + '...';
    setResults(message);

    try {
      setResults(await dataRequirementsFetch.fetchData(accessToken));
      setLoading(false);
    } catch (error: any) {
      reportErrorToUser('getDataRequirements', error);
      setLoading(false);
    }

  };

  // Function for calling the server to collect the data for a measure
  const collectData = async () => {
    resetResults();

    setShowPopulations(false);

    // Make sure all required elements are set
    if (!selectedDataRepo || selectedDataRepo.baseUrl === '') {
      setResults(Constants.error_selectDataRepository);
      return;
    }
    if (selectedMeasure === '') {
      setResults(Constants.error_selectMeasureDataCollection);
      return;
    }

    // Set loading to true for spinner
    setLoading(true);


    const collectDataFetch = new CollectDataFetch(selectedDataRepo, selectedMeasure,
      startDate, endDate, selectedPatient)

    let message = 'Calling ' + collectDataFetch.getUrl() + '...';
    setResults(message);

    // Call the FHIR server to collect the data
    try {
      const retJSON = await collectDataFetch.fetchData(accessToken);
      setCollectedData(retJSON);
      setResults(retJSON);
      setLoading(false);
    } catch (error: any) {
      reportErrorToUser('collectData', error);
      setLoading(false);
    }

  };

  // Function for calling the server to submit the data for a measure
  const submitData = async () => {
    resetResults();

    setShowPopulations(false);

    // Make sure all required elements are set
    if (!selectedMeasureEvaluation) {
      setResults(Constants.error_measureEvaluationServer);
      return;
    }
    if (!selectedMeasure) {
      setResults(Constants.error_selectMeasureToSubmit);
      return;
    }

    // Set loading to true for spinner
    setLoading(true);

    try {
      setResults(await new SubmitDataFetch(selectedMeasureEvaluation,
        selectedMeasure, collectedData).submitData(accessToken));
      setLoading(false);
    } catch (error: any) {
      reportErrorToUser('submitData', error);
      setLoading(false);
    }
  };

  // Function for posting the measure report to the receiving server
  const postMeasureReport = async () => {
    resetResults();

    setShowPopulations(false);

    // Make sure all required elements are set
    if (!selectedReceiving) {
      setResults(Constants.error_receivingSystemServer);
      return;
    }
    if (!measureReport) {
      setResults(Constants.error_generateMeasureReport);
      return;
    }

    // Set loading to true for spinner
    setLoading(true);

    try {
      setResults(await new PostMeasureReportFetch(selectedReceiving,
          measureReport).submitData(accessToken));
      setLoading(false);
    } catch (error: any) {
      reportErrorToUser('postMeasure', error);
      setLoading(false);
    }
  };

  // Function for clearing all population counts
  const clearPopulationCounts = () => {
    setInitialPopulation('-');
    setDenominator('-');
    setDenominatorException('-');
    setDenominatorExclusion('-');
    setNumerator('-');
    setNumeratorExclusion('-');
    resetResults();
    setShowPopulations(false);
  }

  // This function acts a lot like evaluateMeasure, except after evaluating our measure,
  // a MeasureReport based on the subject ('Patient/' + selectedPatient.id) is fetched. 

  const compareTestResults = async () => {
    resetResults();
    setTestComparatorMap(new Map<Patient, MeasureComparisonManager>());

    // Make sure all required elements are set
    if (!selectedMeasureEvaluation || selectedMeasureEvaluation.baseUrl === '') {
      setResults(Constants.error_measureEvaluationServer);
      return;
    }


    //Establish the Measure first
    let measureObj: Measure | undefined;
    if (selectedMeasure !== '') {
      for (let measure of measures) {
        if (measure!.name === selectedMeasure) {
          measureObj = measure;
        }
      }
    }
    if (!measureObj) {
      setResults(Constants.error_selectMeasure);
      return;
    }


    //no patient was selected, verify the data repo was set:
    if (!selectedPatient) {

      //if data repo isn't set then spit an error
      if (!selectedDataRepo || selectedDataRepo.baseUrl === '') {
        setResults(Constants.error_selectDataRepository);
        return;
      }


      //data repo was selected so patients will contain list of Patient
      setLoading(true);
      const newTestComparatorMap = new Map<Patient, MeasureComparisonManager>();
      
      clearPopulationCounts();

      //loop through the patient list, verify it belongs to a measure's group before processing it
      for (const patientEntry of patients) {

        if (groups && groups.has(selectedMeasure)) {

          const selectedMeasureGroup: Group | undefined = groups.get(selectedMeasure);

          if (selectedMeasureGroup?.member) {
            for (const member of selectedMeasureGroup.member) {
              if (member.entity.reference.split('Patient/')[1] === patientEntry?.id) {
                //patient belongs to this group, proceed:
                const mcMan = new MeasureComparisonManager(patientEntry,
                  measureObj,
                  selectedMeasureEvaluation,
                  startDate, endDate,
                  accessToken);

                await mcMan.fetchGroups();
                const patientDisplayKey = '' + patientEntry?.display;
                if (patientDisplayKey.length > 0) {
                  newTestComparatorMap.set(patientEntry, mcMan);
                }
              }
            }
          }
          setTestComparatorMap(newTestComparatorMap);
        }
      }

      setResults('');
      setLoading(false);

    } else {//process single selectedPatient
      setLoading(true);
      const newTestComparatorMap = new Map<Patient, MeasureComparisonManager>();

      clearPopulationCounts();


      const mcMan = new MeasureComparisonManager(selectedPatient,
        measureObj,
        selectedMeasureEvaluation,
        startDate, endDate,
        accessToken);

      await mcMan.fetchGroups();

      newTestComparatorMap.set(selectedPatient, mcMan);


      setTestComparatorMap(newTestComparatorMap);
      setResults('');
      setLoading(false);
    }



  };

  return (
    <div className="container">
      <div className="row">
        <div className="py-5 text-center col-md-1">
          <img className="d-block mx-auto mb-4" src={logo} alt="ICF Logo" width="72" height="72" />
        </div>
        <div className="py-5 text-center col-md-11">
          <h2>eCQM Testing Tool</h2>
        </div>
      </div>
      <ReportingPeriod startDate={startDate} endDate={endDate} setStartDate={setStartDate} setEndDate={setEndDate} />
      <br />
      <KnowledgeRepository showKnowledgeRepo={showKnowledgeRepo} setShowKnowledgeRepo={setShowKnowledgeRepo}
        servers={servers} fetchMeasures={fetchMeasures}
        selectedKnowledgeRepo={selectedKnowledgeRepo}
        measures={measures} setSelectedMeasure={setSelectedMeasure}
        selectedMeasure={selectedMeasure}
        getDataRequirements={getDataRequirements} loading={loading}
        setModalShow={setServerModalShow} />
      <br />
      <DataRepository showDataRepo={showDataRepo} setShowDataRepo={setShowDataRepo} servers={servers}
        selectedDataRepo={selectedDataRepo} patients={patients}
        fetchPatients={fetchPatients} setSelectedPatient={setSelectedPatient}
        selectedPatient={selectedPatient}
        collectData={collectData} loading={loading} setModalShow={setServerModalShow} 
        selectedMeasure={selectedMeasure}
        groups={groups}/>
      <br />
      <MeasureEvaluation showMeasureEvaluation={showMeasureEvaluation} setShowMeasureEvaluation={setShowMeasureEvaluation}
                         servers={servers} setSelectedMeasureEvaluation={setSelectedMeasureEvaluation}
                         selectedMeasureEvaluation={selectedMeasureEvaluation} submitData={submitData}
                         evaluateMeasure={evaluateMeasure} loading={loading} setModalShow={setServerModalShow} />
      <br />
      <ReceivingSystem showReceiving={showReceiving} setShowReceiving={setShowReceiving}
        servers={servers} setSelectedReceiving={setSelectedReceiving}
        selectedReceiving={selectedReceiving}
        postMeasureReport={postMeasureReport} loading={loading}
        setModalShow={setServerModalShow} />

      <br />
      <TestingComparator showTestCompare={showTestCompare} setShowTestCompare={setShowTestCompare} items={testComparatorMap} compareTestResults={compareTestResults} loading={loading} />

      <Results results={results} />
      <Populations initialPopulation={initialPopulation} denominator={denominator}
        denominatorExclusion={denominatorExclusion} denominatorException={denominatorException}
        numerator={numerator} numeratorExclusion={numeratorExclusion} showPopulations={showPopulations}
        measureScoring={measureScoring} />
      <br />
      <ServerModal modalShow={serverModalShow} setModalShow={setServerModalShow} createServer={createServer} />
      
      <LoginModal modalShow={loginModalShow} setModalShow={setLoginModalShow} username={username}
        setUsername={setUsername} password={password} setPassword={setPassword} />
      <br />
    </div>
  );
}

export default App;
