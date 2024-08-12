import { Path } from 'graphql/jsutils/Path';

import {
  BaseListTypeInfo,
  fieldType,
  FieldTypeFunc,
  KeystoneContext,
} from '@keystone-6/core/types';
import { graphql } from '@keystone-6/core';
import {
  getImageMetaRef,
  getImageRef,
  isValidImageExtension,
  SUPPORTED_IMAGE_EXTENSIONS,
} from './utils';
import {
  ImagesData,
  ImageSize,
  S3FieldConfig,
  S3FieldInputType,
  S3ImagesConfig,
  S3ImagesSizes,
} from './types';
import { getDataFromRef, getDataFromStream, getUrl } from './s3';

const ImageExtensionEnum = graphql.enum({
  name: 'S3ImagesExtension',
  values: graphql.enumValues(SUPPORTED_IMAGE_EXTENSIONS),
});

const S3FieldInput = graphql.inputObject({
  name: 'S3ImagesFieldInput',
  fields: {
    upload: graphql.arg({ type: graphql.Upload }),
    ref: graphql.arg({ type: graphql.String }),
  },
});

function createInputResolver(config: S3ImagesConfig) {
  return async function inputResolver(data: S3FieldInputType, context: KeystoneContext) {
    if (data === null || data === undefined) {
      return { extension: data, filesize: data, height: data, id: data, width: data };
    }

    if (data.ref) {
      if (data.upload) {
        throw new Error('Only one of ref and upload can be passed to ImageFieldInput');
      }
      return getDataFromRef(config, data.ref) as any;
    }
    if (!data.upload) {
      throw new Error('Either ref or upload must be passed to ImageFieldInput');
    }
    return getDataFromStream(config, await data.upload, context);
  };
}

const _fieldConfigs: { [key: string]: S3ImagesConfig } = {};
const imageSizeEnum = graphql.enum({
  name: 'S3ImagesSizeEnum',
  values: graphql.enumValues(['base64', 'sm', 'md', 'lg', 'full']),
});

const imagesOutputFields = graphql.fields<Omit<ImagesData, 'size'>>()({
  id: graphql.field({ type: graphql.nonNull(graphql.ID) }),
  filesize: graphql.field({ type: graphql.nonNull(graphql.Int) }),
  width: graphql.field({ type: graphql.nonNull(graphql.Int) }),
  height: graphql.field({ type: graphql.nonNull(graphql.Int) }),
  sizesMeta: graphql.field({
    type: graphql.JSON,
    resolve(data) {
      return data.sizesMeta; // TODO type
    },
  }),
  extension: graphql.field({ type: graphql.nonNull(ImageExtensionEnum) }),
  ref: graphql.field({
    type: graphql.nonNull(graphql.String),
    args: {
      size: graphql.arg({
        type: graphql.nonNull(imageSizeEnum),
        defaultValue: 'md',
      }),
      meta: graphql.arg({
        type: graphql.nonNull(graphql.Boolean),
        defaultValue: false,
      }),
    },
    resolve(data, args) {
      return args.meta
        ? getImageMetaRef(data.id, data.sizesMeta)
        : getImageRef(data.id, args.size, data.extension);
    },
  }),
  url: graphql.field({
    type: graphql.String,
    args: {
      size: graphql.arg({
        type: imageSizeEnum,
        // defaultValue:  'md',
      }),
    },
    resolve(data, args, context, info) {
      const { key, typename } = info.path.prev as Path;
      const config = _fieldConfigs[`${typename}-${key}`];
      return getUrl(config, { ...data, size: args.size! });
    },
  }),
  srcSet: graphql.field({
    type: graphql.String,
    args: {
      sizes: graphql.arg({
        type: graphql.nonNull(graphql.list(graphql.nonNull(imageSizeEnum))),
        defaultValue: ['sm', 'md', 'lg', 'full'],
      }),
    },
    resolve(data, args, context, info) {
      const { key, typename } = info.path.prev as Path;
      const config = _fieldConfigs[`${typename}-${key}`];
      const { sizesMeta } = data;
      if (!sizesMeta) return null;
      return args.sizes
        .map(size => `${getUrl(config, { ...data, size })} ${sizesMeta[size]?.width}w`)
        .join(', ');
    },
  }),
});

const S3ImagesFieldOutput = graphql.interface<Omit<ImagesData, 'size'>>()({
  name: 'S3ImagesFieldOutput',
  fields: imagesOutputFields,
  resolveType: () => 'S3ImagesFieldOutputType',
});

const S3ImagesFieldOutputType = graphql.object<Omit<ImagesData, 'size'>>()({
  name: 'S3ImagesFieldOutputType',
  interfaces: [S3ImagesFieldOutput],
  fields: imagesOutputFields,
});

function getDefaultSize(sizes: S3ImagesSizes) {
  const excludedSizes = Object.entries(sizes)
    .filter(([, value]) => value === 0)
    .map(([size]) => size);
  const availableSizes = ['sm', 'md', 'lg', 'full'].filter(size => !excludedSizes.includes(size));
  console.log('excludedSizes', excludedSizes);
  console.log('availableSizes', availableSizes);
  return availableSizes.includes('md') ? 'md' : (availableSizes[0] as Exclude<ImageSize, 'base64'>);
}

function setDefaultConfig(config: S3ImagesConfig) {
  config.sizes = config.sizes || {};
  config.defaultSize = config.defaultSize || getDefaultSize(config.sizes);
  return config;
}

export const s3Images =
  <ListTypeInfo extends BaseListTypeInfo>({
    s3Config: _s3Config,
    ...config
  }: S3FieldConfig<ListTypeInfo>): FieldTypeFunc<ListTypeInfo> =>
    meta => {
      if (typeof _s3Config === 'undefined') {
        throw new Error(
          `Must provide s3Config option in S3Image field for List: ${meta.listKey}, field: ${meta.fieldKey}`
        );
      }
      const s3Config = setDefaultConfig(_s3Config);
      _fieldConfigs[`${meta.listKey}-${meta.fieldKey}`] = s3Config;
      return fieldType({
        kind: 'multi',
        fields: {
          filesize: { kind: 'scalar', scalar: 'Int', mode: 'optional' },
          extension: { kind: 'scalar', scalar: 'String', mode: 'optional' },
          width: { kind: 'scalar', scalar: 'Int', mode: 'optional' },
          height: { kind: 'scalar', scalar: 'Int', mode: 'optional' },
          id: { kind: 'scalar', scalar: 'String', mode: 'optional' },
          sizesMeta: { kind: 'scalar', scalar: 'Json', mode: 'optional' },
        },
      })({
        ...config,
        input: {
          create: {
            arg: graphql.arg({ type: S3FieldInput }),
            resolve: createInputResolver(s3Config as S3ImagesConfig),
          },
          update: {
            arg: graphql.arg({ type: S3FieldInput }),
            resolve: createInputResolver(s3Config as S3ImagesConfig),
          },
        },
        output: graphql.field({
          type: S3ImagesFieldOutput,
          resolve({ value: { extension, filesize, height, width, id, sizesMeta } }) {
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
            return {
              extension,
              filesize,
              height,
              width,
              id,
              sizesMeta: sizesMeta as Partial<Record<ImageSize, ImagesData>>,
            };
          },
        }),
        unreferencedConcreteInterfaceImplementations: [S3ImagesFieldOutputType],
        views: '@k6-contrib/fields-s3-images/views',
      });
    };
