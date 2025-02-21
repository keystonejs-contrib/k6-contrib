import { ListConfig, BaseListTypeInfo, BaseItem } from '@keystone-6/core/types';

async function afterOperation(args: any, loggingFn: (s: Object) => void) {
  const { operation, originalItem, inputData, item, context, listKey } = args;
  const { session: { itemId: authedItem = null, listKey: authedListKey = null } = {} } = context;
  if (operation === 'create') {
    loggingFn({
      operation,
      authedItem,
      authedListKey,
      inputData,
      listKey,
      createdItem: item,
    });
  } else if (operation === 'update') {
    const changedItem = Object.entries(item as BaseItem)
      .filter(([key, value]) => key === 'id' || value !== originalItem?.[key])
      .reduce(
        (acc, [k, v]) => {
          acc[k] = v;
          return acc;
        },
        {} as Record<string, unknown>
      );
    loggingFn({ operation, authedItem, authedListKey, inputData, listKey, changedItem });
  } else if (operation === 'delete') {
    const { operation, originalItem, context, listKey } = args;
    const { session: { itemId: authedItem = null, listKey: authedListKey = null } = {} } = context;
    loggingFn({ operation, authedItem, authedListKey, listKey, deletedItem: originalItem });
  }
}

export const logging =
  (loggingFn = (s: Object) => console.log(JSON.stringify(s))) =>
  <ListTypeInfo extends BaseListTypeInfo>({
    hooks = {},
    ...rest
  }: ListConfig<ListTypeInfo>): ListConfig<ListTypeInfo> => ({
    hooks: {
      ...hooks,
      afterOperation:
        typeof hooks.afterOperation === 'function' 
          ? async (args: any) => {
              await hooks.afterOperation(args);
              afterOperation(args, loggingFn);
            }
          : {
              create: async (args: any) => {
                await hooks.afterOperation?.create?.(args);
                afterOperation(args, loggingFn);
              },
              update: async (args: any) => {
                await hooks.afterOperation?.update?.(args);
                afterOperation(args, loggingFn);
              },
              delete: async (args: any) => {
                await hooks.afterOperation?.delete?.(args);
                afterOperation(args, loggingFn);
              },
            },

      // TODO Disabled until this is supported again
      //@ts-ignore
      // afterAuth: async args => {
      //   if (hooks.afterAuth) {
      //     await hooks.afterAuth(args);
      //   }
      //   const { operation, item, success, message, token, context, listKey } = args;
      //   const { authedItem, authedListKey } = context;
      //   loggingFn({ operation, authedItem, authedListKey, item, success, message, token, listKey });
      // },
      // afterUnauth: async args => {
      //   if (hooks.afterAuth) {
      //     await hooks.afterAuth(args);
      //   }
      //   const { operation, context, listKey, itemId } = args;
      //   const { authedItem, authedListKey } = context;
      //   loggingFn({ operation, authedItem, authedListKey, listKey, itemId });
      // },
    },
    ...rest,
  });
