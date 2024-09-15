export type GroupElement = {
  id: string;
  population: PopulationElement[];
};

export type PopulationElement = {
  id: string;
      extension?: {
          url: string;
          valueString: string;
      }[];
      code: {
          coding: {
              system: string;
              code: string;
              display: string;
          }[];
      };
      count: number;

      //used in TestComparator
      discrepancy?: boolean;
}