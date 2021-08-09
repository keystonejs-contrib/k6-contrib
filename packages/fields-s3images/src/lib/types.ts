import { FileUpload } from 'graphql-upload';
import {
  BaseGeneratedListTypes,
  FieldDefaultValue,
  CommonFieldConfig,
  ImageMetadata,
} from '@keystone-next/types';

export type AssetMode = 's3';
export type AssetType = 'image';

export type ImagesData = {
  id: string;
  filesize: number;
  sizesMeta: Record<keyof S3ImagesConfig['sizes'], ImagesData>;
} & ImageMetadata;

export type GetFileNameFunc = {
  id: string;
  originalFilename: string;
};

export type GetUploadParams = {
  id: string;
  originalFilename: string;
};

export type S3ImagesConfig = {
  bucket: string;
  folder?: string;
  baseUrl?: string;
  /** default to os.tmpdir() */
  tmpdir?: string;
  /** define width, set value 0 to not generate that image, it will be same as next bigger size */
  sizes?: {
    /** = 360? */
    sm?: number;
    /** = 720? */
    md?: number;
    /** = 1080? */
    lg?: number;
  };
  transformFilename?: (str: string) => string;
  getFilename?: (args: GetFileNameFunc) => string;
  getSrc?: (config: S3ImagesConfig, fileData: ImagesData, width: string) => string;
  uploadParams?: (args: ImagesData) => Partial<AWS.S3.Types.PutObjectRequest>;
  s3Options: AWS.S3.ClientConfiguration;
};

export type S3FieldInputType =
  | undefined
  | null
  | { upload?: Promise<FileUpload> | null; ref?: string | null };

export type S3FieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    defaultValue?: FieldDefaultValue<S3FieldInputType, TGeneratedListTypes>;
    isRequired?: boolean;
    s3Config: S3ImagesConfig;
  };
