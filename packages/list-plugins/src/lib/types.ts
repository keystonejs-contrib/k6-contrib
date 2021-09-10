import { BaseGeneratedListTypes, CommonFieldConfig, ListHooks } from '@keystone-next/keystone/types';

export type ListTrackingOptions = {
  created?: boolean;
  updated?: boolean;
} & CommonFieldConfig<BaseGeneratedListTypes>;

export type AtTrackingOptions = {
  createdAtField?: string;
  updatedAtField?: string;
} & ListTrackingOptions;

export type ByTrackingOptions = {
  createdByField?: string;
  updatedByField?: string;
  ref?: string;
} & ListTrackingOptions;

export type ResolveInputHook = ListHooks<BaseGeneratedListTypes>['resolveInput'];

