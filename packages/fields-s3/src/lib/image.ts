import path from 'path';

import {
  BaseListTypeInfo,
  fieldType,
  FieldTypeFunc,
} from '@keystone-6/core/types';
import { graphql } from '@keystone-6/core';
import { getImageRef, SUPPORTED_IMAGE_EXTENSIONS, isValidImageExtension } from './utils';
import { ImageData, S3FieldConfig, S3FieldInputType, S3Config, S3DataType } from './types';
import { getDataFromRef, getDataFromStream, getUrl } from './s3';

const views = path.join(path.dirname(__dirname), 'views/image');

const ImageExtensionEnum = graphql.enum({
  name: 'S3ImageExtension',
  values: graphql.enumValues(SUPPORTED_IMAGE_EXTENSIONS),
});

const S3FieldInput = graphql.inputObject({
  name: 'S3ImageFieldInput',
  fields: {
    upload: graphql.arg({ type: graphql.Upload }),
    ref: graphql.arg({ type: graphql.String }),
  },
});

function createInputResolver(config: S3Config) {
  return async function inputResolver(data: S3FieldInputType) {
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

const _fieldConfigs: { [key: string]: S3Config } = {};

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
      const { key, typename } = info.path.prev!;
      const config = _fieldConfigs[`${typename}-${key}`];
      return getUrl(config, { type: 'image', ...data } as S3DataType);
    },
  }),
});

const S3ImageFieldOutput = graphql.interface<Omit<ImageData, 'type'>>()({
  name: 'S3ImageFieldOutput',
  fields: imageOutputFields,
  resolveType: () => 'S3ImageFieldOutputType',
});

const S3ImageFieldOutputType = graphql.object<Omit<ImageData, 'type'>>()({
  name: 'S3ImageFieldOutputType',
  interfaces: [S3ImageFieldOutput],
  fields: imageOutputFields,
});

export const s3Image =
  <ListTypeInfo extends BaseListTypeInfo>({
    s3Config,
    ...config
  }: S3FieldConfig<ListTypeInfo>): FieldTypeFunc<ListTypeInfo> =>
  meta => {
    if ((config as any).isUnique) {
      throw Error('isUnique is not a supported option for field type image');
    }
    if (typeof s3Config === 'undefined') {
      throw new Error(
        `Must provide s3Config option in S3Image field for List: ${meta.listKey}, field: ${meta.fieldKey}`
      );
    }
    _fieldConfigs[`${meta.listKey}-${meta.fieldKey}`] = s3Config;
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
          arg: graphql.arg({ type: S3FieldInput }),
          resolve: createInputResolver(s3Config as S3Config),
        },
        update: {
          arg: graphql.arg({ type: S3FieldInput }),
          resolve: createInputResolver(s3Config as S3Config),
        },
      },
      output: graphql.field({
        type: S3ImageFieldOutput,
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
      unreferencedConcreteInterfaceImplementations: [S3ImageFieldOutputType],
      views,
    });
  };
