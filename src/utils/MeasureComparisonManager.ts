import { EvaluateMeasureFetch } from '../data/EvaluateMeasureFetch';
import { MeasureComparisonData } from '../data/MeasureComparisonData';
import { MeasureReportFetch } from '../data/MeasureReportFetch';
import { ScoringUtils } from './ScoringUtils';

/**
 * Create a new manager class with intention of maintaining test comparisons
 * between existing MeasureReports from data repo/patient selection server, and current
 * evaluations from selected Evaluation Server. Discrepancies or matches are reported
 * to the user. Bulk processing of all patients on a Data Repo server will take 
 * advantage of instances of this class.
 */
export class MeasureComparisonManager {
    data: MeasureComparisonData;

    constructor(data: MeasureComparisonData) {
        this.data = data;
    }

    /**
     * Attempts to first evaluate measure against selected patient using specific eval server.
     * Next, using the measure information a MeasureReport fetch is ran to gather existing evaluations
     * Data looked at is group array's population entries and corresponding counts.
     */
    public async fetchAndCompareGroups(): Promise<MeasureComparisonData> {
        try {
            const measureReportFetch = new MeasureReportFetch(
                this.data.selectedDataRepoServer,
                this.data.selectedPatient,
                this.data.selectedMeasure.name,
                this.data.startDate,
                this.data.endDate
            );
            const fetchedMeasureReportData = await measureReportFetch.fetchData();
            this.data.fetchedMeasureReportGroups = ScoringUtils.extractBundleMeasureReportGroupData(fetchedMeasureReportData.operationData);
            this.data.measureReportURL = measureReportFetch.getUrl();

            const evaluateMeasureFetch = new EvaluateMeasureFetch(
                this.data.selectedMeasureEvaluationServer,
                this.data.selectedMeasure.name,
                this.data.startDate,
                this.data.endDate,
                true,
                this.data.selectedPatient
            );
            const fetchedEvaluatedMeasureData = await evaluateMeasureFetch.fetchData();
            this.data.fetchedEvaluatedMeasureGroups = ScoringUtils.extractMeasureReportGroupData(fetchedEvaluatedMeasureData.jsonRawData);
            this.data.evaluatedMeasureURL = evaluateMeasureFetch.getUrl();

            this.data.discrepancyExists = this.compareMeasureGroups();
        } catch (error: any) {
            console.error(error);
        }

        return Promise.resolve(this.data);
    }

    /**
     * Compares measure groups and marks discrepancies
     */
    private compareMeasureGroups(): boolean {
        if (this.data.fetchedEvaluatedMeasureGroups.length !== this.data.fetchedMeasureReportGroups.length) {
            return true;
        }

        const sortedEvaluatedGroups = [...this.data.fetchedEvaluatedMeasureGroups].sort((a, b) =>
            a.code.coding[0].code.localeCompare(b.code.coding[0].code)
        );
        const sortedMeasureReportGroups = [...this.data.fetchedMeasureReportGroups].sort((a, b) =>
            a.code.coding[0].code.localeCompare(b.code.coding[0].code)
        );

        for (let i = 0; i < sortedEvaluatedGroups.length; i++) {
            if (
                sortedEvaluatedGroups[i].code.coding[0].code !== sortedMeasureReportGroups[i].code.coding[0].code ||
                sortedEvaluatedGroups[i].count !== sortedMeasureReportGroups[i].count
            ) {
                sortedEvaluatedGroups[i].discrepancy = true;
                sortedMeasureReportGroups[i].discrepancy = true;
                return true;
            }
        }

        return false;
    }
}
