import { FileUpload } from 'graphql-upload';
import {
  BaseGeneratedListTypes,
  FieldDefaultValue,
  fieldType,
  FieldTypeFunc,
  CommonFieldConfig,
  ImageExtension,
  KeystoneContext,
  schema,
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

export type S3Config = {
  bucket: string;
  folder?: string;
  baseUrl?: string;
  transformFilename?: (str: string) => string;
  getFilename?: (args: GetFileNameFunc) => string;
  getSrc?: (config: S3Config, fileData: S3DataType) => string;
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
    s3Config?: S3Config;
  };
