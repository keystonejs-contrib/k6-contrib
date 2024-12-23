import { extname } from 'path';
import { FileUpload } from 'graphql-upload';
import { Upload } from '@aws-sdk/lib-storage';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import urlJoin from 'url-join';
import cuid from 'cuid';
import sharp from 'sharp';
import { KeystoneContext, ImageExtension } from '@keystone-6/core/types';
import { S3ImagesConfig, ImagesData, ImageSize } from './types';

export const SUPPORTED_IMAGE_EXTENSIONS = ['jpg', 'png', 'webp', 'gif'] as const;

export const ALIAS_IMAGE_EXTENSIONS_MAP: Record<
  string,
  (typeof SUPPORTED_IMAGE_EXTENSIONS)[number]
> = { jpeg: 'jpg' };

// export async function getDataFromStream(
//   config: S3ImagesConfig,
//   upload: FileUpload,
//   context: KeystoneContext
// ): Promise<Omit<ImagesData, 'size'>> {
//   const { createReadStream, filename: originalFilename, mimetype } = upload;

//   const extension = normalizeImageExtension(
//     extname(originalFilename).replace(/^\./, '').toLowerCase()
//   );

//   const s3 = new S3Client({

//   });

//   const imagePipeline = sharp();
//   createReadStream().pipe(imagePipeline);
//   const metadata = await imagePipeline.metadata();

//   const fileId = cuid();
//   const id = config.getFilename?.({ id: fileId, originalFilename, context }) || fileId;
//   const fileData: ImagesData = {
//     id,
//     height: metadata.height as number,
//     width: metadata.width as number,
//     filesize: metadata.size as number,
//     extension,
//     size: 'full',
//   };
//   fileData.sizesMeta = { full: { ...fileData } };

//   // upload full image
//   const uploadParams = config.uploadParams?.(fileData) || {};
//   await new Upload({
//     client: s3,
//     params: {
//       Body: createReadStream(),
//       ContentType: mimetype,
//       Bucket: config.bucket,
//       Key: `${config.folder}/${getFilename(fileData)}`,
//       Metadata: {
//         // 'x-amz-meta-original-filename': originalFilename, // disabled per github issue #25
//         'x-amz-meta-image-height': `${metadata.height}`,
//         'x-amz-meta-image-width': `${metadata.width}`,
//       },
//       ...uploadParams,
//     },
//   }).done();

//   const sm = config.sizes?.sm ?? 360;
//   if (sm) {
//     // upload sm image
//     const smFile = await imagePipeline.clone().resize(sm).toBuffer({ resolveWithObject: true });
//     const smFileData: ImagesData = {
//       id,
//       height: smFile.info.height,
//       width: smFile.info.width,
//       filesize: smFile.info.size,
//       extension,
//       size: 'sm',
//     };
//     fileData.sizesMeta.sm = smFileData;

//     await new Upload({
//       client: s3,
//       params: {
//         Body: smFile.data,
//         ContentType: mimetype,
//         Bucket: config.bucket,
//         Key: `${config.folder}/${getFilename(smFileData)}`,
//         Metadata: {
//           // 'x-amz-meta-original-filename': originalFilename, // disabled per github issue #25
//           'x-amz-meta-image-height': `${smFileData.height}`,
//           'x-amz-meta-image-width': `${smFileData.width}`,
//         },
//         ...uploadParams,
//       },
//     }).done();
//   }

//   // upload md image
//   const md = config.sizes?.md ?? 720;
//   if (md) {
//     const mdFile = await imagePipeline.clone().resize(md).toBuffer({ resolveWithObject: true });
//     const mdFileData: ImagesData = {
//       id,
//       height: mdFile.info.height,
//       width: mdFile.info.width,
//       filesize: mdFile.info.size,
//       extension,
//       size: 'md',
//     };
//     fileData.sizesMeta.md = mdFileData;

//     await new Upload({
//       client: s3,
//       params: {
//         Body: mdFile.data,
//         ContentType: mimetype,
//         Bucket: config.bucket,
//         Key: `${config.folder}/${getFilename(mdFileData)}`,
//         Metadata: {
//           // 'x-amz-meta-original-filename': originalFilename, // disabled per github issue #25
//           'x-amz-meta-image-height': `${mdFileData.height}`,
//           'x-amz-meta-image-width': `${mdFileData.width}`,
//         },
//         ...uploadParams,
//       },
//     }).done();
//   }

//   const lg = config.sizes?.lg ?? 1280;
//   // upload lg image
//   if (lg) {
//     const lgFile = await imagePipeline.clone().resize(lg).toBuffer({ resolveWithObject: true });
//     const lgFileData: ImagesData = {
//       id,
//       height: lgFile.info.height,
//       width: lgFile.info.width,
//       filesize: lgFile.info.size,
//       extension,
//       size: 'lg',
//     };
//     fileData.sizesMeta.lg = lgFileData;
//       await new Upload({
//         client: s3,
//         params: {
//           Body: lgFile.data,
//         ContentType: mimetype,
//         Bucket: config.bucket,
//         Key: `${config.folder}/${getFilename(lgFileData)}`,
//         Metadata: {
//           // 'x-amz-meta-original-filename': originalFilename, // disabled per github issue #25
//           'x-amz-meta-image-height': `${lgFileData.height}`,
//           'x-amz-meta-image-width': `${lgFileData.width}`,
//         },
//         ...uploadParams,
//         },
//       }).done();
//     fileData.sizesMeta.lg = lgFileData;
//   }
//   if (config.sizes?.base64) {
//     const base64 = await imagePipeline
//       .clone()
//       .resize(config.sizes.base64)
//       .toBuffer({ resolveWithObject: true });

//     const base64Data: ImagesData = {
//       id,
//       height: base64.info.height,
//       width: base64.info.width,
//       filesize: base64.info.size,
//       extension: 'png',
//       size: 'base64',
//       base64Data: `data:image/png;base64,${base64.data.toString('base64')}`,
//     };

//     fileData.sizesMeta.base64 = base64Data;
//   }

//   const { size, ...result } = fileData;
//   return result;
// }

const extensionsSet = new Set(SUPPORTED_IMAGE_EXTENSIONS);
export const isValidImageExtension = (extension: string): extension is ImageExtension => {
  return extensionsSet.has(extension as ImageExtension);
};

export const normalizeImageExtension = (extension: string): ImageExtension => {
  if (isValidImageExtension(extension)) {
    return extension;
  }
  return ALIAS_IMAGE_EXTENSIONS_MAP[extension] || undefined;
};
