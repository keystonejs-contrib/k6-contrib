import { FileUpload } from 'graphql-upload';
import {
  BaseListTypeInfo,
  CommonFieldConfig,
  ImageMetadata,
} from '@keystone-6/core/types';
import { PutObjectRequest, S3ClientConfig } from '@aws-sdk/client-s3';

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

export type S3Config = {
  bucket: string;
  folder?: string;
  baseUrl?: string;
  transformFilename?: (str: string) => string;
  getFilename?: (args: GetFileNameFunc) => string;
  getUrl?: (config: S3Config, fileData: S3DataType) => string;
  uploadParams?: (args: S3DataType) => Partial<PutObjectRequest>;
  s3Options: S3ClientConfig;
};

export type S3FieldInputType =
  | undefined
  | null
  | { upload?: Promise<FileUpload> | null; ref?: string | null };

export type S3FieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    s3Config: S3Config;
  };
