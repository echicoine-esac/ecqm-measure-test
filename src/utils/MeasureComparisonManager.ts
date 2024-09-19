import { Amplify } from 'aws-amplify';
import awsExports from '../aws-exports';
import { Patient } from '../models/Patient';
import { Measure } from '../models/Measure';
import { Server } from '../models/Server';
import { EvaluateMeasureFetch } from '../data/EvaluateMeasureFetch';
import { MeasureReportFetch } from '../data/MeasureReportFetch';
import { ScoringUtils } from './ScoringUtils';
import { PopulationElement } from '../models/Scoring';

Amplify.configure(awsExports);

/**
 * Create a new manager class with intention of maintaining test comparisons
 * between existing MeasureReports from data repo/patient selection server, and current
 * evaluations from selected Evaluation Server. Discrepancies or matches are reported
 * to the user. Bulk processing of all patients on a Data Repo server will take 
 * advantage of instances of this class.
 */
export class MeasureComparisonManager {
    private selectedPatient: Patient | undefined;
    public selectedMeasure: Measure;
    private selectedMeasureEvaluation: Server | undefined;
    private startDate: string = '';
    private endDate: string = '';
    private accessToken: string = '';

    public fetchedEvaluatedMeasureGroups: PopulationElement[] = [];
    public fetchedMeasureReportGroups: PopulationElement[] = [];

    public discrepancyExists = false;

    public evaluatedMeasureURL = '';
    public measureReportURL = '';

    constructor(selectedPatient: Patient | undefined,
        selectedMeasure: Measure,
        selectedMeasureEvaluation: Server,
        startDate: string,
        endDate: string,
        accessToken: string
    ) {
        this.selectedPatient = selectedPatient;
        this.selectedMeasure = selectedMeasure;
        this.selectedMeasureEvaluation = selectedMeasureEvaluation;
        this.startDate = startDate;
        this.endDate = endDate;

    }


    /**
     * Attempts to first evaluate measure against selected patient using specific eval server.
     * Next, using the measure information a MeasureReport fetch is ran to gather existing evaluations
     * Data looked at is group array's population entries and corresponding counts.
     */
    public async fetchGroups() {
        try {

            const measureReportFetch = new MeasureReportFetch(this.selectedMeasureEvaluation,
                this.selectedPatient, this.selectedMeasure.name, this.startDate, this.endDate);
            this.measureReportURL = measureReportFetch.getUrl();

            //MeasureReport fetch filters by date manually (period.start/period.end) comes back as entry array
            this.fetchedMeasureReportGroups = ScoringUtils.extractBundleMeasureReportGroupData(await measureReportFetch.fetchData(this.accessToken));


            const evaluateMeasureFetch = new EvaluateMeasureFetch(this.selectedMeasureEvaluation,
                this.selectedMeasure.name, this.startDate, this.endDate, true, this.selectedPatient);
            this.evaluatedMeasureURL = evaluateMeasureFetch.getUrl();

            //evaluate measure comes back as a single MeasureReport
            this.fetchedEvaluatedMeasureGroups = ScoringUtils.extractMeasureReportGroupData((await evaluateMeasureFetch.fetchData(this.accessToken)).jsonBody);

            this.discrepancyExists = this.compareMeasureGroups();
        } catch (error: any) {
            console.log(error);
        }
    }


    private compareMeasureGroups(): boolean {
        if (this.fetchedEvaluatedMeasureGroups.length !== this.fetchedMeasureReportGroups.length) {
            return true;
        }
        const sortedArray1 = [...this.fetchedEvaluatedMeasureGroups].sort((a, b) => a.code.coding[0].code.localeCompare(b.code.coding[0].code));
        const sortedArray2 = [...this.fetchedMeasureReportGroups].sort((a, b) => a.code.coding[0].code.localeCompare(b.code.coding[0].code));

        for (let i = 0; i < sortedArray1.length; i++) {
            if (
                sortedArray1[i].code.coding[0].code !== sortedArray2[i].code.coding[0].code ||
                sortedArray1[i].count !== sortedArray2[i].count
            ) {
                return true;
            }
        }


        return false;
    }
}



