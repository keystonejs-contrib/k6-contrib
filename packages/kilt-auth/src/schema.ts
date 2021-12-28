import { graphql } from '@keystone-6/core';
import { ExtendGraphqlSchema } from '@keystone-6/core/types';
import { getBaseAuthSchema } from './gql/getBaseAuthSchema';
import { AuthGqlNames } from './types';

export const getSchemaExtension = ({
  identityField,
  listKey,
  gqlNames,
}: {
  identityField: string;
  listKey: string;
  gqlNames: AuthGqlNames;
}): ExtendGraphqlSchema =>
  graphql.extend(base => {
    const baseSchema = getBaseAuthSchema({ listKey, identityField, gqlNames, base });

    return [baseSchema.extension].filter((x): x is Exclude<typeof x, undefined> => x !== undefined);
  });
