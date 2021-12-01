import { ListConfig, BaseGeneratedListTypes, BaseFields } from '@keystone-6/core/types';

import { atTracking } from './lib/tracking/atTracking';
import { byTracking } from './lib/tracking/byTracking';

import { AtTrackingOptions, ByTrackingOptions } from './lib/types';

export const configureTracking =
  ({
    atTrackingOptions = {},
    byTrackingOptions = { ref: 'User' },
  }: {
    atTrackingOptions?: AtTrackingOptions;
    byTrackingOptions?: ByTrackingOptions;
  }) =>
  <Fields extends BaseFields<BaseGeneratedListTypes>>(
    listConfig: ListConfig<BaseGeneratedListTypes, Fields>
  ): ListConfig<BaseGeneratedListTypes, Fields> => {
    return byTracking(byTrackingOptions)(atTracking(atTrackingOptions)(listConfig));
  };

export * from './lib/types';
export * from './lib/tracking/atTracking';
export * from './lib/tracking/byTracking';

export { logging } from './lib/logging';
