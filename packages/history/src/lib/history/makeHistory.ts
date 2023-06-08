import { ResolveInputHook } from './../types';
import { ListConfig, BaseGeneratedListTypes, BaseFields } from '@keystone-next/keystone/types';
import { historyOptions,} from '../types';

export const makeHistory =
  ({ listName }: historyOptions) =>
  <Fields extends BaseFields<BaseGeneratedListTypes>>(
    listConfig: ListConfig<BaseGeneratedListTypes, Fields>
  ): ListConfig<BaseGeneratedListTypes, Fields> => {
    let hooks = { ...listConfig.hooks };
    let history = { ...listConfig.history };
    let beforeData: any;
    let snapshot = {};
    hooks = {
      ...hooks,
      beforeOperation: async (res: any) => {
        beforeData = res.item;
      },
      afterOperation: async ({ item, operation, context, listKey, originalItem }: any) => {
        if (operation !== 'delete') {
          snapshot = JSON.stringify(originalItem);
          let newData: any = [];
          let oldData: any = [];
          let fields: any = [];
          if (beforeData) {
            Object.keys(beforeData).forEach(key => {
              let exclude: boolean = false;
              if (history.exclude)
                history.exclude.map((el: any) => {
                  if (el == key) return (exclude = true);
                });
              if (!exclude && beforeData[key] !== item[key]) {
                fields.push(key);
                newData.push(item[key]);
                oldData.push(beforeData[key]);
              }
            });
            if (operation === 'update') {
              let query: any;
              let name = listKey + listName;
              if (history.suffix) name = listKey + history.suffix;
              if (history.exclusive) {
                query = context.query[name];
              } else {
                if (listName) query = context.query[listName];
                else query = context.query[listName];
              }
              // fields.map((el: any, index: number) => {
                query.createOne({
                  data: {
                    list: listKey,
                    // newValue: JSON.stringify(newData[index]),
                    // oldValue: JSON.stringify(oldData[index]),
                    snapshot: snapshot,
                    itemId: item.id,
                    field: fields.join(','),
                    modifiedBy: { connect: { id: context.session.itemId } },
                  },
                  query: 'id ',
                });
              // });
            }
          }
        }
      },
    };
    return {
      ...listConfig,
      hooks: {
        ...listConfig.hooks,
        ...hooks,
      },
    };
  };
