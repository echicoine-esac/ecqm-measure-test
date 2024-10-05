import { PopulationElement } from "../models/Scoring";



/**
 * Takes in json data, analyzes its structure, returns scoring information
 * based on that structure:
 * - In some data, scoring is present in each entry within group[].
 * - In other data, scoring exists at the measure level, not within any entry in group[]
 */
export class ScoringUtils {

    public static extractBundleMeasureReportGroupData(entry: any): PopulationElement[] {
        let mgArr: PopulationElement[] = [];
        if (entry) {
            for (const measureReport of entry) {
                mgArr = [...mgArr, ...ScoringUtils.extractMeasureReportGroupData(measureReport.resource)];
            }
        }
        return mgArr
    }

    public static extractMeasureReportGroupData(data: any): PopulationElement[] {
        let mgArr: PopulationElement[] = [];
        if (!data.group) {
            return [];
        }
        for (const group of data.group) {
            if (group.population) {
                for (const population of group.population) {
                    mgArr.push(population)
                }
            }
        }
        return mgArr;
    }
}