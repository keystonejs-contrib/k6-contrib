import path from 'path';
import { Path } from 'graphql/jsutils/Path';

import {
  BaseGeneratedListTypes,
  fieldType,
  FieldTypeFunc,
  ImageExtension,
  KeystoneContext,
} from '@keystone-6/core/types';
import { graphql } from '@keystone-6/core';
import { getImageRef, SUPPORTED_IMAGE_EXTENSIONS } from './utils';
import {
  ImageData,
  AzureStorageFieldConfig,
  AzureStorageFieldInputType,
  AzureStorageConfig,
  AzureStorageDataType,
} from './types';
import { getDataFromRef, getDataFromStream, getUrl } from './blob';

const views = path.join(path.dirname(__dirname), 'views/image');

const ImageExtensionEnum = graphql.enum({
  name: 'AzureStorageImageExtension',
  values: graphql.enumValues(SUPPORTED_IMAGE_EXTENSIONS),
});

const AzureStorageFieldInput = graphql.inputObject({
  name: 'AzureStorageImageFieldInput',
  fields: {
    upload: graphql.arg({ type: graphql.Upload }),
    ref: graphql.arg({ type: graphql.String }),
  },
});

function createInputResolver(config: AzureStorageConfig) {
  return async function inputResolver(data: AzureStorageFieldInputType, context: KeystoneContext) {
    if (data === null || data === undefined) {
      return { extension: data, filesize: data, height: data, id: data, width: data };
    }

    if (data.ref) {
      if (data.upload) {
        throw new Error('Only one of ref and upload can be passed to ImageFieldInput');
      }
      return getDataFromRef(config, 'image', data.ref) as any;
    }
    if (!data.upload) {
      throw new Error('Either ref or upload must be passed to ImageFieldInput');
    }
    return getDataFromStream(config, 'image', await data.upload);
  };
}
const extensionsSet = new Set(SUPPORTED_IMAGE_EXTENSIONS);

function isValidImageExtension(extension: string): extension is ImageExtension {
  return extensionsSet.has(extension);
}

const _fieldConfigs: { [key: string]: AzureStorageConfig } = {};

const imageOutputFields = graphql.fields<Omit<ImageData, 'type'>>()({
  id: graphql.field({ type: graphql.nonNull(graphql.ID) }),
  filesize: graphql.field({ type: graphql.nonNull(graphql.Int) }),
  width: graphql.field({ type: graphql.nonNull(graphql.Int) }),
  height: graphql.field({ type: graphql.nonNull(graphql.Int) }),
  extension: graphql.field({ type: graphql.nonNull(ImageExtensionEnum) }),
  ref: graphql.field({
    type: graphql.nonNull(graphql.String),
    resolve(data) {
      return getImageRef(data.id, data.extension);
    },
  }),
  url: graphql.field({
    type: graphql.nonNull(graphql.String),
    resolve(data, args, context, info) {
      const { key, typename } = info.path.prev as Path;
      const config = _fieldConfigs[`${typename}-${key}`];
      return getUrl(config, { type: 'image', ...data } as AzureStorageDataType);
    },
  }),
});

const AzureStorageImageFieldOutput = graphql.interface<Omit<ImageData, 'type'>>()({
  name: 'AzureStorageImageFieldOutput',
  fields: imageOutputFields,
  resolveType: () => 'AzureStorageImageFieldOutputType',
});

const AzureStorageImageFieldOutputType = graphql.object<Omit<ImageData, 'type'>>()({
  name: 'AzureStorageImageFieldOutputType',
  interfaces: [AzureStorageImageFieldOutput],
  fields: imageOutputFields,
});

export const azureStorageImage =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    azureStorageConfig,
    ...config
  }: AzureStorageFieldConfig<TGeneratedListTypes>): FieldTypeFunc =>
  meta => {
    if ((config as any).isUnique) {
      throw Error('isUnique is not a supported option for field type image');
    }
    if (typeof azureStorageConfig === 'undefined') {
      throw new Error(
        `Must provide azureStorageConfig option in AzureStorageImage field for List: ${meta.listKey}, field: ${meta.fieldKey}`
      );
    }
    _fieldConfigs[`${meta.listKey}-${meta.fieldKey}`] = azureStorageConfig;
    return fieldType({
      kind: 'multi',
      fields: {
        filesize: { kind: 'scalar', scalar: 'Int', mode: 'optional' },
        extension: { kind: 'scalar', scalar: 'String', mode: 'optional' },
        width: { kind: 'scalar', scalar: 'Int', mode: 'optional' },
        height: { kind: 'scalar', scalar: 'Int', mode: 'optional' },
        id: { kind: 'scalar', scalar: 'String', mode: 'optional' },
      },
    })({
      ...config,
      input: {
        create: {
          arg: graphql.arg({ type: AzureStorageFieldInput }),
          resolve: createInputResolver(azureStorageConfig as AzureStorageConfig),
        },
        update: {
          arg: graphql.arg({ type: AzureStorageFieldInput }),
          resolve: createInputResolver(azureStorageConfig as AzureStorageConfig),
        },
      },
      output: graphql.field({
        type: AzureStorageImageFieldOutput,
        resolve({ value: { extension, filesize, height, width, id } }) {
          if (
            extension === null ||
            !isValidImageExtension(extension) ||
            filesize === null ||
            height === null ||
            width === null ||
            id === null
          ) {
            return null;
          }
          return { extension, filesize, height, width, id };
        },
      }),
      unreferencedConcreteInterfaceImplementations: [AzureStorageImageFieldOutputType],
      views,
    });
  };
