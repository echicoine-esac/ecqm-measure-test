import React, {useState} from 'react';
import logo from './icf_logo.png';
import './App.css';
import ReportingPeriod from "./components/ReportingPeriod";
import DataRepository from "./components/DataRepository";
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
  const [serverUrls] = useState<Array<string>>(['http://localhost:8080/fhir/',
    'https://cloud.alphora.com/sandbox/r4/cqm/fhir/',
    'https://cqf-ruler.ecqm.icfcloud.com/fhir/']);
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [measures, setMeasures] = useState<Array<string>>([]);
  const [patients, setPatients] = useState<Array<string>>([]);
  const [selectedMeasure, setSelectedMeasure] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<string>('');

  // Then set the state for the results
  const [results, setResults] = useState<string>('');

  //  set a state for loading
  const [loading, setLoading] = useState<boolean>(false);

  // Population states
  const [initialPopulation, setInitialPopulation] = useState<string>('-');
  const [denominator, setDenominator] = useState<string>('-');
  const [denominatorExclusion, setDenominatorExclusion] = useState<string>('-');
  const [denominatorException, setDenominatorException] = useState<string>('-');
  const [numerator, setNumerator] = useState<string>('-');
  const [numeratorExclusion, setNumeratorExclusion] = useState<string>('-');

  // Function for retrieving the measures from the selected server
  const fetchMeasures = (url: string) => {
    setSelectedServer(url);

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

      fetchPatients(url);
  };

  // Function for retrieving the patients from the selected server
  const fetchPatients = (url: string) => {
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
    if (selectedServer === '') {
      setResults('Please select a Test server to use');
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
      Url = selectedServer + 'Measure/' + selectedMeasure +
        '/$evaluate-measure?periodStart=' + startDate +
        '&periodEnd=' + endDate + '&reportType=subject-list';
    } else {
      Url = selectedServer + 'Measure/' + selectedMeasure +
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
     })
    .catch((error) => {
      let message = 'Calling ' + Url + ' caused ' + error;
      setResults(message);
      // Clear the loading state
      setLoading(false);
    })
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
      <DataRepository serverUrls={serverUrls} setSelectedServer={setSelectedServer} measures={measures}
        patients={patients} fetchMeasures={fetchMeasures} setSelectedMeasure={setSelectedMeasure}
        setSelectedPatient={setSelectedPatient} evaluateMeasure={evaluateMeasure} loading={loading}/>
      <Results results={results}/>
      <Populations initialPopulation={initialPopulation} denominator={denominator}
        denominatorExclusion={denominatorExclusion} denominatorException={denominatorException}
        numerator={numerator} numeratorExclusion={numeratorExclusion}/>
    </div>
  );
}

export default App;
