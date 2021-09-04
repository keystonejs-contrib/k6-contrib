import path from 'path';
import { Path } from 'graphql/jsutils/Path';

import {
  BaseGeneratedListTypes,
  fieldType,
  FieldTypeFunc,
  ImageExtension,
  JSONValue,
  KeystoneContext,
  schema,
} from '@keystone-next/types';
import { getImageRef, SUPPORTED_IMAGE_EXTENSIONS } from './utils';
import { ImagesData, ImageSize, S3FieldConfig, S3FieldInputType, S3ImagesConfig } from './types';
import { getDataFromRef, getDataFromStream, getSrc } from './s3';

const views = path.join(
  path.dirname(require.resolve('@k6-contrib/fields-s3/package.json')),
  'views/image'
);

const ImageExtensionEnum = schema.enum({
  name: 'S3ImageExtension',
  values: schema.enumValues(SUPPORTED_IMAGE_EXTENSIONS),
});

const S3FieldInput = schema.inputObject({
  name: 'S3ImageFieldInput',
  fields: {
    upload: schema.arg({ type: schema.Upload }),
    ref: schema.arg({ type: schema.String }),
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
const imageSizeEnum = schema.enum({
  name: 'S3ImagesSizeEnum',
  values: schema.enumValues(['sm', 'md', 'lg', 'full']),
});

const imagesOutputFields = schema.fields<Omit<ImagesData, 'size'>>()({
  id: schema.field({ type: schema.nonNull(schema.ID) }),
  filesize: schema.field({ type: schema.nonNull(schema.Int) }),
  width: schema.field({ type: schema.nonNull(schema.Int) }),
  height: schema.field({ type: schema.nonNull(schema.Int) }),
  sizesMeta: schema.field({
    type: schema.JSON,
    resolve(data) {
      return data.sizesMeta; // TODO type
    },
  }),
  extension: schema.field({ type: schema.nonNull(ImageExtensionEnum) }),
  ref: schema.field({
    type: schema.nonNull(schema.String),
    args: {
      size: schema.arg({
        type: schema.nonNull(imageSizeEnum),
        defaultValue: 'md',
      }),
    },
    resolve(data, args) {
      return getImageRef(data.id, args.size, data.extension);
    },
  }),
  src: schema.field({
    type: schema.nonNull(schema.String),
    args: {
      size: schema.arg({
        type: schema.nonNull(imageSizeEnum),
        defaultValue: 'md',
      }),
    },
    resolve(data, args, context, info) {
      console.log(args.size);
      const { key, typename } = info.path.prev as Path;
      const config = _fieldConfigs[`${typename}-${key}`];
      return getSrc(config, { ...data, size: args.size });
    },
  }),
});

const S3ImagesFieldOutput = schema.interface<Omit<ImagesData, 'size'>>()({
  name: 'S3ImagesFieldOutput',
  fields: imagesOutputFields,
  resolveType: () => 'S3ImagesFieldOutputType',
});

const S3ImagesFieldOutputType = schema.object<Omit<ImagesData, 'size'>>()({
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
            arg: schema.arg({ type: S3FieldInput }),
            resolve: createInputResolver(s3Config as S3ImagesConfig),
          },
          update: {
            arg: schema.arg({ type: S3FieldInput }),
            resolve: createInputResolver(s3Config as S3ImagesConfig),
          },
        },
        output: schema.field({
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
