import { ListConfig, BaseGeneratedListTypes, BaseFields } from '@keystone-next/keystone/types';

// const { atTracking, createdAt, updatedAt } = require('./lib/tracking/atTracking');
// const { byTracking, createdBy, updatedBy } = require('./lib/tracking/byTracking');
// const { singleton } = require('./lib/limiting/singleton');

import { atTracking } from './lib/tracking/atTracking';
import { byTracking } from './lib/tracking/byTracking';

import { AtTrackingOptions, ByTrackingOptions } from './lib/types';

export function configureTracking<Fields extends BaseFields<BaseGeneratedListTypes>>({
  atTrackingOptions,
  byTrackingOptions,
}: {
  atTrackingOptions?: AtTrackingOptions;
  byTrackingOptions?: ByTrackingOptions;
}): (
  listConfig: ListConfig<BaseGeneratedListTypes, Fields>
) => ListConfig<BaseGeneratedListTypes, Fields> {
  return (
    listConfig: ListConfig<BaseGeneratedListTypes, Fields>
  ): ListConfig<BaseGeneratedListTypes, Fields> => {
    return byTracking(byTrackingOptions)(atTracking(atTrackingOptions)(listConfig));
  };
}

export * from './lib/types';
export * from './lib/tracking/atTracking';
export * from './lib/tracking/byTracking';

export { logging } from './lib/logging';
