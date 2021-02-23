import path from 'path';
// @ts-ignore
import { File } from '@keystonejs/fields';
// @ts-ignore
// import { CloudinaryAdapter } from '@keystonejs/file-adapters';
import type { FieldType, FieldConfig, BaseGeneratedListTypes } from '@keystone-next/types';

type FileFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = FieldConfig<TGeneratedListTypes> & {
  isRequired?: boolean;
  // adapter: any;
};

export const file = <TGeneratedListTypes extends BaseGeneratedListTypes>({
  // adapter,
  ...config
}: FileFieldConfig<TGeneratedListTypes>): FieldType<TGeneratedListTypes> => ({
  type: File,
  config: {
    ...config,
    // @ts-ignore
    // adapter: new CloudinaryAdapter(cloudinary),
  },
  views: path.join(
    path.dirname(require.resolve('@keystonejs-contrib-next/fields-file/package.json')),
    'views'
  ),
});
