import { ReadStream } from 'fs';
import { FileUpload } from 'graphql-upload';
import AWS from 'aws-sdk';
import urlJoin from 'url-join';
import cuid from 'cuid';
import slugify from '@sindresorhus/slugify';
import filenamify from 'filenamify';
import { ImageMetadata } from '@keystone-next/types';
import fromBuffer from 'image-type';
import imageSize from 'image-size';
import { AssetType, S3DataType, S3Config, FileData, ImageData } from './types';
import { parseFileRef, parseImageRef } from './utils';

const defaultTransformer = (str: string) => slugify(str);

const generateSafeFilename = (
  filename: string,
  transformFilename: (str: string) => string = defaultTransformer
) => {
  // Appends a UUID to the filename so that people can't brute-force guess stored filenames
  //
  // This regex lazily matches for any characters that aren't a new line
  // it then optionally matches the last instance of a "." symbol
  // followed by any alphabetical character before the end of the string
  const [, name, ext] = filename.match(/^([^:\n].*?)(\.[A-Za-z]+)?$/) as RegExpMatchArray;

  const id = cuid();

  const urlSafeName = filenamify(transformFilename(name), {
    maxLength: 100 - id.length,
    replacement: '-',
  });
  if (ext) {
    return `${urlSafeName}-${id}${ext}`;
  }
  return `${urlSafeName}-${id}`;
};

const getFilename = (fileData: S3DataType) =>
  fileData.type === 'file' ? fileData.filename : `${fileData.id}.${fileData.extension}`;

const defaultGetSrc = ({ bucket, folder }: S3Config, fileData: S3DataType) => {
  const filename = getFilename(fileData);
  return urlJoin(`https://${bucket}.s3.amazonaws.com`, folder, filename);
};

export function getSrc(config: S3Config, fileData: S3DataType) {
  if (config.baseUrl) {
    return urlJoin(config.baseUrl, getFilename(fileData));
  }
  return config.getSrc?.(config, fileData) || defaultGetSrc(config, fileData);
}

const getImageMetadataFromStream = async (stream: ReadStream): Promise<ImageMetadata> => {
  const chunks = [];
  for await (let chunk of stream) {
    chunks.push(chunk);
  }

  const buffer = Buffer.concat(chunks);

  const filesize = buffer.length;
  const fileType = fromBuffer(buffer);
  if (!fileType) {
    throw new Error('File type not found');
  }

  if (
    fileType.ext !== 'jpg' &&
    fileType.ext !== 'png' &&
    fileType.ext !== 'webp' &&
    fileType.ext !== 'gif'
  ) {
    throw new Error(`${fileType.ext} is not a supported image type`);
  }

  const extension = fileType.ext;

  const { height, width } = imageSize(buffer);

  if (width === undefined || height === undefined) {
    throw new Error('Height and width could not be found for image');
  }
  return { width, height, filesize, extension };
};

export const getDataFromStream = async (
  config: S3Config,
  type: AssetType,
  upload: FileUpload
): Promise<Omit<ImageData, 'type'> | Omit<FileData, 'type'>> => {
  const { createReadStream, encoding, filename: originalFilename, mimetype } = upload;
  const filename = generateSafeFilename(originalFilename, config.transformFilename);
  const s3 = new AWS.S3(config.s3Options);

  let stream = createReadStream();
  let filesize = 0;
  let metadata: ImageMetadata = {} as ImageMetadata;
  if (type === 'image') {
    metadata = await getImageMetadataFromStream(stream);
    // recreate stream so that we can send it to s3
    stream = createReadStream();
  }

  const id = cuid();
  const fileData: S3DataType = {
    type,
    id,
    filename,
    ...metadata,
  };

  try {
    const uploadParams = config.uploadParams?.(fileData) || {};
    const result = await s3
      .upload({
        Body: createReadStream(),
        ContentType: mimetype,
        Bucket: config.bucket,
        Key: `${config.folder}/${getFilename(fileData)}`,
        Metadata: {
          'x-amz-meta-original-filename': originalFilename,
          ...(type === 'image'
            ? {
                'x-amz-meta-image-height': `${metadata.height}`,
                'x-amz-meta-image-width': `${metadata.width}`,
              }
            : {}),
        },
        ...uploadParams,
      })
      .promise();
    if (type === 'file') {
      const head = await s3
        .headObject({
          Bucket: config.bucket,
          Key: result.Key,
        })
        .promise();
      filesize = head.ContentLength || 0;
      return { filename, filesize };
    }
    return { id, ...metadata };
  } catch (error) {
    stream.destroy();
    throw error;
  }
};

const parseRef = (type: AssetType, ref: string) => {
  if (type === 'image') return parseImageRef(ref);
  return parseFileRef(ref);
};

export const getDataFromRef = async (
  config: S3Config,
  type: AssetType,
  ref: string
): Promise<Partial<ImageData | FileData>> => {
  const fileRef = parseRef(type, ref);

  if (!fileRef) {
    throw new Error('Invalid image reference');
  }

  const fileData = {
    type,
    ...(fileRef.type === 'file'
      ? {
          filename: fileRef.filename,
        }
      : {
          id: fileRef.id,
          extension: fileRef.extension,
        }),
  };

  const s3 = new AWS.S3(config.s3Options);
  try {
    const result = await s3
      .headObject({
        Bucket: config.bucket,
        Key: urlJoin(config.folder, getFilename(fileData as S3DataType)),
      })
      .promise();
    const { type, ...refData } = fileRef;
    return {
      ...refData,
      ...(type === 'image'
        ? {
            height: Number(result.Metadata?.['x-amz-meta-image-height'] || 0),
            width: Number(result.Metadata?.['x-amz-meta-image-width'] || 0),
          }
        : {}),
      filesize: result.ContentLength || 0,
    };
  } catch (error) {
    throw error;
  }
};
