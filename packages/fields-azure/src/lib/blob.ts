import { ReadStream } from 'fs';
import { FileUpload } from 'graphql-upload';
import cuid from 'cuid';
import slugify from '@sindresorhus/slugify';
import filenamify from 'filenamify';
import { ImageMetadata } from '@keystone-6/core/types';
import fromBuffer from 'image-type';
import imageSize from 'image-size';
import { AssetType, AzureStorageDataType, AzureStorageConfig, FileData, ImageData } from './types';
import { parseFileRef, parseImageRef } from './utils';
import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';

const ONE_MEGABYTE = 1024 * 1024;
const uploadOptions = { bufferSize: 4 * ONE_MEGABYTE, maxBuffers: 20 };

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

const getFilename = (fileData: AzureStorageDataType) =>
  fileData.type === 'file' ? fileData.filename : `${fileData.id}`;

const defaultGetUrl = (config: AzureStorageConfig, fileData: AzureStorageDataType) => {
  const filename = getFilename(fileData);
  return `${getBlobHost(config)}/${config.azureStorageOptions.container}/${filename}`;
};

export function getUrl(config: AzureStorageConfig, fileData: AzureStorageDataType) {
  return config.getUrl?.(config, fileData) || defaultGetUrl(config, fileData);
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

const getBlobHost = (config: AzureStorageConfig) =>
  config.azureStorageOptions.url ||
  `https://${config.azureStorageOptions.account}.blob.core.windows.net`;

export const getDataFromStream = async (
  config: AzureStorageConfig,
  type: AssetType,
  upload: FileUpload
): Promise<Omit<ImageData, 'type'> | Omit<FileData, 'type'>> => {
  const { createReadStream, filename: originalFilename, mimetype } = upload;
  const filename = generateSafeFilename(originalFilename, config.transformFilename);
  const creds = new StorageSharedKeyCredential(
    config.azureStorageOptions.account,
    config.azureStorageOptions.accessKey
  );
  const blobServiceClient = new BlobServiceClient(getBlobHost(config), creds);
  const containerClient = blobServiceClient.getContainerClient(
    config.azureStorageOptions.container
  );

  let stream = createReadStream();

  try {
    const blockBlobClient = containerClient.getBlockBlobClient(filename);

    let metadata: ImageMetadata = {} as ImageMetadata;
    if (type === 'image') {
      metadata = await getImageMetadataFromStream(stream);
      stream = createReadStream();
    }

    await blockBlobClient.uploadStream(stream, uploadOptions.bufferSize, uploadOptions.maxBuffers, {
      blobHTTPHeaders: { blobContentType: mimetype },
    });

    await blockBlobClient.setMetadata({
      originalFilename,
      ...(type === 'image'
        ? {
            extension: metadata.extension,
            filesize: metadata.filesize.toString(),
            height: metadata.height.toString(),
            width: metadata.width.toString(),
          }
        : {}),
    });

    if (type === 'file') {
      const properties = await blockBlobClient.getProperties();

      return { filename, filesize: properties.contentLength || 0 };
    }

    return { id: filename, ...metadata };
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
  config: AzureStorageConfig,
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

  const creds = new StorageSharedKeyCredential(
    config.azureStorageOptions.account,
    config.azureStorageOptions.accessKey
  );
  const blobServiceClient = new BlobServiceClient(getBlobHost(config), creds);

  const containerClient = blobServiceClient.getContainerClient(
    config.azureStorageOptions.container
  );

  try {
    const blockBlob = containerClient.getBlockBlobClient(
      getFilename(fileData as AzureStorageDataType)
    );
    const blob = await blockBlob.download();
    const metadata = blob.metadata || {};

    const { type, ...refData } = fileRef;
    return {
      ...refData,
      ...(type === 'image'
        ? {
            height: Number(metadata.height || 0),
            width: Number(metadata.width || 0),
          }
        : {}),
      filesize: blob.contentLength || 0,
    };
  } catch (error) {
    throw error;
  }
};
