import { Constants, FetchType } from "../constants/Constants";
import { BundleEntry } from "../models/BundleEntry";
import { MeasureData } from "../models/MeasureData";
import { MeasureReportGroup } from "../models/MeasureReportGroup";
import { Population } from "../models/Population";
import { StringUtils } from "../utils/StringUtils";

export class AppData {
    selectedServer: string = '';
    selectedPatient: string = '';
    selectedMeasure: string = '';
    startDate: string = '';
    endDate: string = '';

    constructor(selectedServer: string, selectedPatient: string, selectedMeasure: string, startDate: string, endDate: string) {
        if (!selectedServer || selectedServer === ''){
            throw new Error(Constants.appDataMissingSelectedServer);
        }

        if (!selectedMeasure || selectedMeasure === ''){
            throw new Error(Constants.appDataMissingSelectedMeasure);
        }

        if (!startDate || startDate === ''){
            throw new Error(Constants.appDataMissingStartDate);
        }

        if (!endDate || endDate === ''){
            throw new Error(Constants.appDataMissingEndDate);
        }
        
        this.selectedServer = selectedServer;
        this.selectedPatient = selectedPatient;
        this.selectedMeasure = selectedMeasure;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    getMeasureUrl(): string {
        if (this.selectedPatient === '') {
            return StringUtils.format(Constants.fetchData,
                this.selectedMeasure, this.selectedMeasure,
                this.startDate, this.endDate);
        } else {
            return StringUtils.format(Constants.fetchDataWithPatient,
                this.selectedServer, this.selectedMeasure,
                this.selectedPatient, this.startDate, this.endDate);
        }
    }

    public buildMeasureData = async (): Promise<MeasureData> => {
        let jsonData = '';
        let popNamesData: string[] = [];
        let countsData: string[] = [];

        // Fetch the data by calling the API and use callback to reflect state properly
        await fetch(this.getMeasureUrl())
            .then((response) => {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json()
            })
            .then((data) => {
                jsonData = data;

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

                popNamesData = popNames;
                countsData = counts;
            })
            .catch((error) => {
                let message = StringUtils.format(Constants.fetchError, this.getMeasureUrl(), 'data', error);
                throw new Error(message);
            })

        let measureData: MeasureData = {
            jsonBody: jsonData,
            popNames: popNamesData,
            counts: countsData
        }
        return measureData;
    }

    // static functions for retrieving data in similar format (patient/measure)
    public static fetchItems = async (url: string, type: FetchType): Promise<string[]> => {
        let returnList: string[] = [];

        let urlEnding = '';
        if (type === FetchType.PATIENT) {
            urlEnding = Constants.patientUrlEnding;
        } else if (type === FetchType.MEASURE) {
            urlEnding = Constants.measureUrlEnding;
        }

        // Fetch all the items from the selected server
        await fetch(url + urlEnding)
            .then((response) => {
                if (!response.ok) {
                    throw Error(response.statusText);
                }

                return response.json()
            })
            .then((data) => {
                let entries = data.entry;
                let ids = entries.map((entry: BundleEntry) => {
                    return entry.resource.id
                });
                returnList = ids;
            })
            .catch((error) => {
                let message = StringUtils.format(Constants.fetchError, url + urlEnding, type, error);
                throw new Error(message);
            })
        return returnList;
    };

}