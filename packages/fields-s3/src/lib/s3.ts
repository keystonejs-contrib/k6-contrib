import { ReadStream } from 'fs';
import { FileUpload } from 'graphql-upload';
import { Upload } from '@aws-sdk/lib-storage';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import urlJoin from 'url-join';
import cuid from 'cuid';
import slugify from '@sindresorhus/slugify';
import filenamify from 'filenamify';
import { ImageMetadata } from '@keystone-6/core/types';
import fromBuffer from 'image-type';
import imageSize from 'image-size';
import { AssetType, S3DataType, S3Config, FileData, ImageData } from './types';

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
  const [, name, ext] = filename.match(/^([^:\n].*?)(\.[A-Za-z0-9]+)?$/) as RegExpMatchArray;

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

const defaultGetUrl = ({ bucket, folder }: S3Config, fileData: S3DataType) => {
  const filename = getFilename(fileData);
  return urlJoin(`https://${bucket}.s3.amazonaws.com`, folder || '', filename);
};

export function getUrl(config: S3Config, fileData: S3DataType) {
  if (config.baseUrl) {
    return urlJoin(config.baseUrl, getFilename(fileData));
  }
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

export const getDataFromStream = async (
  config: S3Config,
  type: AssetType,
  upload: FileUpload
): Promise<Omit<ImageData, 'type'> | Omit<FileData, 'type'>> => {
  const { createReadStream, filename: originalFilename, mimetype } = upload;
  const filename = generateSafeFilename(originalFilename, config.transformFilename);
  const s3 = new S3Client(config.s3Options);

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
  await new Upload({
    client: s3,
    params: {
      Body: createReadStream(),
      ContentType: mimetype,
      Bucket: config.bucket,
      Key: `${config.folder}/${getFilename(fileData)}`,
      Metadata: {
        // 'x-amz-meta-original-filename': originalFilename, // disabled per github issue #25
        'x-amz-meta-image-height': `${metadata.height}`,
        'x-amz-meta-image-width': `${metadata.width}`,
      },
      ...uploadParams,
    },
  }).done();
    if (type === 'file') {
      const headObjectCommand = new HeadObjectCommand({
        Bucket: config.bucket,
        Key: urlJoin(config.folder as string, getFilename(fileData)),
      });
      const head = await s3.send(headObjectCommand);
      filesize = head.ContentLength || 0;
      return { filename, filesize };
    }
    return { id, ...metadata };
  } catch (error) {
    stream.destroy();
    throw error;
  }
};
