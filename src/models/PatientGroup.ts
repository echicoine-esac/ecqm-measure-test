/**
 * Used in Group resources that give Patient information based on Measure
 */
export type PatientGroup =
    {
        id: string,
        extension: Extension[],
        member: Member[]
    };

export type Extension =
    {
        url: string,
        valueCanonical: string
    };

export type Member = {
    entity: {
        reference: string;
        display: string;
    };
};

