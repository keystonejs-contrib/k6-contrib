import { ListConfig, BaseGeneratedListTypes, BaseFields } from '@keystone-next/keystone/types';
import { HistoryOptions } from '../types';

export const makeHistory =
  (options: HistoryOptions = {}) =>
    <Fields extends BaseFields<BaseGeneratedListTypes>>(
      listConfig: ListConfig<BaseGeneratedListTypes, Fields>
    ): ListConfig<BaseGeneratedListTypes, Fields> => {

      let hooks = { ...listConfig.hooks };
      let beforeData:any
      let historyData:any={}
        hooks = {
          ...hooks,
          beforeOperation: async({item}) => {
            beforeData = item 
          },
          afterOperation: async({ item, operation, context }) => {
              Object.keys(beforeData).forEach(key => {
                 if(beforeData[key] !== item[key]){
                    historyData[key]=item[key]
                 }
              });              
            if (operation === 'create' || operation === 'update') {
              await context.query.History.createOne({
                data: {
                  operation:operation,history:JSON.stringify(historyData),orignal:item.id
                },
                query: 'id ',
              });
            }
          }
        }
      return {
        ...listConfig,
        hooks: {
          ...listConfig.hooks,
          ...hooks,
        },
      };
    };