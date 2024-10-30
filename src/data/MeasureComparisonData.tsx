import { Measure } from "../models/Measure";
import { Patient } from "../models/Patient";
import { PopulationElement } from "../models/Scoring";
import { Server } from "../models/Server";

export class MeasureComparisonData {
  selectedPatient: Patient | undefined;
  selectedMeasure: Measure;
  selectedMeasureEvaluationServer: Server | undefined;
  selectedDataRepoServer: Server | undefined;
  startDate: string = '';
  endDate: string = '';
  fetchedEvaluatedMeasureGroups: PopulationElement[] = [];
  fetchedMeasureReportGroups: PopulationElement[] = [];
  discrepancyExists: boolean = false;
  evaluatedMeasureURL = '';
  measureReportURL = '';

  constructor(
    selectedPatient: Patient | undefined,
    selectedMeasure: Measure,
    selectedMeasureEvaluationServer: Server,
    selectedDataRepoServer: Server,
    startDate: string,
    endDate: string,
    evaluatedMeasureURL?: string,
    measureReportURL?: string
  ) {
    this.selectedPatient = selectedPatient;
    this.selectedMeasure = selectedMeasure;
    this.selectedMeasureEvaluationServer = selectedMeasureEvaluationServer;
    this.selectedDataRepoServer = selectedDataRepoServer;
    this.startDate = startDate;
    this.endDate = endDate;

    if (evaluatedMeasureURL) this.evaluatedMeasureURL = evaluatedMeasureURL;
    if (measureReportURL) this.measureReportURL = measureReportURL;
  }

  toJSON() {
    return {
      selectedPatient: this.selectedPatient,
      selectedMeasure: this.selectedMeasure,
      selectedMeasureEvaluationServer: this.selectedMeasureEvaluationServer,
      selectedDataRepoServer: this.selectedDataRepoServer,
      startDate: this.startDate,
      endDate: this.endDate,
      fetchedEvaluatedMeasureGroups: this.fetchedEvaluatedMeasureGroups,
      fetchedMeasureReportGroups: this.fetchedMeasureReportGroups,
      discrepancyExists: this.discrepancyExists,
      evaluatedMeasureURL: this.evaluatedMeasureURL,
      measureReportURL: this.measureReportURL
    };
  }

  static fromJSON(json: any): MeasureComparisonData {
    const data = new MeasureComparisonData(
      json.selectedPatient,
      json.selectedMeasure,
      json.selectedMeasureEvaluationServer,
      json.selectedDataRepoServer,
      json.startDate,
      json.endDate,
      json.evaluatedMeasureURL,
      json.measureReportURL
    );
    data.fetchedEvaluatedMeasureGroups = json.fetchedEvaluatedMeasureGroups;
    data.fetchedMeasureReportGroups = json.fetchedMeasureReportGroups;
    data.discrepancyExists = json.discrepancyExists;
    return data;
  }
}
