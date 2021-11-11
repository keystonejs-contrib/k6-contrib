import { BaseGeneratedListTypes, CommonFieldConfig, ListHooks } from '@keystone-next/keystone/types';

export type HistoryOptions = {
  createdAtField?: string;
  updatedAtField?: string;
  isIndexed?: boolean | 'unique';

} & CommonFieldConfig<BaseGeneratedListTypes>;

export type ResolveInputHook = ListHooks<BaseGeneratedListTypes>['resolveInput'];
