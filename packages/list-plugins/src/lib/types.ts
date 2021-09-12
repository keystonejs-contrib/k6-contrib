import { RelationshipFieldConfig } from '@keystone-next/keystone/dist/declarations/src/fields/types/relationship';
import { TimestampFieldConfig } from '@keystone-next/keystone/dist/declarations/src/fields/types/timestamp';
import { BaseGeneratedListTypes, ListHooks } from '@keystone-next/keystone/types';

export type AtTrackingOptions = {
  created?: boolean;
  updated?: boolean;
  createdAtField?: string;
  updatedAtField?: string;
  isIndexed?: boolean | 'unique';
} & TimestampFieldConfig<BaseGeneratedListTypes>;

export type ByTrackingOptions = {
  created?: boolean;
  updated?: boolean;
  createdByField?: string;
  updatedByField?: string;
  ref?: string;
} & RelationshipFieldConfig<BaseGeneratedListTypes>;

export type ResolveInputHook = ListHooks<BaseGeneratedListTypes>['resolveInput'];
