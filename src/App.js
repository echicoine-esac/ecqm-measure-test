import React, {Component} from 'react';
import {Form} from 'react-bootstrap';
import logo from './icf_logo.png';

// eCQM Testing Tool
class App extends Component {

  constructor(props) {
    super(props);

      // Setup the state variables that will need to record everything happening
      this.state = {
        measures: [],
        serverUrls: ['https://cloud.alphora.com/sandbox/r4/cqm/fhir/',
		'https://cqf-ruler.ecqm.icfcloud.com/fhir/'],
        patients: [],
        selectedServer: '',
        selectedMeasure: '',
        selectedPatient: '',
        startDate: '2019-01-01',
        endDate: '2019-12-31',
        results: '',
        loading: false,
        initialPopulation: '-',
        denominator: '-',
        denominatorExclusion: '-',
        denominatorException: '-',
        numerator: '-',
        numeratorExclusion: '-'
      };

      // Bind the functions used as callbacks so they have access to set state
      this.fetchData = this.fetchData.bind(this);
      this.setMeasure = this.setMeasure.bind(this);
      this.setPatient = this.setPatient.bind(this);
      this.setStartDate = this.setStartDate.bind(this);
      this.setEndDate = this.setEndDate.bind(this);
      this.logResults = this.logResults.bind(this);
      this.evaluateMeasure = this.evaluateMeasure.bind(this);
      this.clearPopulationCounts = this.clearPopulationCounts.bind(this);
  }

  logResults(message) {
    this.setState({ results: message });
  }

  // Fetches the data from the selected server to populate the other options
  // This is called by the selection of the server from the dropdown
  fetchData(e) {
    let value = e.target.value;

    // Save the server selected
    this.setState({ selectedServer: value });

    // Fetch all the Measures from the selected server
    fetch(value + 'Measure?_count=200')
      .then((response) => {
         if(!response.ok) throw new Error(response.status);
         else return response.json();
      })
      .then((data) => {
        let entries = data.entry;
        let measureIds = entries.map(entry => {
            return entry.resource.id
        });
        this.setState({ measures: measureIds})
      })
      .catch((error) => {
        let message = 'Calling ' + value + 'Measure caused ' + error;
        this.setState({ results: message });
      });

    // Fetch all the Patients from the selected server
    fetch(value + 'Patient?_count=200')
      .then((response) => {
         if(!response.ok) throw new Error(response.status);
         else return response.json();
      })
      .then((data) => {
        let entries = data.entry;
        let patientIds = entries.map(entry => {
            return entry.resource.id
        });
        this.setState({ patients: patientIds})
      })
      .catch((error) => {
        let message = 'Calling ' + value + 'Patient caused ' + error;
        this.setState({ results: message });
      });
  }

  // Sets the selected Measure state
  setMeasure(e) {
    let value = e.target.value;
    this.setState({ selectedMeasure: value });
  }

  // Sets the selected Patient state
  setPatient(e) {
    let value = e.target.value;
    this.setState({ selectedPatient: value });
  }

  // Sets the start date for the measure evaluation
  setStartDate(e) {
    let value = e.target.value;
    this.setState({ startDate: value });
  }

  // Sets the end date for the measure evaluation
  setEndDate(e) {
    let value = e.target.value;
    this.setState({ endDate: value });
  }

  clearPopulationCounts() {
    this.setState({ initialPopulation: '-' });
    this.setState({ denominator: '-' });
    this.setState({ denominatorExclusion: '-' });
    this.setState({ denominatorException: '-' });
    this.setState({ numerator: '-' });
    this.setState({ numeratorExclusion: '-' });
    this.setState({ results: '' });
  }

  // Calls the FHIR test server to evaluate the selected measure with the given period and patient if provided
  // This is called by the Evaluate Measure Button being clicked
  evaluateMeasure() {
    // Handle error conditions if they have not selected a server or measure
    if (this.state.selectedServer === '') {
        this.logResults('Please select a test server to use');
        return;
    }
    if (this.state.selectedMeasure === '') {
        this.logResults('Please select a Measure to evaluate');
        return;
    }

    // Set loading to true for spinner
    this.setState({ loading: true });
    this.clearPopulationCounts();

    // Build the evaluate measure URL based on the options selected
    let Url = '';
    if (this.state.selectedPatient === '') {
        Url = this.state.selectedServer + 'Measure/' + this.state.selectedMeasure +
            '/$evaluate-measure?periodStart=' + this.state.startDate +
            '&periodEnd=' + this.state.endDate + '&reportType=subject-list';
    } else {
        Url = this.state.selectedServer + 'Measure/' + this.state.selectedMeasure +
            '/$evaluate-measure?subject=' + this.state.selectedPatient + '&periodStart=' +
            this.state.startDate + '&periodEnd=' + this.state.endDate;
    }

    // Call the FHIR server to evaluate the measure
    fetch(Url)
       .then((response) => {
          if(!response.ok) throw new Error(response.status);
            else return response.json();
          })
       .then((data) => {
         this.setState({ results: JSON.stringify(data, undefined, 2) });
         let groups = data.group;
         let populations = groups.map(group => {
             return group.population;
         });
         let counts = populations[0].map(pop => {
             return pop.count;
         });
         let codes = populations[0].map(pop => {
             return pop.code;
         });
         let popNames = codes.map(codeValue => {
             return codeValue.coding[0].code;
         });

         // Iterate through the population names to set the state
         for (var i=0; i< popNames.length; i++) {
            if (popNames[i] === 'initial-population') {
                this.setState({ initialPopulation: counts[i] });
            } else if (popNames[i] === 'numerator') {
                this.setState({ numerator: counts[i] });
            } else if (popNames[i] === 'numerator-exclusion') {
                this.setState({ numeratorExclusion: counts[i] });
            } else if (popNames[i] === 'denominator') {
                this.setState({ denominator: counts[i] });
            } else if (popNames[i] === 'denominator-exclusion') {
                this.setState({ denominatorExclusion: counts[i] });
            } else if (popNames[i] === 'denominator-exception') {
                this.setState({ denominatorException: counts[i] });
            }
         }

         this.setState({ loading: false });
       })
       .catch((error) => {
         var message = 'Calling ' + Url + ' caused ' + error;
         this.setState({ results: message });
         this.setState({ loading: false });
       });
  }

  // Render method renders the user interface with the given state
  // This is using Bootstrap to make a clean responsive UI
  render() {
      return (
        <div class="container">
            <div class="py-5 text-center">
              <img class="d-block mx-auto mb-4" src={logo} alt="ICF Logo" width="72" height="72"/>
              <h2>eCQM Testing Tool</h2>
            </div>
            <div class="row">
                <div class="col-md-6 order-md-1">
                  <label for="server">Test Server</label>
                  <select class="custom-select d-block w-100" id="server" onChange={this.fetchData} required>
                    <option value="">Select a Test Server...</option>
                    {this.state.serverUrls.map((server) => (
                        <option>{server}</option>
                    ))}
                  </select>
                </div>
                <div class="col-md-6 order-md-2">
                  <label for="measure">Measure</label>
                  <select class="custom-select d-block w-100" id="measure" onChange={this.setMeasure} required>
                    <option value="">Select a Measure to Evaluate...</option>
                    {this.state.measures.map((measure) => (
                       <option>{measure}</option>
                    ))}
                  </select>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 order-md-1">
                    <label for="startDate">Start Date</label>
                    <Form.Control type="date" name="startDate"
                        value={this.state.startDate} onChange={this.setStartDate}/>
                </div>
                <div class="col-md-6 order-md-2">
                    <label for="endDate">End Date</label>
                    <Form.Control type="date" name="endDate"
                        value={this.state.endDate} onChange={this.setEndDate}/>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 order-md-1">
                    <label for="patient">Patient (optional)</label>
                    <select class="custom-select d-block w-100" id="measure" onChange={this.setPatient} required>
                        <option value="">Select a Patient...</option>
                        {this.state.patients.map((patient) => (
                           <option>{patient}</option>
                        ))}
                    </select>
                </div>
                <div class="col-md-6 order-md-2">
                    <label for="evaluate">&nbsp;</label>
                    {this.state.loading ? (
                        <button class="w-100 btn btn-primary btn-lg" id="evaluate" disabled="true">
                            Loading...
                        </button>
                    ) : (
                        <button class="w-100 btn btn-primary btn-lg" id="evaluate"
                            onClick={this.evaluateMeasure}>Evaluate Measure</button>
                    )}
                </div>
            </div>
            <div class="row">
                <div class="col-md-12 order-md-1">
                    <label for="results">Results</label>
                    <Form.Control as="textarea" name="results" rows="20" value={this.state.results}/>
                </div>
            </div>
            <div class="row">
                <div class="col-md-2 order-md-1">
                    <div class="card">
                        <div class="card-header">
                            IPOP
                        </div>
                        <div class="card-body">
                            {this.state.initialPopulation}
                        </div>
                    </div>
                </div>
                <div class="col-md-2 order-md-2">
                    <div class="card">
                        <div class="card-header">
                            DENOM
                        </div>
                        <div class="card-body">
                            {this.state.denominator}
                        </div>
                    </div>
                </div>
                <div class="col-md-2 order-md-3">
                    <div class="card">
                        <div class="card-header">
                            DENEXCL
                        </div>
                        <div class="card-body">
                            {this.state.denominatorExclusion}
                        </div>
                    </div>
                </div>
                <div class="col-md-2 order-md-4">
                    <div class="card">
                        <div class="card-header">
                            DENEXCEP
                        </div>
                        <div class="card-body">
                            {this.state.denominatorException}
                        </div>
                    </div>
                </div>
                <div class="col-md-2 order-md-4">
                    <div class="card">
                        <div class="card-header">
                            NUMER
                        </div>
                        <div class="card-body">
                            {this.state.numerator}
                        </div>
                    </div>
                </div>
                <div class="col-md-2 order-md-4">
                    <div class="card">
                        <div class="card-header">
                            NUMEXCL
                        </div>
                        <div class="card-body">
                            {this.state.numeratorExclusion}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      );
    }
}

export default App;
