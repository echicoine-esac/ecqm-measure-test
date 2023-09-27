export type BundleEntry = {
  resource: {
    name: [
      {
        family: string;
        given: [string];
      }
    ];
    resourceType: string;
    id: string;
    scoring: string;
  };
};

