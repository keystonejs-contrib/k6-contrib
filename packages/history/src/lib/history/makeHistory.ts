import { ListConfig, BaseGeneratedListTypes, BaseFields } from '@keystone-next/keystone/types';
// import { historyOptions } from '../types';

export const makeHistory =
  () =>
    <Fields extends BaseFields<BaseGeneratedListTypes>>(
      listConfig: ListConfig<BaseGeneratedListTypes, Fields>
    ): ListConfig<BaseGeneratedListTypes, Fields> => {

      let hooks = { ...listConfig.hooks };
      let beforeData:any
      let newData:any={}
      let oldData:any={}
        hooks = {
          ...hooks,
          beforeOperation: async({item}) => {
            beforeData = item 
          },
          afterOperation: async({ item, operation, context }) => {
            if(beforeData){
              Object.keys(beforeData).forEach(key => {
                 if(beforeData[key] !== item[key]){
                    newData[key]=item[key]
                    oldData[key]=beforeData[key]
                 }
              });              
            if (operation === 'update') {
              await context.query.History.createOne({
                data: {
                  operation:operation,newValue:JSON.stringify(newData),oldValue:JSON.stringify(oldData),orignal:item.id
                },
                query: 'id ',
              });
            }
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