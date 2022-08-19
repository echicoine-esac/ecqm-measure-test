/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createServers = /* GraphQL */ `
  mutation CreateServers(
    $input: CreateServersInput!
    $condition: ModelServersConditionInput
  ) {
    createServers(input: $input, condition: $condition) {
      id
      baseUrl
      authUrl
      tokenUrl
      callbackUrl
      clientID
      clientSecret
      scope
      createdAt
      updatedAt
    }
  }
`;
export const updateServers = /* GraphQL */ `
  mutation UpdateServers(
    $input: UpdateServersInput!
    $condition: ModelServersConditionInput
  ) {
    updateServers(input: $input, condition: $condition) {
      id
      baseUrl
      authUrl
      tokenUrl
      callbackUrl
      clientID
      clientSecret
      scope
      createdAt
      updatedAt
    }
  }
`;
export const deleteServers = /* GraphQL */ `
  mutation DeleteServers(
    $input: DeleteServersInput!
    $condition: ModelServersConditionInput
  ) {
    deleteServers(input: $input, condition: $condition) {
      id
      baseUrl
      authUrl
      tokenUrl
      callbackUrl
      clientID
      clientSecret
      scope
      createdAt
      updatedAt
    }
  }
`;
