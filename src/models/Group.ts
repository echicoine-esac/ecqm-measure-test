export type Group =
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

