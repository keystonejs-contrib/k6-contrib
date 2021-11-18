import {
    KeystoneConfig,
  } from '@keystone-next/keystone/types';
  import { configureHistory } from './configuration';
  import { text, timestamp } from '@keystone-next/keystone/fields';
  
  // import { HistoryConfig} from './lib/types';
  import { list } from '@keystone-next/keystone';
  const makeHistory = configureHistory();
  /**
   * createHistory function
   *
   * Generates config for Keystone to implement standard History features.
   */
  export function createHistory() {
    
    /**
     * withHistory6
     *
     * Automatically extends config with the correct History functionality. This is the easiest way to
     * configure History for keystone; you should probably use it unless you want to extend or replace
     * the way History is set up with custom functionality.
     *
     * It validates the History config against the provided keystone config, and preserves existing
     * config by composing existing extendGraphqlSchema functions and ui config.
     */

    const withHistory = (keystoneConfig: KeystoneConfig): KeystoneConfig => {

    // History List
    keystoneConfig.lists  = {...keystoneConfig.lists,
      ['History']:list({
            ui: {
              isHidden:true
            },
            fields: {
              orignal: text({ 
                ui: {
                  createView: {
                    fieldMode: 'hidden',
                  },
                  itemView: {
                    fieldMode: 'read',
                  },
                },
              }),
              operation: text({
                ui: {
                  createView: {
                    fieldMode: 'hidden',
                  },
                  itemView: {
                    fieldMode: 'read',
                  },
                },
              }),
              oldValue: text(),
              newValue: text(),
              createdAt: timestamp({ defaultValue: { kind: 'now' },
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
        if(keystoneConfig.lists[key]?.history){
          if(keystoneConfig.lists[key]?.history?.separate){
            keystoneConfig.lists  = {...keystoneConfig.lists,
            [key+'History']:list({
              ui: {
                isHidden:true
              },
              fields: {
                orignal: text({ 
                  ui: {
                    createView: {
                      fieldMode: 'hidden',
                    },
                    itemView: {
                      fieldMode: 'read',
                    },
                  },
                }),
                operation: text({
                  ui: {
                    createView: {
                      fieldMode: 'hidden',
                    },
                    itemView: {
                      fieldMode: 'read',
                    },
                  },
                }),
                oldValue: text(),
                newValue: text(),
                createdAt: timestamp({ defaultValue: { kind: 'now' },
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
      // if (!keystoneConfig.session) throw new TypeError('Missing .session configuration');
      
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
      // ui: { enableSessionItem: true, pageMiddleware, getAdditionalFiles, publicPages },
      // fields,
      // extendGraphqlSchema,
      // validateConfig,
    }
  }
  