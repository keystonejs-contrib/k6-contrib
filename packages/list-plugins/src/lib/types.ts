import { BaseListTypeInfo, SimpleFieldTypeInfo, CommonFieldConfig, ListHooks } from '@keystone-6/core/types';

export type AtTrackingOptions = {
  created?: boolean;
  updated?: boolean;
  createdAtField?: string;
  updatedAtField?: string;
  isIndexed?: boolean | 'unique';
} & CommonFieldConfig<BaseListTypeInfo, SimpleFieldTypeInfo<'DateTime' | 'String'>>;

export type ByTrackingOptions = {
  created?: boolean;
  updated?: boolean;
  createdByField?: string;
  updatedByField?: string;
  ref: string;
} & CommonFieldConfig<BaseListTypeInfo, SimpleFieldTypeInfo<'DateTime' | 'String'>>;

export type ResolveInputHook = ListHooks<BaseListTypeInfo>['resolveInput'];
