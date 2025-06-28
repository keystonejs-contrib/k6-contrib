import { extname } from 'node:path';
import { randomBytes } from 'node:crypto';

import { Path } from 'graphql/jsutils/Path';
import { FileUpload } from 'graphql-upload';
import {
  BaseListTypeInfo,
  fieldType,
  FieldTypeFunc,
  KeystoneContext,
} from '@keystone-6/core/types';
import { g } from '@keystone-6/core';
import {
  isValidImageExtension,
  normalizeImageExtension,
  SUPPORTED_IMAGE_EXTENSIONS,
} from './utils';
import {
  ImageAdapter,
  ImageExtension,
  ImagesData,
  ImageSize,
  S3FieldConfig,
  S3FieldInputType,
  S3ImagesConfig,
  S3ImagesSizes,
} from './types';
import { merge, s3ImageAssetsAPI } from './s3';
import sharp from 'sharp';
import cuid from 'cuid';

const ImageExtensionEnum = g.enum({
  name: 'S3ImagesExtension',
  values: g.enumValues(SUPPORTED_IMAGE_EXTENSIONS),
});

const S3FieldInput = g.inputObject({
  name: 'S3ImagesFieldInput',
  fields: {
    upload: g.arg({ type: g.Upload }),
  },
});

function defaultTransformName(path: string) {
  return randomBytes(16).toString('base64url').toLowerCase();
}

export async function getDataFromStream(
  config: S3ImagesConfig,
  adapter: ImageAdapter,
  upload: FileUpload,
  context: KeystoneContext
): Promise<Omit<ImagesData, 'size' | 'url'>> {
  const { createReadStream, filename: originalFilename, mimetype } = upload;

  const extension = normalizeImageExtension(
    extname(originalFilename).replace(/^\./, '').toLowerCase()
  );

  const imagePipeline = sharp();
  createReadStream().pipe(imagePipeline);
  const metadata = await imagePipeline.metadata();

  const { transformName = defaultTransformName } = config;

  const fileId = cuid();
  const id = (await transformName(originalFilename, extension, 'full')) || fileId;
  const fileData: Omit<ImagesData, 'url'> = {
    id,
    height: metadata.height as number,
    width: metadata.width as number,
    filesize: metadata.size as number,
    extension,
    size: 'full',
  };
  fileData.sizesMeta = { full: { ...fileData } };

  await adapter.upload(
    createReadStream(),
    id,
    extension,
    'full',
    metadata.height || 0,
    metadata.width || 0
  );

  const sm = config.sizes?.sm ?? 360;
  if (sm) {
    // upload sm image
    const smFile = await imagePipeline.clone().resize(sm).toBuffer({ resolveWithObject: true });
    const smFileData: Omit<ImagesData, 'url'> = {
      id,
      height: smFile.info.height,
      width: smFile.info.width,
      filesize: smFile.info.size,
      extension,
      size: 'sm',
    };
    fileData.sizesMeta.sm = smFileData;

    await adapter.upload(
      smFile.data,
      id,
      extension,
      'sm',
      smFileData.height || 0,
      smFileData.width || 0
    );
  }

  // upload md image
  const md = config.sizes?.md ?? 720;
  if (md) {
    const mdFile = await imagePipeline.clone().resize(md).toBuffer({ resolveWithObject: true });
    const mdFileData: Omit<ImagesData, 'url'> = {
      id,
      height: mdFile.info.height,
      width: mdFile.info.width,
      filesize: mdFile.info.size,
      extension,
      size: 'md',
    };
    fileData.sizesMeta.md = mdFileData;

    await adapter.upload(
      mdFile.data,
      id,
      extension,
      'md',
      mdFileData.height || 0,
      mdFileData.width || 0
    );
  }

  const lg = config.sizes?.lg ?? 1280;
  // upload lg image
  if (lg) {
    const lgFile = await imagePipeline.clone().resize(lg).toBuffer({ resolveWithObject: true });
    const lgFileData: Omit<ImagesData, 'url'> = {
      id,
      height: lgFile.info.height,
      width: lgFile.info.width,
      filesize: lgFile.info.size,
      extension,
      size: 'lg',
    };
    fileData.sizesMeta.lg = lgFileData;

    await adapter.upload(
      lgFile.data,
      id,
      extension,
      'lg',
      lgFileData.height || 0,
      lgFileData.width || 0
    );
  }
  if (config.sizes?.base64) {
    const base64 = await imagePipeline
      .clone()
      .resize(config.sizes.base64)
      .toBuffer({ resolveWithObject: true });

    const base64Data: Omit<ImagesData, 'url'> = {
      id,
      height: base64.info.height,
      width: base64.info.width,
      filesize: base64.info.size,
      extension: 'png',
      size: 'base64',
      base64Data: `data:image/png;base64,${base64.data.toString('base64')}`,
    };

    fileData.sizesMeta.base64 = base64Data;
  }

  const { size, ...result } = fileData;
  return result;
}

function createInputResolver(config: S3ImagesConfig, adapter: ImageAdapter) {
  return async function inputResolver(data: S3FieldInputType, context: KeystoneContext) {
    if (data === null || data === undefined) {
      return { extension: data, filesize: data, height: data, id: data, width: data };
    }

    if (!data.upload) {
      throw new Error('Either ref or upload must be passed to ImageFieldInput');
    }
    return getDataFromStream(config, adapter, await data.upload, context);
  };
}

// const _fieldConfigs: { [key: string]: S3ImagesConfig } = {};

const imageAssetsAPIs = new Map<string, ImageAdapter>();

const imageSizeEnum = g.enum({
  name: 'S3ImagesSizeEnum',
  values: g.enumValues(['base64', 'sm', 'md', 'lg', 'full']),
});

const imagesOutputFields = g.fields<Omit<ImagesData, 'size'>>()({
  id: g.field({ type: g.nonNull(g.ID) }),
  filesize: g.field({ type: g.nonNull(g.Int) }),
  width: g.field({ type: g.nonNull(g.Int) }),
  height: g.field({ type: g.nonNull(g.Int) }),
  sizesMeta: g.field({
    type: g.JSON,
    resolve(data) {
      return data.sizesMeta as any; // TODO type
    },
  }),
  extension: g.field({ type: g.nonNull(ImageExtensionEnum) }),
  url: g.field({
    type: g.String,
    args: {
      size: g.arg({
        type: imageSizeEnum,
        defaultValue: 'sm',
      }),
    },
    resolve(data, args, context, info) {
      const { key, typename } = info.path.prev as Path;
      const adapter = imageAssetsAPIs.get(`${typename}-${key}`);
      return adapter?.url(data.id, data.extension, args.size!, data.sizesMeta!);
    },
  }),
  srcSet: g.field({
    type: g.String,
    args: {
      sizes: g.arg({
        type: g.nonNull(g.list(g.nonNull(imageSizeEnum))),
        defaultValue: ['sm', 'md', 'lg', 'full'],
      }),
    },
    resolve(data, args, context, info) {
      const { key, typename } = info.path.prev as Path;
      const adapter = imageAssetsAPIs.get(`${typename}-${key}`);

      const { sizesMeta } = data;
      if (!sizesMeta) return null;
      return (
        args.sizes
          // .map(size => `${getUrl(adapter, { ...data, size })} ${sizesMeta[size]?.width}w`)
          .map(
            size =>
              `${adapter?.url(data.id, data.extension, size, sizesMeta)} ${sizesMeta[size]?.width}w`
          )
          .join(', ')
      );
    },
  }),
});

const inputArg = g.arg({ type: S3FieldInput });

const S3ImagesFieldOutput = g.interface<Omit<ImagesData, 'size'>>()({
  name: 'S3ImagesFieldOutput',
  fields: imagesOutputFields,
  resolveType: () => 'S3ImagesFieldOutputType',
});

const S3ImagesFieldOutputType = g.object<Omit<ImagesData, 'size'>>()({
  name: 'S3ImagesFieldOutputType',
  interfaces: [S3ImagesFieldOutput],
  fields: imagesOutputFields,
});

function getDefaultSize(sizes: S3ImagesSizes, defaultSize: Exclude<ImageSize, 'base64'>) {
  const excludedSizes = Object.entries(sizes)
    .filter(([, value]) => value === 0)
    .map(([size]) => size);
  const availableSizes = ['sm', 'md', 'lg', 'full'].filter(size => !excludedSizes.includes(size));
  return availableSizes.includes(defaultSize)
    ? defaultSize
    : (availableSizes[0] as Exclude<ImageSize, 'base64'>);
}

function setDefaultConfig(config: S3ImagesConfig) {
  config.sizes = {
    sm: 360,
    md: 720,
    lg: 1280,
    ...config.sizes,
  };
  const defaultSize = getDefaultSize(config.sizes, config.defaultSize ?? 'sm');

  console.assert(
    !config.defaultSize || config.defaultSize === defaultSize,
    `defaultSize: ${config.defaultSize} is not a valid size. Please choose from: ${Object.keys(
      config.sizes
    ).join(', ')}`
  );
  if (config.defaultSize && defaultSize !== config.defaultSize) {
    console.warn(
      `defaultSize: ${config.defaultSize} is not a valid size. Using ${defaultSize} instead.`
    );
  }
  config.defaultSize = defaultSize;
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
    const adapter = s3ImageAssetsAPI(s3Config);
    imageAssetsAPIs.set(s3key, adapter);

    async function beforeOperationResolver(args: any) {
      // console.log('beforeOperationResolver', args);
      if (args.operation === 'update' || args.operation === 'delete') {
        const idKey = `${fieldKey}_id`;
        const id = args.item[idKey];
        const extensionKey = `${fieldKey}_extension`;
        const extension = args.item[extensionKey];

        if (args.operation === 'update' && args.resolvedData[fieldKey].id === id) return; // skip if same file is uploaded

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
          for (const size of ['sm', 'md', 'lg', 'full']) {
            await adapter.delete(id, extension as ImageExtension, size as ImageSize);
          }
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
          resolve: createInputResolver(s3Config as S3ImagesConfig, adapter),
        },
        update: {
          arg: inputArg,
          // @ts-expect-error
          resolve: createInputResolver(s3Config as S3ImagesConfig, adapter),
        },
      },
      output: g.field({
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
            extension: extension as ImageExtension,
            filesize,
            height,
            width,
            id,
            sizesMeta: sizesMeta as Partial<Record<ImageSize, ImagesData>>,
            url: (_args: {}, context: KeystoneContext) =>
              adapter.url(id, extension as ImageExtension, s3Config.defaultSize!, sizesMeta as any),
          };
        },
      }),
      unreferencedConcreteInterfaceImplementations: [S3ImagesFieldOutputType],
      views: '@k6-contrib/fields-s3-images/views',
    });
  };
