import { GraphQLClient, RequestDocument } from 'graphql-request';

export async function request<T>(
  client: GraphQLClient,
  query: RequestDocument,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variables?: any,
) {
  try {
    return await client.request<T>(query, variables);
  } catch (error) {
    console.error(error);
    throw error;
  }
}
