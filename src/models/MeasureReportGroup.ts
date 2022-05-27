export type MeasureReportGroup = {
  population: [{
    id: string;
    code: {
      coding: [{
        system: string;
        code: string;
        display: string;
      }];
    };
    count: number;
  }];
};