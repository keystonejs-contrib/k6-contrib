import path from 'path';

import {
  BaseGeneratedListTypes,
  fieldType,
  FieldTypeFunc,
  ImageExtension,
  KeystoneContext,
  schema,
} from '@keystone-next/types';
import { getImageRef, SUPPORTED_IMAGE_EXTENSIONS } from './utils';
import { ImageData, ImageFieldConfig, ImageFieldInputType, S3Config } from './types';
import { getDataFromRef, getDataFromStream, getSrc } from './s3';

const views = path.join(
  path.dirname(require.resolve('@keystone-next/fields-s3/package.json')),
  'views'
);

const ImageExtensionEnum = schema.enum({
  name: 'ImageExtension',
  values: schema.enumValues(SUPPORTED_IMAGE_EXTENSIONS),
});

function createInputResolver(config: S3Config) {
  return async function inputResolver(data: ImageFieldInputType, context: KeystoneContext) {
    if (data === null || data === undefined) {
      return { extension: data, filesize: data, height: data, id: data, mode: data, width: data };
    }

    if (data.ref) {
      if (data.upload) {
        throw new Error('Only one of ref and upload can be passed to ImageFieldInput');
      }
      return getDataFromRef(config, 'image', data.ref);
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

export const s3Image =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isRequired,
    defaultValue,
    s3Config,
    ...config
  }: ImageFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  () => {
    if ((config as any).isUnique) {
      throw Error('isUnique is not a supported option for field type image');
    }

    const ImageFieldInput = schema.inputObject({
      name: 'ImageFieldInput',
      fields: {
        upload: schema.arg({ type: schema.Upload }),
        ref: schema.arg({ type: schema.String }),
      },
    });

    const imageOutputFields = schema.fields<ImageData>()({
      id: schema.field({ type: schema.nonNull(schema.ID) }),
      filesize: schema.field({ type: schema.nonNull(schema.Int) }),
      width: schema.field({ type: schema.nonNull(schema.Int) }),
      height: schema.field({ type: schema.nonNull(schema.Int) }),
      extension: schema.field({ type: schema.nonNull(ImageExtensionEnum) }),
      ref: schema.field({
        type: schema.nonNull(schema.String),
        resolve(data) {
          return getImageRef(data.mode, data.id, data.extension);
        },
      }),
      src: schema.field({
        type: schema.nonNull(schema.String),
        resolve(data, args, context) {
          return getSrc(s3Config as S3Config, data);
        },
      }),
    });

    const ImageFieldOutput = schema.interface<ImageData>()({
      name: 'ImageFieldOutput',
      fields: imageOutputFields,
      resolveType: () => 'LocalImageFieldOutput',
    });

    const LocalImageFieldOutput = schema.object<ImageData>()({
      name: 'LocalImageFieldOutput',
      interfaces: [ImageFieldOutput],
      fields: imageOutputFields,
    });
    return fieldType({
      kind: 'multi',
      fields: {
        filesize: { kind: 'scalar', scalar: 'Int', mode: 'optional' },
        extension: { kind: 'scalar', scalar: 'String', mode: 'optional' },
        width: { kind: 'scalar', scalar: 'Int', mode: 'optional' },
        height: { kind: 'scalar', scalar: 'Int', mode: 'optional' },
        mode: { kind: 'scalar', scalar: 'String', mode: 'optional' },
        id: { kind: 'scalar', scalar: 'String', mode: 'optional' },
      },
    })({
      ...config,
      input: {
        create: {
          arg: schema.arg({ type: ImageFieldInput }),
          resolve: createInputResolver(s3Config as S3Config),
        },
        update: {
          arg: schema.arg({ type: ImageFieldInput }),
          resolve: createInputResolver(s3Config as S3Config),
        },
      },
      output: schema.field({
        type: ImageFieldOutput,
        resolve({ value: { extension, filesize, height, id, mode, width } }) {
          if (
            extension === null ||
            !isValidImageExtension(extension) ||
            filesize === null ||
            height === null ||
            width === null ||
            id === null ||
            mode === null ||
            mode !== 's3'
          ) {
            return null;
          }
          return { mode, extension, filesize, height, width, id };
        },
      }),
      unreferencedConcreteInterfaceImplementations: [LocalImageFieldOutput],
      views,
      __legacy: {
        isRequired,
        defaultValue,
      },
    });
  };
