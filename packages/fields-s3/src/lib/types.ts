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
  mode: AssetMode;
  id: string;
} & ImageMetadata;

export type FileData = {
  type: 'file';
  mode: AssetMode;
  filename: string;
  filesize: number;
};

export type FileDataType = ImageData | FileData;

export type GetFileNameFunc = {
  id: string;
  originalFilename: string;
};
export type GetPublicUrlFunc = {
  id: string;
  originalFilename: string;
};

export type GetUploadParams = {
  id: string;
  originalFilename: string;
};

export type S3Config = {
  bucket: string;
  folder: string;
  baseUrl: string;
  getFilename: (args: GetFileNameFunc) => string;
  publicUrl: (args: GetPublicUrlFunc) => string;
  getSrc: (config: S3Config, fileData: FileDataType) => string;
  uploadParams: (args: FileDataType) => Partial<AWS.S3.Types.PutObjectRequest>;
  s3Options: AWS.S3.ClientConfiguration;
};

export type ImageFieldInputType =
  | undefined
  | null
  | { upload?: Promise<FileUpload> | null; ref?: string | null };

export type ImageFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    defaultValue?: FieldDefaultValue<ImageFieldInputType, TGeneratedListTypes>;
    isRequired?: boolean;
    s3Config?: Partial<S3Config>;
  };

export type S3AdapterOptions = {
  bucket: string;
  getFilename: (args: any) => string;
  publicUrl: (args: any) => string;
  s3Options: AWS.S3.ClientConfiguration;
  uploadParams: object;
  folder: string;
};
