import { ListConfig, BaseGeneratedListTypes, BaseFields } from '@keystone-next/keystone/types';

import { makeHistory } from './lib/history/makeHistory';

import { HistoryOptions } from './lib/types';

export const configureHistory =
  ({
    HistoryOptions = {},
  }: {
    HistoryOptions?: HistoryOptions;
  }) =>
  <Fields extends BaseFields<BaseGeneratedListTypes>>(
    listConfig: ListConfig<BaseGeneratedListTypes, Fields>
  ): ListConfig<BaseGeneratedListTypes, Fields> => {
    return (makeHistory(HistoryOptions)(listConfig));
  };

export * from './lib/types';
export * from './lib/history/makeHistory';

export { logging } from './lib/logging';
