export type Measure = {
  name: string;
  scoring: {
    coding: [
      {
        system: string;
        code:string;
      }
    ]
  };
};