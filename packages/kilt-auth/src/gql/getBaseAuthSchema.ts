import { graphql } from '@keystone-6/core';
import { BaseItem } from '@keystone-6/core/types';
import { AuthGqlNames } from '../types';

export function getBaseAuthSchema({
  listKey,
  identityField,
  gqlNames,
  base,
}: {
  listKey: string;
  identityField: string;
  gqlNames: AuthGqlNames;
  base: graphql.BaseSchemaMeta;
}) {
  const ItemAuthenticationWithKiltSuccess = graphql.object<{
    sessionToken: string;
    item: BaseItem;
  }>()({
    name: gqlNames.ItemAuthenticationWithKiltSuccess,
    fields: {
      sessionToken: graphql.field({ type: graphql.nonNull(graphql.String) }),
      item: graphql.field({ type: graphql.nonNull(base.object(listKey)) }),
    },
  });
  const extension = {
    query: {
      authenticatedItem: graphql.field({
        type: graphql.union({
          name: 'AuthenticatedItem',
          types: [base.object(listKey) as graphql.ObjectType<BaseItem>],
          resolveType: (root, context) => listKey,
        }),
        resolve(root, args, { session, db }) {
          if (typeof session[identityField] === 'string') {
            return db[listKey].findOne({ where: { id: session.id } });
          }
          return null;
        },
      }),
    },
  };
  return { extension, ItemAuthenticationWithKiltSuccess };
}
