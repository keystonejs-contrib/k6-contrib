import { ListConfig, BaseListTypeInfo, BaseFields } from '@keystone-6/core/types';

import { atTracking } from './lib/tracking/atTracking';
import { byTracking } from './lib/tracking/byTracking';

import { AtTrackingOptions, ByTrackingOptions } from './lib/types';

export function configureTracking({
  atTrackingOptions = {},
  byTrackingOptions = { ref: 'User' },
}: {
  atTrackingOptions?: AtTrackingOptions;
  byTrackingOptions?: ByTrackingOptions;
}) {
  return function list<ListTypeInfo extends BaseListTypeInfo>(
      listConfig: ListConfig<ListTypeInfo>
    ): ListConfig<ListTypeInfo> {
    return byTracking(byTrackingOptions)(atTracking(atTrackingOptions)(listConfig));
  }
}

export type { AtTrackingOptions, ByTrackingOptions } from './lib/types';
export { atTracking, createdAt, updatedAt } from './lib/tracking/atTracking';
export { byTracking, createdBy, updatedBy } from './lib/tracking/byTracking';

export { logging } from './lib/logging';
