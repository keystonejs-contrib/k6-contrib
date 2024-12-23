import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { S3, GetObjectCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { ImageAdapter, MaybePromise, S3ImagesConfig } from './types';

export function merge<
  R,
  A extends (r: R) => MaybePromise<void>,
  B extends (r: R) => MaybePromise<void>,
>(a?: A, b?: B) {
  if (!a && !b) return undefined;
  return async (args: R) => {
    await a?.(args);
    await b?.(args);
  };
}

export function s3ImageAssetsAPI(storageConfig: S3ImagesConfig): ImageAdapter {
  const { generateUrl, s3, presign, s3Endpoint } = s3AssetsCommon(storageConfig);
  return {
    async url(id, extension, size) {
      if (!storageConfig.signed) {
        return generateUrl(
          `${s3Endpoint}${storageConfig.pathPrefix || ''}${id}_${size}.${extension}`
        );
      }
      return generateUrl(await presign(`${id}_${size}.${extension}`));
    },
    async upload(buffer, id, extension, size, height, width) {
      const upload = new Upload({
        client: s3,
        params: {
          Bucket: storageConfig.bucketName,
          Key: `${storageConfig.pathPrefix || ''}${id}_${size}.${extension}`,
          Body: buffer,
          ContentType: {
            png: 'image/png',
            webp: 'image/webp',
            gif: 'image/gif',
            jpg: 'image/jpeg',
          }[extension],
          ACL: storageConfig.acl,
          Metadata: {
            // 'x-amz-meta-original-filename': originalFilename, // disabled per github issue #25
            'x-amz-meta-image-height': `${height}`,
            'x-amz-meta-image-width': `${width}`,
          },
        },
      });
      await upload.done();
    },
    async delete(id, extension, size) {
      await s3
        .deleteObject({
          Bucket: storageConfig.bucketName,
          Key: `${storageConfig.pathPrefix || ''}${id}_${size}.${extension}`,
        })
        .catch(err => {
          console.log(err);
          if (err.name !== 'NoSuchKey') {
            throw err;
          }
        });
    },
  };
}

export function getS3AssetsEndpoint(storageConfig: S3ImagesConfig) {
  let endpoint = storageConfig.endpoint
    ? new URL(storageConfig.endpoint)
    : new URL(`https://s3.${storageConfig.region}.amazonaws.com`);
  if (storageConfig.forcePathStyle) {
    endpoint = new URL(`/${storageConfig.bucketName}`, endpoint);
  } else {
    endpoint.hostname = `${storageConfig.bucketName}.${endpoint.hostname}`;
  }

  const endpointString = endpoint.toString();
  if (endpointString.endsWith('/')) return endpointString;
  return `${endpointString}/`;
}

function s3AssetsCommon(storageConfig: S3ImagesConfig) {
  const s3 = new S3({
    credentials:
      storageConfig.accessKeyId && storageConfig.secretAccessKey
        ? {
            accessKeyId: storageConfig.accessKeyId,
            secretAccessKey: storageConfig.secretAccessKey,
          }
        : undefined,
    region: storageConfig.region,
    endpoint: storageConfig.endpoint,
    forcePathStyle: storageConfig.forcePathStyle,
  });

  const s3Endpoint = getS3AssetsEndpoint(storageConfig);
  const generateUrl = storageConfig.generateUrl ?? (url => url);

  return {
    generateUrl,
    s3,
    s3Endpoint,
    presign: async (filename: string) => {
      const command = new GetObjectCommand({
        Bucket: storageConfig.bucketName,
        Key: (storageConfig.pathPrefix || '') + filename,
      });
      return getSignedUrl(s3, command, {
        expiresIn: storageConfig.signed?.expiry,
      });
    },
  };
}
