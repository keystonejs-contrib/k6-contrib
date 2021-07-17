import path from 'path';
// @ts-ignore
import { File } from '@keystone-next/fields-legacy';
import type { FieldType, FieldConfig, BaseGeneratedListTypes } from '@keystone-next/types';

type FileFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes> = FieldConfig<TGeneratedListTypes> & {
  isRequired?: boolean;
  adapter: any;
};

export const file = <TGeneratedListTypes extends BaseGeneratedListTypes>({
  adapter,
  ...config
}: FileFieldConfig<TGeneratedListTypes>): FieldType<TGeneratedListTypes> => ({
  type: File,
  config: {
    ...config,
    // @ts-ignore
    adapter,
  },
  views: path.join(
    path.dirname(require.resolve('@k6-contrib/fields-file/package.json')),
    'views'
  ),
});
