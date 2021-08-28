import { FileUpload } from 'graphql-upload';
import {
  BaseGeneratedListTypes,
  FieldDefaultValue,
  CommonFieldConfig,
  ImageMetadata,
} from '@keystone-next/types';

export type AssetMode = 's3';
export type AssetType = 'file' | 'image';

export type ImageData = {
  type: 'image';
  id: string;
  filesize: number;
} & ImageMetadata;

export type FileData = {
  type: 'file';
  filename: string;
  filesize: number;
};

export type S3DataType = FileData | ImageData;

export type GetFileNameFunc = {
  id: string;
  originalFilename: string;
};

export type GetUploadParams = {
  id: string;
  originalFilename: string;
};

export type S3sConfig = {
  bucket: string;
  folder?: string;
  baseUrl?: string;
  sizes?: {
    /** 320x320? */
    xs?: boolean;
    /** 720x720? */
    small?: boolean;
    /** 1080x1920? */
    medium?: boolean;
    large?: boolean;
    l?: boolean;
  }
  transformFilename?: (str: string) => string;
  getFilename?: (args: GetFileNameFunc) => string;
  getSrc?: (config: S3sConfig, fileData: S3DataType) => string;
  uploadParams?: (args: S3DataType) => Partial<AWS.S3.Types.PutObjectRequest>;
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
    s3Config: S3sConfig;
  };
