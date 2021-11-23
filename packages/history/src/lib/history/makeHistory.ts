import { ListConfig, BaseGeneratedListTypes, BaseFields } from '@keystone-next/keystone/types';
import { historyOptions } from '../types';

export const makeHistory = ({listName}:historyOptions) =>
    <Fields extends BaseFields<BaseGeneratedListTypes>>(
      listConfig: ListConfig<BaseGeneratedListTypes, Fields>
    ): ListConfig<BaseGeneratedListTypes, Fields> => {
      let hooks = { ...listConfig.hooks };
      let history = { ...listConfig.history };
      let beforeData:any
        hooks = {
          ...hooks,
          beforeOperation: async({item}) => {
            beforeData = item 
          },
          afterOperation: async({ item, operation, context, listKey }) => {      
            let newData:any=[]
            let oldData:any=[]
            let fields:any=[]      
            if(beforeData){
              Object.keys(beforeData).forEach(key => {
                  let exclude:boolean=false
                  if(history.exclude)
                  history.exclude.map((el:any)=>{
                    if(el == key) return exclude=true
                  })
                  if(!exclude && beforeData[key] !== item[key]){
                    fields.push(key)
                    newData.push(item[key])
                    oldData.push(beforeData[key])
                  }
              });              
            if (operation === 'update') {
              let query:any
              let name = listKey+'History'
              if(history.suffix)
                name = listKey+history.suffix
              if(history.distinct){
                query = context.query[name]
              }else{
                if(listName)
                query = context.query[listName]
                else query = context.query.History
              }
              fields.map((el:any,index:number)=>{
                query.createOne({
                  data: {
                    list:listKey,
                    newValue:newData[index],
                    oldValue:oldData[index],
                    itemId:item.id,
                    field:el,
                    modifiedBy:{connect:{id:context.session.data.id}}
                  },
                  query: 'id ',
                });
              })
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