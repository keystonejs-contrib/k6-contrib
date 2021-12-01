import { ListConfig, BaseGeneratedListTypes, BaseFields } from '@keystone-6/core/types';

export const logging =  (loggingFn = (s: Object) => console.log(JSON.stringify(s))) => <Field extends BaseFields<BaseGeneratedListTypes>>({ hooks = {}, ...rest }: ListConfig<BaseGeneratedListTypes, Field>): ListConfig<BaseGeneratedListTypes, Field> => ({
  hooks: {
    ...hooks,
    afterChange: async args => {
      if (hooks.afterChange) {
        await hooks.afterChange(args);
      }
      const { operation, existingItem, originalInput, updatedItem, context, listKey } = args;
      const { session: { itemId: authedItem = null, listKey: authedListKey = null} = {} } = context;
      if (operation === 'create') {
        loggingFn({
          operation,
          authedItem,
          authedListKey,
          originalInput,
          listKey,
          createdItem: updatedItem,
        });
      } else if (operation === 'update') {
        const changedItem = Object.entries(updatedItem)
          .filter(([key, value]) => key === 'id' || value !== existingItem[key])
          .reduce((acc, [k, v]) => {
            acc[k] = v;
            return acc;
          }, {} as Record<string, unknown>);
        loggingFn({ operation, authedItem, authedListKey, originalInput, listKey, changedItem });
      }
    },
    afterDelete: async args => {
      if (hooks.afterDelete) {
        await hooks.afterDelete(args);
      }
      const { operation, existingItem, context, listKey } = args;
      const { session: { itemId: authedItem = null, listKey: authedListKey = null} = {} } = context;
      loggingFn({ operation, authedItem, authedListKey, listKey, deletedItem: existingItem });
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
