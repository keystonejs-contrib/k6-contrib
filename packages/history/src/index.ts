import { ListConfig, BaseGeneratedListTypes, BaseFields } from '@keystone-next/keystone/types';

import { makeHistory } from './lib/history/makeHistory';

// import { historyOptions } from './lib/types';

export const configureHistory =
  () =>
  <Fields extends BaseFields<BaseGeneratedListTypes>>(
    listConfig: ListConfig<BaseGeneratedListTypes, Fields>
  ): ListConfig<BaseGeneratedListTypes, Fields> => {
    return (makeHistory()(listConfig));
  };

export * from './lib/types';
export * from './lib/history/makeHistory';
