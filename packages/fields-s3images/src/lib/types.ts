import { FileUpload } from 'graphql-upload';
import {
  BaseListTypeInfo,
  CommonFieldConfig,
  KeystoneContext,
} from '@keystone-6/core/types';
import type { GArg, GInputObjectType, InferValueFromArg, InferValueFromInputType } from '@graphql-ts/schema'
import { GraphQLScalarType } from 'graphql';

export type AssetMode = 's3';
export type AssetType = 'image';

type ImageMetadata = {
  width: number;
  height: number;
  extension: "jpg" | "png" | "webp" | "gif";
};

export type ImageSize = 'base64' | 'sm' | 'md' | 'lg' | 'full';

export type ImagesData = {
  id: string;
  size: ImageSize;
  sizesMeta?: Partial<Record<ImageSize, Omit<ImagesData, 'url'>>>;
  base64Data?: string;
  filesize: number
  url: (_args: {}, context: KeystoneContext) => Promise<string>
} & ImageMetadata;

export type GetFileNameArg = {
  id: string;
  originalFilename: string;
  context: KeystoneContext;
};

export type GetUploadParams = {
  id: string;
  originalFilename: string;
};

export type S3ImagesSizes = {
  /** = 360? */
  sm?: number;
  /** = 720? */
  md?: number;
  /** = 1280? */
  lg?: number;
  /** not generated by default. Use a small number, like 10 to enable */
  base64?: number;
};

export type S3ImagesConfig = {
  /** Sets signing of the asset - for use when you want private assets */
  signed?: { expiry: number }
  generateUrl?: (path: string) => string
  /** Sets whether the assets should be preserved locally on removal from keystone's database */
  preserve?: boolean
  pathPrefix?: string
  /** Your s3 instance's bucket name */
  bucketName: string
  /** Your s3 instance's region */
  region: string
  /** An access Key ID with write access to your S3 instance */
  accessKeyId?: string
  /** The secret access key that gives permissions to your access Key Id */
  secretAccessKey?: string
  /** An endpoint to use - to be provided if you are not using AWS as your endpoint */
  endpoint?: string
  /** If true, will force the 'old' S3 path style of putting bucket name at the start of the pathname of the URL  */
  forcePathStyle?: boolean
  /** A string that sets permissions for the uploaded assets. Default is 'private'.
   *
   * Amazon S3 supports a set of predefined grants, known as canned ACLs.
   * See https://docs.aws.amazon.com/AmazonS3/latest/userguide/acl-overview.html#canned-acl
   * for more details.
   */
  acl?:
    | 'private'
    | 'public-read'
    | 'public-read-write'
    | 'aws-exec-read'
    | 'authenticated-read'
    | 'bucket-owner-read'
    | 'bucket-owner-full-control'
  transformName?: (filename: string, extension: string, size: ImageSize) => string | Promise<string>;
  /** define width, set value 0 to not generate that image, it will be same as next bigger size */
  sizes?: S3ImagesSizes;
  defaultSize?: Exclude<ImageSize, 'base64'>;
  // getFilename?: (args: GetFileNameArg) => string;
  // getUrl?: (config: S3ImagesConfig, fileData: ImagesData) => string;
  // uploadParams?: (args: ImagesData) => Partial<PutObjectRequest>;
  // s3Options: S3ClientConfig;
};

type ImageFieldInput = GInputObjectType<{
    upload: GArg<GraphQLScalarType<Promise<FileUpload>, {}>, false>;
}, false>
export type FieldTypeInfo = {
  item: undefined
  inputs: {
    create: InferValueFromInputType<ImageFieldInput> | null | undefined
    update: InferValueFromInputType<ImageFieldInput> | null | undefined
    where: undefined
    uniqueWhere: undefined
    orderBy: undefined
  }
  prisma: {
    create: undefined
    update: undefined
  }
}

export type S3FieldInputType =
  | undefined
  | null
  | { upload?: Promise<FileUpload> | null; ref?: string | null };

export type S3FieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo, FieldTypeInfo> & {
    s3Config: S3ImagesConfig;
    db?: {
      extendPrismaSchema?: (field: string) => string
    }
  };

export type ImageExtension = 'jpg' | 'png' | 'webp' | 'gif'

export type ImageAdapter = {
  upload(buffer: Buffer, id: string, extension: string, size: ImageSize, height: number, width: number): Promise<void>
  delete(id: string, extension: ImageExtension, size: ImageSize): Promise<void>
  url(id: string, extension: ImageExtension, size: ImageSize, sizesMeta: Partial<Record<ImageSize, Omit<ImagesData, 'url'>>>): Promise<string>
}

export type MaybePromise<T> = T | Promise<T>
