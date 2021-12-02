import {
    KeystoneConfig,
  } from '@keystone-6/core/types';
  import { configureHistory } from './configuration';
  import {argsType} from './types';
  import { relationship, text, timestamp } from '@keystone-6/core/fields';
  
  // import { HistoryConfig} from './lib/types';
  import { list } from '@keystone-6/core';
  /**
   * createHistory function
   *
   * Generates config for Keystone to implement standard History features.
   */
  export function createHistory({listName}:argsType) {
    const makeHistory = configureHistory({listName});
    /**
     * withHistory6
     *
     * Automatically extends config with the correct History functionality. This is the easiest way to
     * configure History for keystone; you should probably use it unless you want to extend or replace
     * the way History is set up with custom functionality.
     *
     */

    const withHistory = (keystoneConfig: KeystoneConfig): KeystoneConfig => {

    // History List
    keystoneConfig.lists  = {...keystoneConfig.lists,
      [listName?listName:listName]:list({
            // ui: {
            //   isHidden:true
            // },
            fields: {
              list: text(),
              itemId: text({ 
                ui: {
                  createView: {
                    fieldMode: 'hidden',
                  },
                  itemView: {
                    fieldMode: 'read',
                  },
                },
              }),
              field: text(),
              oldValue: text(),
              newValue: text(),
              modifiedBy: relationship({ ref:'User' }),
              modifiedAt: timestamp({ defaultValue: { kind: 'now' },
                ui: {
                  createView: {
                    fieldMode: 'hidden',
                  },
                  itemView: {
                    fieldMode: 'read',
                  },
                },
              })
            },
        }),
      }

      Object.keys(keystoneConfig.lists).forEach(key => {
        let name = key+listName;
        if(keystoneConfig.lists[key]?.history?.suffix)
            name = key+keystoneConfig.lists[key]?.history?.suffix
        if(keystoneConfig.lists[key]?.history){
          if(keystoneConfig.lists[key]?.history?.exclusive){
            keystoneConfig.lists  = {...keystoneConfig.lists,
            [name]:list({
              // ui: {
              //   isHidden:true
              // },
              fields: {
                list: text(),
                itemId: text({ 
                  ui: {
                    createView: {
                      fieldMode: 'hidden',
                    },
                    itemView: {
                      fieldMode: 'read',
                    },
                  },
                }),
                field: text(),
                oldValue: text(),
                newValue: text(),
                modifiedBy: relationship({ref:'User'}),
                modifiedAt: timestamp({ defaultValue: { kind: 'now' },
                  ui: {
                    createView: {
                      fieldMode: 'hidden',
                    },
                    itemView: {
                      fieldMode: 'read',
                    },
                  },
                })
              },
          }),
            }
          }
          if(keystoneConfig.lists[key].history.history){
            keystoneConfig.lists[key]=list(makeHistory(keystoneConfig.lists[key]))
          }
        }
      });   
      
      return {
        ...keystoneConfig, 
        // Add the additional fields to the references lists fields object
        // TODO: The fields we're adding here shouldn't naively replace existing fields with the same key
        // Leaving existing fields in place would allow solution devs to customise these field defs (eg. access control,
        // work factor for the tokens, etc.) without abandoning the withHistory() interface
      };
    };
  
    return {
      withHistory,
      // In the future we may want to return the following so that developers can
      // roll their own. This is pending a review of the use cases this might be
      // appropriate for, along with documentation and testing.
    }
  }
  