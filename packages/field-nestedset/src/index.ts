import path from 'path';
import {
  BaseListTypeInfo,
  FieldTypeFunc,
  CommonFieldConfig,
  fieldType,
  AdminMetaRootVal,
  KeystoneContext,
  orderDirectionEnum,
} from '@keystone-6/core/types';
import { graphql } from '@keystone-6/core';
import {
  createRoot,
  isLeaf,
  getWeight,
  getParentId,
  getchildrenCount,
  getPrevSibling,
  getNextSibling,
  getChildOf,
  getParentOf,
  insertLastChildOf,
  insertNextSiblingOf,
  insertPrevSiblingOf,
  moveNode,
  deleteResolver,
  updateEntityIsNullFields,
} from './utils';

import { Path } from 'graphql/jsutils/Path';
const views = path.join(path.dirname(__dirname), 'views');

type SelectDisplayConfig = {
  ui?: {
    // Sets the relationship to display as a Select field
    displayMode?: 'select';
    /**
     * The path of the field to use from the related list for item labels in the select.
     * Defaults to the labelField configured on the related list.
     */
    labelField?: string;
  };
};

export type NestedSetData = {
  depth: number;
  left: number;
  right: number;
};

const nestedSetOutputFields = graphql.fields<NestedSetData>()({
  depth: graphql.field({ type: graphql.Int }),
  left: graphql.field({ type: graphql.Int }),
  right: graphql.field({ type: graphql.Int }),
  weight: graphql.field({
    type: graphql.nonNull(graphql.Int),
    resolve(item, args, type, context) {
      return getWeight({ ...item });
    },
  }),
  isLeaf: graphql.field({
    type: graphql.nonNull(graphql.Boolean),
    resolve(item) {
      return isLeaf({ ...item });
    },
  }),
  parentId: graphql.field({
    type: graphql.ID,
    resolve(item, args, context, info) {
      const { key, typename } = info.path.prev as Path;
      return getParentId({ ...item }, context, key, typename);
    },
  }),
  childrenCount: graphql.field({
    type: graphql.nonNull(graphql.Int),
    resolve(item, args, context, info) {
      const { key, typename } = info.path.prev as Path;
      return getchildrenCount({ ...item }, context, key, typename);
    },
  }),
});

const NestedSetOutput = graphql.interface<Omit<NestedSetData, 'type'>>()({
  name: 'NestedSetOutput',
  fields: nestedSetOutputFields,
  resolveType: () => 'NestedSetFieldOutput',
});

const NestedSetFieldOutput = graphql.object<Omit<NestedSetData, 'type'>>()({
  name: 'NestedSetFieldOutput',
  interfaces: [NestedSetOutput],
  fields: nestedSetOutputFields,
});

const NestedSetFieldInput = graphql.inputObject({
  name: 'NestedSetFieldInput',
  fields: {
    parentId: graphql.arg({ type: graphql.ID }),
    prevSiblingOf: graphql.arg({ type: graphql.ID }),
    nextSiblingOf: graphql.arg({ type: graphql.ID }),
  },
});

const NestedSetFilterInput = graphql.inputObject({
  name: 'NestedSetFilterInput',
  fields: {
    prevSiblingId: graphql.arg({ type: graphql.ID }),
    nextSiblingId: graphql.arg({ type: graphql.ID }),
    parentOf: graphql.arg({ type: graphql.ID }),
    childOf: graphql.arg({ type: graphql.ID }),
  },
});

type NestedSetFieldInputType =
  | undefined
  | null
  | { parentId?: string; prevSiblingOf?: string; nextSiblingOf?: string };

type NestedSetFieldFilterType =
  | undefined
  | null
  | { parentId?: string; prevSiblingId?: string; nextSiblingId?: string; childOf?: string };

async function inputResolver(
  data: NestedSetFieldInputType,
  context: KeystoneContext,
  listKey: string,
  fieldKey: string
) {
  if (data === null || data === undefined) {
    return createRoot();
  }
  const { parentId, prevSiblingOf, nextSiblingOf } = data;
  if (parentId) {
    return await insertLastChildOf(parentId, context, listKey, fieldKey);
  }
  if (nextSiblingOf) {
    return await insertNextSiblingOf(nextSiblingOf, context, listKey, fieldKey);
  }
  if (prevSiblingOf) {
    return await insertPrevSiblingOf(prevSiblingOf, context, listKey, fieldKey);
  }
  return data;
}
async function updateEntityIsNull(
  data: NestedSetFieldInputType,
  context: KeystoneContext,
  listKey: string,
  fieldKey: string
) {
  if (data === null || data === undefined) {
    return null;
  }
  return await updateEntityIsNullFields(data, context, listKey, fieldKey);
}

async function filterResolver(
  data: NestedSetFieldFilterType,
  context: KeystoneContext,
  listKey: string,
  fieldKey: string
) {
  const { prevSiblingId, nextSiblingId, childOf, parentOf } = data;
  let result = {};
  if (prevSiblingId) {
    const prevSiblingQuery = await getPrevSibling(prevSiblingId, context, listKey, fieldKey);
    result = { ...result, ...prevSiblingQuery };
  }
  if (nextSiblingId) {
    const nextSiblingQuery = await getNextSibling(nextSiblingId, context, listKey, fieldKey);
    result = { ...result, ...nextSiblingQuery };
  }
  if (childOf) {
    const childQuery = await getChildOf(childOf, context, listKey, fieldKey);
    result = { ...result, ...childQuery };
  }
  if (parentOf) {
    const parentQuery = await getParentOf(parentOf, context, listKey, fieldKey);
    result = { ...result, ...parentQuery };
  }
  return result;
}

export type NestedSetConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & { defaultValue?: { [key: string]: any } } & SelectDisplayConfig;

export const nestedSet =
  <ListTypeInfo extends BaseListTypeInfo>({
    ...config
  }: NestedSetConfig<ListTypeInfo> = {}): FieldTypeFunc<ListTypeInfo> =>
  meta => {
    const listTypes = meta.lists[meta.listKey].types;
    const commonConfig = {
      ...config,
      isIndexed: 'unique',
      getAdminMeta: (
        adminMetaRoot: AdminMetaRootVal
      ): Parameters<typeof import('./views').controller>[0]['fieldMeta'] => {
        if (!listTypes) {
          throw new Error(
            `The ref [${listTypes}] on relationship [${meta.listKey}.${meta.fieldKey}] is invalid`
          );
        }
        return {
          listKey: meta.listKey,
          labelField: adminMetaRoot.listsByKey[meta.listKey].labelField,
        };
      },
    };
    return fieldType({
      kind: 'multi',
      fields: {
        left: {
          kind: 'scalar',
          scalar: 'Int',
          mode: 'optional',
        },
        right: {
          kind: 'scalar',
          scalar: 'Int',
          mode: 'optional',
        },
        depth: {
          kind: 'scalar',
          scalar: 'Int',
          mode: 'optional',
        },
      },
    })({
      ...commonConfig,
      hooks: {
        resolveInput: async ({
          listKey,
          fieldKey,
          operation,
          inputData,
          item,
          resolvedData,
          context,
        }) => {
          if (operation === 'update') {
            let currentItem = {};
            if (
              item &&
              item.id &&
              item[`${fieldKey}_left`] !== null &&
              item[`${fieldKey}_right`] !== null
            ) {
              currentItem = {
                id: item.id,
                [`${fieldKey}_left`]: item[`${fieldKey}_left`],
                [`${fieldKey}_right`]: item[`${fieldKey}_right`],
                [`${fieldKey}_depth`]: item[`${fieldKey}_depth`],
              };
            }
            if (!Object.keys(currentItem).length) {
              return updateEntityIsNull(inputData[fieldKey], context, listKey, fieldKey);
            }
            return moveNode(inputData, context, listKey, fieldKey, currentItem);
          }
          return resolvedData[fieldKey];
        },

        validateDelete: async ({ listKey, fieldKey, item, context, operation }) => {
          if (operation === 'delete') {
            let currentItem = {};
            if (!item.id) return;
            if (!item[`${fieldKey}_left`] || !item[`${fieldKey}_right`]) return;
            currentItem = {
              id: item.id,
              [`${fieldKey}_left`]: item[`${fieldKey}_left`],
              [`${fieldKey}_right`]: item[`${fieldKey}_right`],
              [`${fieldKey}_depth`]: item[`${fieldKey}_depth`],
            };
            return deleteResolver(currentItem, { context, listKey, fieldKey });
          }
          return;
        },
      },
      input: {
        where: {
          arg: graphql.arg({ type: NestedSetFilterInput }),
          resolve(value, context) {
            return filterResolver(value, context, meta.listKey, meta.fieldKey);
          },
        },
        create: {
          arg: graphql.arg({ type: NestedSetFieldInput }),
          async resolve(value, context) {
            return inputResolver(value, context, meta.listKey, meta.fieldKey);
          },
        },
        update: {
          arg: graphql.arg({ type: NestedSetFieldInput }),
          async resolve(value, context, resolve) {
            return;
          },
        },
        orderBy: {
          arg: graphql.arg({ type: orderDirectionEnum }),
          resolve: direction => {
            return {
              left: direction,
            };
          },
        },
      },
      output: graphql.field({
        type: NestedSetFieldOutput,
        resolve({ value }) {
          if (
            value.left === null ||
            value.left === undefined ||
            value.right === null ||
            value.right === undefined ||
            value.depth === null ||
            value.depth === undefined
          ) {
            return null;
          }
          return { ...value };
        },
      }),
      views,
      unreferencedConcreteInterfaceImplementaetions: [NestedSetFieldOutput],
    });
  };
