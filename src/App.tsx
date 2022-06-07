import React, { useState } from 'react';
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

const App: React.FC = () => {
  // Define the state variables
  // First define the state for reporting period
  const [startDate, setStartDate] = useState<string>(Constants.defaultStartDate);
  const [endDate, setEndDate] = useState<string>(Constants.defaultEndDate);

  // Then the state for the data repository
  const [serverUrls] = useState<Array<string>>(Constants.getServerUrls());

  const [selectedServer, setSelectedServer] = useState<string>('');
  const [measures, setMeasures] = useState<Array<Measure | undefined>>([]);
  const [patients, setPatients] = useState<Array<string>>([]);

  // Selected States
  const [selectedMeasure, setSelectedMeasure] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [selectedKnowledgeRepo, setSelectedKnowledgeRepo] = useState<string>('');
  const [selectedDataRepo, setSelectedDataRepo] = useState<string>('');
  const [selectedReceiving, setSelectedReceiving] = useState<string>('');

  // Then set the state for the results
  const [results, setResults] = useState<string>('');

  // Show states
  const [loading, setLoading] = useState<boolean>(false);
  const [showKnowledgeRepo, setShowKnowledgeRepo] = useState<boolean>(true);
  const [showDataRepo, setShowDataRepo] = useState<boolean>(false);
  const [showReceiving, setShowReceiving] = useState<boolean>(false);
  const [showPopulations, setShowPopulations] = useState<boolean>(false);

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

  const fetchMeasures = async (url: string) => {
    setSelectedKnowledgeRepo(url);
    setShowPopulations(false);

    try {
      setMeasures(await new MeasureFetch(url).fetchData())
    } catch (error: any) {
      setResults(error.message);
    }
  };

  // Function for retrieving the patients from the selected server
  const fetchPatients = async (url: string) => {
    setSelectedDataRepo(url);
    setShowPopulations(false);

    try {
      setPatients(await new PatientFetch(url).fetchData())
    } catch (error: any) {
      setResults(error.message);
    }
  };

  // Function for calling the server to perform the measure evaluation
  const evaluateMeasure = async () => {
    // Make sure all required elements are set
    if (selectedReceiving === '') {
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
      for (var i = 0; i < popNames.length; i++) {
        if (popNames[i] === 'initial-population') {
          setInitialPopulation(counts[i]);
        } else if (popNames[i] === 'denominator') {
          setDenominator(counts[i]);
        } else if (popNames[i] === 'denominator-exclusion') {
          setDenominatorExclusion(counts[i]);
        } else if (popNames[i] === 'denominator-exception') {
          setDenominatorException(counts[i]);
        } else if (popNames[i] === 'numerator') {
          setNumerator(counts[i]);
        } else if (popNames[i] === 'numerator-exclusion') {
          setNumeratorExclusion(counts[i]);
        }
      }
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
    if (selectedKnowledgeRepo === '') {
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
    if (selectedDataRepo === '') {
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
    if (selectedReceiving === '') {
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
        serverUrls={serverUrls} fetchMeasures={fetchMeasures} selectedKnowledgeRepo={selectedKnowledgeRepo}
        measures={measures} setSelectedMeasure={setSelectedMeasure} selectedMeasure={selectedMeasure}
        getDataRequirements={getDataRequirements} loading={loading} />
      <br />
      <DataRepository showDataRepo={showDataRepo} setShowDataRepo={setShowDataRepo} serverUrls={serverUrls}
        setSelectedDataRepo={setSelectedDataRepo} selectedDataRepo={selectedDataRepo} patients={patients}
        fetchPatients={fetchPatients} setSelectedPatient={setSelectedPatient} selectedPatient={selectedPatient}
        collectData={collectData} loading={loading} />
      <br />
      <ReceivingSystem showReceiving={showReceiving} setShowReceiving={setShowReceiving}
        serverUrls={serverUrls} setSelectedReceiving={setSelectedReceiving} selectedReceiving={selectedReceiving}
        submitData={submitData} evaluateMeasure={evaluateMeasure} loading={loading} />
      <Results results={results} />
      <Populations initialPopulation={initialPopulation} denominator={denominator}
        denominatorExclusion={denominatorExclusion} denominatorException={denominatorException}
        numerator={numerator} numeratorExclusion={numeratorExclusion} showPopulations={showPopulations}
        measureScoring={measureScoring} />
      <br />
    </div>
  );
}

export default App;
