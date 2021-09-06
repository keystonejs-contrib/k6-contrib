import path from 'path';
import { Path } from 'graphql/jsutils/Path';

import {
  BaseGeneratedListTypes,
  fieldType,
  FieldTypeFunc,
  ImageExtension,
  KeystoneContext,
  graphql,
} from '@keystone-next/keystone/types';
import { getImageRef, SUPPORTED_IMAGE_EXTENSIONS } from './utils';
import { ImagesData, ImageSize, S3FieldConfig, S3FieldInputType, S3ImagesConfig } from './types';
import { getDataFromRef, getDataFromStream, getSrc } from './s3';

const views = path.join(
  path.dirname(require.resolve('@k6-contrib/fields-s3/package.json')),
  'views/image'
);

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
const extensionsSet = new Set(SUPPORTED_IMAGE_EXTENSIONS);

function isValidImageExtension(extension: string): extension is ImageExtension {
  return extensionsSet.has(extension);
}

const _fieldConfigs: { [key: string]: S3ImagesConfig } = {};
const imageSizeEnum = graphql.enum({
  name: 'S3ImagesSizeEnum',
  values: graphql.enumValues(['sm', 'md', 'lg', 'full']),
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
    },
    resolve(data, args) {
      return getImageRef(data.id, args.size, data.extension);
    },
  }),
  src: graphql.field({
    type: graphql.nonNull(graphql.String),
    args: {
      size: graphql.arg({
        type: graphql.nonNull(imageSizeEnum),
        defaultValue: 'md',
      }),
    },
    resolve(data, args, context, info) {
      const { key, typename } = info.path.prev as Path;
      const config = _fieldConfigs[`${typename}-${key}`];
      return getSrc(config, { ...data, size: args.size });
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

export const s3Images =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isRequired,
    defaultValue,
    s3Config,
    ...config
  }: S3FieldConfig<TGeneratedListTypes>): FieldTypeFunc =>
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
            return { extension, filesize, height, width, id, sizesMeta: sizesMeta as Partial<Record<ImageSize, ImagesData>> };
          },
        }),
        unreferencedConcreteInterfaceImplementations: [S3ImagesFieldOutputType],
        views,
        __legacy: {
          isRequired,
          defaultValue,
        },
      });
    };
