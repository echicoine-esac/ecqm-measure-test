/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getServers = /* GraphQL */ `
  query GetServers($id: ID!) {
    getServers(id: $id) {
      id
      baseUrl
      authUrl
      callbackUrl
      clientID
      clientSecret
      scope
      createdAt
      updatedAt
    }
  }
`;
export const listServers = /* GraphQL */ `
  query ListServers(
    $filter: ModelServersFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listServers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        baseUrl
        authUrl
        callbackUrl
        clientID
        clientSecret
        scope
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
