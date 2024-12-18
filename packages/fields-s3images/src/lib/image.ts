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
  ImageAdapter,
  ImagesData,
  ImageSize,
  S3FieldConfig,
  S3FieldInputType,
  S3ImagesConfig,
  S3ImagesSizes,
} from './types';
import { getDataFromRef, getDataFromStream, getUrl } from './s3_1';
import { merge, s3ImageAssetsAPI } from './s3';

const ImageExtensionEnum = graphql.enum({
  name: 'S3ImagesExtension',
  values: graphql.enumValues(SUPPORTED_IMAGE_EXTENSIONS),
});

const S3FieldInput = graphql.inputObject({
  name: 'S3ImagesFieldInput',
  fields: {
    upload: graphql.arg({ type: graphql.Upload }),
  },
});

function createInputResolver(config: S3ImagesConfig) {
  return async function inputResolver(data: S3FieldInputType, context: KeystoneContext) {
    if (data === null || data === undefined) {
      return { extension: data, filesize: data, height: data, id: data, width: data };
    }

    if (!data.upload) {
      throw new Error('Either ref or upload must be passed to ImageFieldInput');
    }
    return getDataFromStream(config, await data.upload, context);
  };
}

// const _fieldConfigs: { [key: string]: S3ImagesConfig } = {};

const imageAssetsAPIs = new Map<string, ImageAdapter>();

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
      const adapter = imageAssetsAPIs.get(`${typename}-${key}`);
      return getUrl(adapter, { ...data, size: args.size! });
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
      const adapter = imageAssetsAPIs.get(`${typename}-${key}`);

      const { sizesMeta } = data;
      if (!sizesMeta) return null;
      return args.sizes
        .map(size => `${getUrl(adapter, { ...data, size })} ${sizesMeta[size]?.width}w`)
        .join(', ');
    },
  }),
});

const inputArg = graphql.arg({ type: S3FieldInput });

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
    const { listKey, fieldKey } = meta;
    const s3key = `${listKey}-${fieldKey}`;
    const s3Config = setDefaultConfig(_s3Config);
    const adapter = s3ImageAssetsAPI(_s3Config);
    imageAssetsAPIs.set(s3key, adapter);

    async function beforeOperationResolver(args: any) {
      if (args.operation === 'update' || args.operation === 'delete') {
        const idKey = `${fieldKey}_id`;
        const id = args.item[idKey];
        const extensionKey = `${fieldKey}_extension`;
        const extension = args.item[extensionKey];

        // This will occur on an update where an image already existed but has been
        // changed, or on a delete, where there is no longer an item
        if (
          (args.operation === 'delete' ||
            typeof args.resolvedData[fieldKey].id === 'string' ||
            args.resolvedData[fieldKey].id === null) &&
          typeof id === 'string' &&
          typeof extension === 'string' &&
          isValidImageExtension(extension)
        ) {
          await adapter.delete(id, extension);
        }
      }
    }

    return fieldType({
      kind: 'multi',
      extendPrismaSchema: config.db?.extendPrismaSchema,
      fields: {
        id: { kind: 'scalar', scalar: 'String', mode: 'optional' },
        filesize: { kind: 'scalar', scalar: 'Int', mode: 'optional' },
        width: { kind: 'scalar', scalar: 'Int', mode: 'optional' },
        height: { kind: 'scalar', scalar: 'Int', mode: 'optional' },
        extension: { kind: 'scalar', scalar: 'String', mode: 'optional' },
        sizesMeta: { kind: 'scalar', scalar: 'Json', mode: 'optional' },
      },
    })({
      ...config,
      hooks: s3Config.preserve
        ? config.hooks
        : {
            ...config.hooks,
            beforeOperation: {
              ...config.hooks?.beforeOperation,
              // @ts-expect-error
              update: merge(config.hooks?.beforeOperation?.update, beforeOperationResolver),
              // @ts-expect-error
              delete: merge(config.hooks?.beforeOperation?.delete, beforeOperationResolver),
            },
          },
      input: {
        create: {
          arg: inputArg,
          // @ts-expect-error
          resolve: createInputResolver(s3Config as S3ImagesConfig),
        },
        update: {
          arg: inputArg,
          // @ts-expect-error
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
