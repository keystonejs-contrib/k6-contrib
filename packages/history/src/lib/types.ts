import { BaseGeneratedListTypes, CommonFieldConfig, ListHooks } from '@keystone-next/keystone/types';

export type historyOptions = {

} & CommonFieldConfig<BaseGeneratedListTypes>;

export type HistoryConfig<GeneratedListTypes extends BaseGeneratedListTypes> = {
    /** The key of the list to authenticate users with */
    listKey: GeneratedListTypes['key'];
    /** Session data population */
    sessionData?: string;
  };
export type ResolveInputHook = ListHooks<BaseGeneratedListTypes>['resolveInput'];
