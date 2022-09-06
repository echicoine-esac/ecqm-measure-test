import React, {useEffect, useState} from 'react';
import './App.css';
import DataRepository from "./components/DataRepository";
import KnowledgeRepository from './components/KnowledgeRepository';
import Populations from "./components/Populations";
import ReceivingSystem from './components/ReceivingSystem';
import ReportingPeriod from "./components/ReportingPeriod";
import Results from "./components/Results";
import { Constants } from './constants/Constants';
import { CollectDataFetch } from './data/CollectDataFetch';
import { DataRequirementsFetch } from './data/DataRequirementsFetch';
import { EvaluateMeasureFetch } from './data/EvaluateMeasureFetch';
import { MeasureFetch } from './data/MeasureFetch';
import { PatientFetch } from './data/PatientFetch';
import { SubmitDataFetch } from './data/SubmitDataFetch';
import logo from './icf_logo.png';
import { Measure } from './models/Measure';
import { MeasureData } from './models/MeasureData';
import { Server } from "./models/Server";
import { Amplify, API } from 'aws-amplify';
import { listServers } from './graphql/queries';
import { createServers, deleteServers } from "./graphql/mutations";
import awsExports from "./aws-exports";
import {CreateServersInput} from "./API";
import ServerModal from "./components/ServerModal";
import { ServerUtils } from './utils/ServerUtils';

Amplify.configure(awsExports);

const App: React.FC = () => {
  // Define the state variables
  // First define the state for reporting period
  const [startDate, setStartDate] = useState<string>(Constants.defaultStartDate);
  const [endDate, setEndDate] = useState<string>(Constants.defaultEndDate);

  // Then the state for the data repository
  const [servers, setServers] = useState<Array<Server | undefined>>([]);
  const [measures, setMeasures] = useState<Array<Measure | undefined>>([]);
  const [patients, setPatients] = useState<Array<string>>([]);

  // Selected States
  const [selectedMeasure, setSelectedMeasure] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<string>('');
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
  const [showReceiving, setShowReceiving] = useState<boolean>(false);
  const [showPopulations, setShowPopulations] = useState<boolean>(false);
  const [modalShow, setModalShow] = useState<boolean>(false);

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

  useEffect(() => {
    ServerUtils.getServerList().then(res => {
      setServers(res!);
    });
  }, []);


  // Uses the GraphQL API to create a server
  const createServer = async (baseUrl: string, authUrl: string, tokenUrl: string, clientId: string,
                              clientSecret: string, scope: string) => {
    try {
      let serverInput: CreateServersInput = {
        baseUrl: baseUrl
      };
      if (authUrl !== '') {
        serverInput.authUrl = authUrl;
        serverInput.callbackUrl = 'http://localhost/callback';
      }
      if (tokenUrl !== '') {
        serverInput.tokenUrl = tokenUrl;
      }
      if (clientId !== '') {
        serverInput.clientID = clientId;
      }
      if (clientSecret !== '') {
        serverInput.clientSecret = clientSecret;
      }
      if (scope !== '') {
        serverInput.scope = scope;
      }
      await API.graphql({query: createServers, authMode: "API_KEY", variables: {input: serverInput}})
    } catch (err) { console.log('error creating server', err) }

    // If we added a server then we should fetch the list again
    await ServerUtils.getServerList();
  }

  const fetchMeasures = async (knowledgeRepo: Server) => {
    setSelectedKnowledgeRepo(knowledgeRepo);
    setShowPopulations(false);

    try {
      setMeasures(await new MeasureFetch(knowledgeRepo.baseUrl).fetchData())
    } catch (error: any) {
      setResults(error.message);
    }
  };

  // Function for retrieving the patients from the selected server
  const fetchPatients = async (dataRepo: Server) => {
    setSelectedDataRepo(dataRepo);
    setShowPopulations(false);

    try {
      setPatients(await new PatientFetch(dataRepo.baseUrl).fetchData())
    } catch (error: any) {
      setResults(error.message);
    }
  };

  // Function for calling the server to perform the measure evaluation
  const evaluateMeasure = async () => {
    // Make sure all required elements are set
    if (!selectedReceiving || selectedReceiving.baseUrl === '') {
      setResults(Constants.error_receivingSystemServer);
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

    for (var i = 0; i < measures.length; i++) {
      if (measures[i]!.name === selectedMeasure) {
        setMeasureScoring(measures[i]!.scoring.coding[0].code);
      }
    }

    const evaluateMeasureFetch = new EvaluateMeasureFetch(selectedReceiving,
      selectedPatient, selectedMeasure, startDate, endDate)

    setResults('Calling ' + evaluateMeasureFetch.getUrl());

    try {
      let measureData: MeasureData = await evaluateMeasureFetch.fetchData();
      setResults(JSON.stringify(measureData.jsonBody, undefined, 2));
      // Iterate through the population names to set the state
      const popNames = measureData.popNames;
      const counts = measureData.counts;
      for (var x = 0; x < popNames.length; x++) {
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

      // Show the populations
      setShowPopulations(true);

      setLoading(false);
    } catch (error: any) {
      setResults(error.message);
      setLoading(false);
    }
  };

  // Function for calling the server to get the data requirements
  const getDataRequirements = async () => {
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
      setResults(await dataRequirementsFetch.fetchData());
      setLoading(false);
    } catch (error: any) {
      setResults(error.message);
      setLoading(false);
    }

  };

  // Function for calling the server to collect the data for a measure
  const collectData = async () => {
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
      const retJSON = await collectDataFetch.fetchData();
      setCollectedData(retJSON);
      setResults(retJSON);
      setLoading(false);
    } catch (error: any) {
      setResults(error.message);
      setLoading(false);
    }

  };

  // Function for calling the server to submit the data for a measure
  const submitData = async () => {
    setShowPopulations(false);

    // Make sure all required elements are set
    if (!selectedReceiving) {
      setResults(Constants.error_selectReceivingSystemServer);
      return;
    }
    if (!selectedMeasure) {
      setResults(Constants.error_selectMeasureToSubmit);
      return;
    }

    // Set loading to true for spinner
    setLoading(true);


    try {
      setResults(await new SubmitDataFetch(selectedReceiving,
        selectedMeasure, collectedData).submitData());
      setLoading(false);
    } catch (error: any) {
      setResults(error.message);
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
    setResults('');
  }

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
        servers={servers} fetchMeasures={fetchMeasures} selectedKnowledgeRepo={selectedKnowledgeRepo}
        measures={measures} setSelectedMeasure={setSelectedMeasure} selectedMeasure={selectedMeasure}
        getDataRequirements={getDataRequirements} loading={loading} setModalShow={setModalShow}/>
      <br />
      <DataRepository showDataRepo={showDataRepo} setShowDataRepo={setShowDataRepo} servers={servers}
        setSelectedDataRepo={setSelectedDataRepo} selectedDataRepo={selectedDataRepo} patients={patients}
        fetchPatients={fetchPatients} setSelectedPatient={setSelectedPatient} selectedPatient={selectedPatient}
        collectData={collectData} loading={loading} />
      <br />
      <ReceivingSystem showReceiving={showReceiving} setShowReceiving={setShowReceiving}
        servers={servers} setSelectedReceiving={setSelectedReceiving} selectedReceiving={selectedReceiving}
        submitData={submitData} evaluateMeasure={evaluateMeasure} loading={loading} />
      <Results results={results} />
      <Populations initialPopulation={initialPopulation} denominator={denominator}
        denominatorExclusion={denominatorExclusion} denominatorException={denominatorException}
        numerator={numerator} numeratorExclusion={numeratorExclusion} showPopulations={showPopulations}
        measureScoring={measureScoring} />
      <br />
      <ServerModal modalShow={modalShow} setModalShow={setModalShow} createServer={createServer}/>
    </div>
  );
}

export default App;
