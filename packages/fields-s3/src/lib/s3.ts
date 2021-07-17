import { ReadStream } from 'fs';
import { FileUpload } from 'graphql-upload';
import AWS from 'aws-sdk';
import urlJoin from 'url-join';
import cuid from 'cuid';
import slugify from '@sindresorhus/slugify';
import { ImageMetadata } from '@keystone-next/types';
import fromBuffer from 'image-type';
import imageSize from 'image-size';
import { AssetType, FileDataType, GetPublicUrlFunc, S3AdapterOptions, S3Config } from './types';
import { parseFileRef, parseImageRef } from './utils';

const getFilename = (fileData: FileDataType) =>
  fileData.type === 'file' ? fileData.filename : `${fileData.id}.${fileData.extension}`;

const defaultGetSrc = ({ bucket, folder }: S3Config, fileData: FileDataType) => {
  const filename = getFilename(fileData);
  return urlJoin(`https://${bucket}.s3.amazonaws.com`, folder, filename);
};

export function getSrc(config: S3Config, fileData: FileDataType) {
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

export const getDataFromStream = async (config: S3Config, type: AssetType, upload: FileUpload) => {
  const { createReadStream, encoding, filename: originalFilename, mimetype } = upload;
  const s3 = new AWS.S3(config.s3Options);

  let stream = createReadStream();

  let metadata: ImageMetadata = {};
  if (type === 'image') {
    metadata = await getImageMetadataFromStream(stream);
    stream = createReadStream();
  }

  const id = cuid();
  const fileData = {
    mode: 's3',
    type,
    id,
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
          'x-amz-meta-image-height': `${metadata.height}`,
          'x-amz-meta-image-width': `${metadata.width}`,
        },
        ...uploadParams,
      })
      .promise();
    console.log(result);
  } catch (error) {
    stream.destroy();
    throw error;
  }
  return { mode: 's3', id, ...metadata };
};

const parseRef = (type: AssetType, ref: string) => {
  if (type === 'image') return parseImageRef(ref);
  return parseFileRef(ref);
};

export const getDataFromRef = async (config: S3Config, type: AssetType, ref: string) => {
  const imageRef = parseRef(type, ref);

  if (!imageRef) {
    throw new Error('Invalid image reference');
  }

  const s3 = new AWS.S3(config.s3Options);
  try {
    const result = await s3
      .headObject({
        Bucket: config.bucket,
        Key: urlJoin(
          config.folder,
          getFilename({ type: 'image', id: imageRef.id, extension: imageRef.extension })
        ),
      })
      .promise();
    return {
      ...imageRef,
      height: Number(result.Metadata?.['x-amz-meta-image-height'] || 0),
      width: Number(result.Metadata?.['x-amz-meta-image-width'] || 0),
      filesize: result.ContentLength || 0,
    };
  } catch (error) {
    throw error;
  }
};
