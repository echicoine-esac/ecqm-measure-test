import React, {useState} from 'react';
import logo from './icf_logo.png';
import './App.css';
import ReportingPeriod from "./components/ReportingPeriod";
import KnowledgeRepository from "./components/KnowledgeRepository";
import DataRepository from "./components/DataRepository";
import ReceivingSystem from "./components/ReceivingSystem";
import Results from "./components/Results";
import Populations from "./components/Populations";
import {BundleEntry} from './models/BundleEntry';
import {MeasureReportGroup} from './models/MeasureReportGroup';
import {Population} from './models/Population';

const App: React.FC = () => {
  // Define the state variables
  // First define the state for reporting period
  const [startDate, setStartDate] = useState<string>('2019-01-01');
  const [endDate, setEndDate] = useState<string>('2019-12-31');

  // Then the state for the data repository
  const [serverUrls] = useState<Array<string>>(['https://cloud.alphora.com/sandbox/r4/cqm/fhir/',
    'https://cqf-ruler.ecqm.icfcloud.com/fhir/']);
  const [measures, setMeasures] = useState<Array<string>>([]);
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

  // Saved data
  const [collectedData, setCollectedData] = useState<string>('');

  // Function for retrieving the measures from the selected server
  const fetchMeasures = (url: string) => {
    setSelectedKnowledgeRepo(url);
    setShowPopulations(false);

    // Fetch all the Measures from the selected server
    fetch(url + 'Measure?_count=200')
      .then((response) => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response.json()
      })
      .then((data) => {
        let entries = data.entry;
        let measureIds = entries.map((entry: BundleEntry) => {
          return entry.resource.id
        });
        setMeasures(measureIds);
      })
      .catch((error) => {
        let message = 'Calling ' + url + 'Measure caused ' + error;
        setResults(message);
      })
  };

  // Function for retrieving the patients from the selected server
  const fetchPatients = (url: string) => {
    setSelectedDataRepo(url);
    setShowPopulations(false);

    // Fetch all the Patients from the selected server
    fetch(url + 'Patient?_count=200')
      .then((response) => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response.json()
      })
      .then((data) => {
        let entries = data.entry;
        let patientIds = entries.map((entry: BundleEntry) => {
          return entry.resource.id
        });
        setPatients(patientIds);
      })
      .catch((error) => {
        let message = 'Calling ' + url + 'Patient caused ' + error;
        setResults(message);
      })
  };

  // Function for calling the server to perform the measure evaluation
  const evaluateMeasure = async() => {
    // Make sure all required elements are set
    if (selectedReceiving === '') {
      setResults('Please select a Receiving System server to use');
      return;
    }
    if (selectedMeasure === '') {
      setResults('Please select a Measure to evaluate');
      return;
    }

    // Set the loading state since this call can take a while to return
    setLoading(true);
    clearPopulationCounts();

    // Build the evaluate measure URL based on the options selected
    let Url = '';
    if (selectedPatient === '') {
      Url = selectedReceiving + 'Measure/' + selectedMeasure +
        '/$evaluate-measure?periodStart=' + startDate +
        '&periodEnd=' + endDate + '&reportType=subject-list';
    } else {
      Url = selectedReceiving + 'Measure/' + selectedMeasure +
        '/$evaluate-measure?subject=' + selectedPatient + '&periodStart=' +
        startDate + '&periodEnd=' + endDate;
    }

    let message = 'Calling ' + Url + '...';
    setResults(message);

    // Fetch the data by calling the API and use callback to reflect state properly
    fetch(Url)
      .then((response) => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response.json()
      })
     .then((data) => {
     setResults(JSON.stringify(data, undefined, 2));
       let groups = data.group;
       let populations = groups.map((group: MeasureReportGroup) => {
         return group.population;
       });
       let pop = populations[0];
       let popNames = pop.map((pop: Population) => {
          return pop.code.coding[0].code;
       });
       let counts = pop.map((pop: Population) => {
         return pop.count;
       });

       // Iterate through the population names to set the state
       for (var i=0; i< popNames.length; i++) {
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

       // Clear the loading state
       setLoading(false);

       // Show the populations
       setShowPopulations(true);
     })
    .catch((error) => {
      let message = 'Calling ' + Url + ' caused ' + error;
      setResults(message);
      // Clear the loading state
      setLoading(false);
    })
  };

  // Function for calling the server to get the data requirements
  const getDataRequirements = async() => {
    setShowPopulations(false);

    // Make sure all required elements are set
    if (selectedKnowledgeRepo === '') {
      setResults('Please select a Knowledge Repository server to use');
      return;
    }
    if (selectedMeasure === '') {
      setResults('Please select a Measure to get the data requirements for');
      return;
    }

    // Set the loading state since this call can take a while to return
    setLoading(true);

    // Build the data requirements URL based on the options selected
    let Url = selectedKnowledgeRepo + 'Measure/' + selectedMeasure +
      '/$data-requirements?periodStart=' + startDate + '&periodEnd=' + endDate;

    let message = 'Calling ' + Url + '...';
    setResults(message);

    // Call the FHIR server to get the data requirements
    fetch(Url)
     .then((response) => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response.json()
      })
     .then((data) => {
       setResults(JSON.stringify(data, undefined, 2));
       setLoading(false);
     })
     .catch((error) => {
       var message = 'Calling ' + Url + ' caused ' + error;
       setResults(message);
       setLoading(false);
     });
    };

  // Function for calling the server to collect the data for a measure
  const collectData = async() => {
    setShowPopulations(false);

    // Make sure all required elements are set
    if (selectedDataRepo === '') {
      setResults('Please select a Data Repository server to use');
      return;
    }
    if (selectedMeasure === '') {
      setResults('Please select a Measure to collect the data for');
      return;
    }

    // Set loading to true for spinner
    setLoading(true);

    // Build the collect data URL based on the options selected
    let Url = selectedDataRepo + 'Measure/' + selectedMeasure +
      '/$collect-data?periodStart=' + startDate + '&periodEnd=' + endDate;

    if (selectedPatient !== '') {
      Url = Url + '&subject=' + selectedPatient;
    }

    let message = 'Calling ' + Url + '...';
    setResults(message);

    // Call the FHIR server to collect the data
    fetch(Url)
     .then((response) => {
       if (!response.ok) {
         throw Error(response.statusText);
       }
       return response.json()
     })
     .then((data) => {
       setCollectedData(JSON.stringify(data, undefined, 2));
       setResults(JSON.stringify(data, undefined, 2));
       setLoading(false);
     })
    .catch((error) => {
      var message = 'Calling ' + Url + ' caused ' + error;
      setResults(message);
      setLoading(false);
    });
  };

  // Function for calling the server to submit the data for a measure
  const submitData = async() => {
    setShowPopulations(false);
    
    // Make sure all required elements are set
    if (selectedReceiving === '') {
      setResults('Please select a Receiving System server to use');
      return;
    }
    if (selectedMeasure === '') {
      setResults('Please select a Measure to submit the data for');
      return;
    }

    // Set loading to true for spinner
    setLoading(true);

    // Build the submit data URL based on the options selected
    let Url = selectedReceiving + 'Measure/' + selectedMeasure + '/$submit-data';

    let message = 'Calling ' + Url + '...';
    setResults(message);

    //Set the collected data as the payload
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/fhir+json' },
      body: JSON.stringify(collectedData)
    };

    // Call the FHIR server to submit the data
    fetch(Url, requestOptions)
     .then((response) => {
       if (!response.ok) {
         throw Error(response.statusText);
       }
       return response.json()
       })
     .then((data) => {
       setResults("Data Submitted");
       setLoading(false);
     })
     .catch((error) => {
       var message = 'Calling ' + Url + ' caused ' + error;
       setResults(message);
       setLoading(false);
     });
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
          <img className="d-block mx-auto mb-4" src={logo} alt="ICF Logo" width="72" height="72"/>
        </div>
        <div className="py-5 text-center col-md-11">
          <h2>eCQM Testing Tool</h2>
        </div>
      </div>
      <ReportingPeriod startDate={startDate} endDate={endDate} setStartDate={setStartDate} setEndDate={setEndDate}/>
      <br/>
      <KnowledgeRepository showKnowledgeRepo={showKnowledgeRepo} setShowKnowledgeRepo={setShowKnowledgeRepo}
        serverUrls={serverUrls} fetchMeasures={fetchMeasures} measures={measures}
        setSelectedMeasure={setSelectedMeasure} getDataRequirements={getDataRequirements} loading={loading}/>
      <br/>
      <DataRepository showDataRepo={showDataRepo} setShowDataRepo={setShowDataRepo} serverUrls={serverUrls}
        setSelectedDataRepo={setSelectedDataRepo} patients={patients}
        fetchPatients={fetchPatients} setSelectedPatient={setSelectedPatient} collectData={collectData}
        loading={loading}/>
      <br/>
      <ReceivingSystem showReceiving={showReceiving} setShowReceiving={setShowReceiving}
        serverUrls={serverUrls} setSelectedReceiving={setSelectedReceiving} submitData={submitData}
        evaluateMeasure={evaluateMeasure} loading={loading}/>
      <Results results={results}/>
      <Populations initialPopulation={initialPopulation} denominator={denominator}
        denominatorExclusion={denominatorExclusion} denominatorException={denominatorException}
        numerator={numerator} numeratorExclusion={numeratorExclusion} showPopulations={showPopulations}/>
    </div>
  );
}

export default App;
