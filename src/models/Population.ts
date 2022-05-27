export type Population = {
    id: string;
    code: {
      coding: [{
        system: string;
        code: string;
        display: string;
      }];
    };
    count: number;
};