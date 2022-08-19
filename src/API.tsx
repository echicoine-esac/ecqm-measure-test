/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateServersInput = {
  id?: string | null,
  baseUrl: string,
  authUrl?: string | null,
  tokenUrl?: string | null,
  callbackUrl?: string | null,
  clientID?: string | null,
  clientSecret?: string | null,
  scope?: string | null,
};

export type ModelServersConditionInput = {
  baseUrl?: ModelStringInput | null,
  authUrl?: ModelStringInput | null,
  tokenUrl?: ModelStringInput | null,
  callbackUrl?: ModelStringInput | null,
  clientID?: ModelStringInput | null,
  clientSecret?: ModelStringInput | null,
  scope?: ModelStringInput | null,
  and?: Array< ModelServersConditionInput | null > | null,
  or?: Array< ModelServersConditionInput | null > | null,
  not?: ModelServersConditionInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type Servers = {
  __typename: "Servers",
  id: string,
  baseUrl: string,
  authUrl?: string | null,
  tokenUrl?: string | null,
  callbackUrl?: string | null,
  clientID?: string | null,
  clientSecret?: string | null,
  scope?: string | null,
  createdAt: string,
  updatedAt: string,
};

export type UpdateServersInput = {
  id: string,
  baseUrl?: string | null,
  authUrl?: string | null,
  tokenUrl?: string | null,
  callbackUrl?: string | null,
  clientID?: string | null,
  clientSecret?: string | null,
  scope?: string | null,
};

export type DeleteServersInput = {
  id: string,
};

export type ModelServersFilterInput = {
  id?: ModelIDInput | null,
  baseUrl?: ModelStringInput | null,
  authUrl?: ModelStringInput | null,
  tokenUrl?: ModelStringInput | null,
  callbackUrl?: ModelStringInput | null,
  clientID?: ModelStringInput | null,
  clientSecret?: ModelStringInput | null,
  scope?: ModelStringInput | null,
  and?: Array< ModelServersFilterInput | null > | null,
  or?: Array< ModelServersFilterInput | null > | null,
  not?: ModelServersFilterInput | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type ModelServersConnection = {
  __typename: "ModelServersConnection",
  items:  Array<Servers | null >,
  nextToken?: string | null,
};

export type CreateServersMutationVariables = {
  input: CreateServersInput,
  condition?: ModelServersConditionInput | null,
};

export type CreateServersMutation = {
  createServers?:  {
    __typename: "Servers",
    id: string,
    baseUrl: string,
    authUrl?: string | null,
    tokenUrl?: string | null,
    callbackUrl?: string | null,
    clientID?: string | null,
    clientSecret?: string | null,
    scope?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateServersMutationVariables = {
  input: UpdateServersInput,
  condition?: ModelServersConditionInput | null,
};

export type UpdateServersMutation = {
  updateServers?:  {
    __typename: "Servers",
    id: string,
    baseUrl: string,
    authUrl?: string | null,
    tokenUrl?: string | null,
    callbackUrl?: string | null,
    clientID?: string | null,
    clientSecret?: string | null,
    scope?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteServersMutationVariables = {
  input: DeleteServersInput,
  condition?: ModelServersConditionInput | null,
};

export type DeleteServersMutation = {
  deleteServers?:  {
    __typename: "Servers",
    id: string,
    baseUrl: string,
    authUrl?: string | null,
    tokenUrl?: string | null,
    callbackUrl?: string | null,
    clientID?: string | null,
    clientSecret?: string | null,
    scope?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type GetServersQueryVariables = {
  id: string,
};

export type GetServersQuery = {
  getServers?:  {
    __typename: "Servers",
    id: string,
    baseUrl: string,
    authUrl?: string | null,
    tokenUrl?: string | null,
    callbackUrl?: string | null,
    clientID?: string | null,
    clientSecret?: string | null,
    scope?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListServersQueryVariables = {
  filter?: ModelServersFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListServersQuery = {
  listServers?:  {
    __typename: "ModelServersConnection",
    items:  Array< {
      __typename: "Servers",
      id: string,
      baseUrl: string,
      authUrl?: string | null,
      tokenUrl?: string | null,
      callbackUrl?: string | null,
      clientID?: string | null,
      clientSecret?: string | null,
      scope?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type OnCreateServersSubscription = {
  onCreateServers?:  {
    __typename: "Servers",
    id: string,
    baseUrl: string,
    authUrl?: string | null,
    tokenUrl?: string | null,
    callbackUrl?: string | null,
    clientID?: string | null,
    clientSecret?: string | null,
    scope?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateServersSubscription = {
  onUpdateServers?:  {
    __typename: "Servers",
    id: string,
    baseUrl: string,
    authUrl?: string | null,
    tokenUrl?: string | null,
    callbackUrl?: string | null,
    clientID?: string | null,
    clientSecret?: string | null,
    scope?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteServersSubscription = {
  onDeleteServers?:  {
    __typename: "Servers",
    id: string,
    baseUrl: string,
    authUrl?: string | null,
    tokenUrl?: string | null,
    callbackUrl?: string | null,
    clientID?: string | null,
    clientSecret?: string | null,
    scope?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};
