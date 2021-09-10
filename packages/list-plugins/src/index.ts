import { ListConfig, BaseGeneratedListTypes, BaseFields } from '@keystone-next/keystone/types';

import { atTracking } from './lib/tracking/atTracking';
import { byTracking } from './lib/tracking/byTracking';

import { AtTrackingOptions, ByTrackingOptions } from './lib/types';

export const configureTracking =
  ({
    atTrackingOptions,
    byTrackingOptions,
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
