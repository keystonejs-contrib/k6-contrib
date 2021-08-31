import path from 'path';
import { Path } from 'graphql/jsutils/Path';

import {
  BaseGeneratedListTypes,
  fieldType,
  FieldTypeFunc,
  KeystoneContext,
  schema,
} from '@keystone-next/types';
import { getFileRef } from './utils';
import { AzureStorageFieldConfig, AzureStorageFieldInputType, AzureStorageConfig, AzureStorageDataType, FileData } from './types';
import { getDataFromRef, getDataFromStream, getSrc } from './blob';

const views = path.join(
  path.dirname(require.resolve('@k6-contrib/fields-azure/package.json')),
  'views/file'
);

const _fieldConfigs: { [key: string]: AzureStorageConfig } = {};

const AzureStorageFileFieldInput = schema.inputObject({
  name: 'AzureStorageFileFieldInput',
  fields: {
    upload: schema.arg({ type: schema.Upload }),
    ref: schema.arg({ type: schema.String }),
  },
});

const fileOutputFields = schema.fields<Omit<FileData, 'type'>>()({
  filename: schema.field({ type: schema.nonNull(schema.String) }),
  filesize: schema.field({ type: schema.nonNull(schema.Int) }),
  ref: schema.field({
    type: schema.nonNull(schema.String),
    resolve(data) {
      return getFileRef(data.filename);
    },
  }),
  src: schema.field({
    type: schema.nonNull(schema.String),
    resolve(data, args, context, info) {
      const { key, typename } = info.path.prev as Path;
      const config = _fieldConfigs[`${typename}-${key}`];
      return getSrc(config, { type: 'file', ...data } as AzureStorageDataType);
    },
  }),
});

const AzureStorageFileFieldOutput = schema.interface<Omit<FileData, 'type'>>()({
  name: 'AzureStorageFileFieldOutput',
  fields: fileOutputFields,
  resolveType: () => 'AzureStorageFileFieldOutputType',
});

const AzureStorageFileFieldOutputType = schema.object<Omit<FileData, 'type'>>()({
  name: 'AzureStorageFileFieldOutputType',
  interfaces: [AzureStorageFileFieldOutput],
  fields: fileOutputFields,
});

function createInputResolver(config: AzureStorageConfig) {
  return async function inputResolver(data: AzureStorageFieldInputType, context: KeystoneContext) {
    if (data === null || data === undefined) {
      return { filename: data, filesize: data };
    }

    if (data.ref) {
      if (data.upload) {
        throw new Error('Only one of ref and upload can be passed to AzureStorageFileFieldInput');
      }
      return getDataFromRef(config, 'file', data.ref) as any;
    }
    if (!data.upload) {
      throw new Error('Either ref or upload must be passed to FileFieldInput');
    }
    return getDataFromStream(config, 'file', await data.upload);
  };
}

export const azureStorageFile =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isRequired,
    defaultValue,
    azureStorageConfig,
    ...config
  }: AzureStorageFieldConfig<TGeneratedListTypes>): FieldTypeFunc =>
  meta => {
    if ((config as any).isUnique) {
      throw Error('isUnique is not a supported option for field type file');
    }

    if (typeof azureStorageConfig === 'undefined') {
      throw new Error(
        `Must provide AzureStorageConfig option in AzureStorageImage field for List: ${meta.listKey}, field: ${meta.fieldKey}`
      );
    }
    _fieldConfigs[`${meta.listKey}-${meta.fieldKey}`] = azureStorageConfig;

    return fieldType({
      kind: 'multi',
      fields: {
        filename: { kind: 'scalar', scalar: 'String', mode: 'optional' },
        filesize: { kind: 'scalar', scalar: 'Int', mode: 'optional' },
      },
    })({
      ...config,
      input: {
        create: {
          arg: schema.arg({ type: AzureStorageFileFieldInput }),
          resolve: createInputResolver(azureStorageConfig as AzureStorageConfig),
        },
        update: {
          arg: schema.arg({ type: AzureStorageFileFieldInput }),
          resolve: createInputResolver(azureStorageConfig as AzureStorageConfig),
        },
      },
      output: schema.field({
        type: AzureStorageFileFieldOutput,
        resolve({ value: { filename, filesize } }) {
          if (filename === null || filesize === null) {
            return null;
          }
          return { filename, filesize };
        },
      }),
      unreferencedConcreteInterfaceImplementations: [AzureStorageFileFieldOutputType],
      views,
      __legacy: {
        isRequired,
        defaultValue,
      },
    });
  };
