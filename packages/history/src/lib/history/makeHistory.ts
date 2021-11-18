import { ListConfig, BaseGeneratedListTypes, BaseFields } from '@keystone-next/keystone/types';
// import { historyOptions } from '../types';

export const makeHistory = () =>
    <Fields extends BaseFields<BaseGeneratedListTypes>>(
      listConfig: ListConfig<BaseGeneratedListTypes, Fields>
    ): ListConfig<BaseGeneratedListTypes, Fields> => {
      let hooks = { ...listConfig.hooks };
      let history = { ...listConfig.history };

      let beforeData:any
      let newData:any={}
      let oldData:any={}
        hooks = {
          ...hooks,
          beforeOperation: async({item}) => {
            beforeData = item 
          },
          afterOperation: async({ item, operation, context, listKey }) => {            
            if(beforeData){
              Object.keys(beforeData).forEach(key => {
                 if(beforeData[key] !== item[key]){
                    newData[key]=item[key]
                    oldData[key]=beforeData[key]
                 }
              });              
            if (operation === 'update') {
              let query
              if(history.separate){
                query = context.query[listKey+'History']
              }else{
                query = context.query.History
              }
                await query.createOne({
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