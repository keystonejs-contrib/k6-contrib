import { FileUpload } from 'graphql-upload';
import {
  BaseGeneratedListTypes,
  FieldDefaultValue,
  CommonFieldConfig,
  ImageMetadata,
} from '@keystone-next/keystone/types';

export type AssetMode = 'azure';
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

export type AzureStorageDataType = FileData | ImageData;

export type GetFileNameFunc = {
  id: string;
  originalFilename: string;
};

export type GetUploadParams = {
  id: string;
  originalFilename: string;
};

export type AzureStorageConfig = {
  transformFilename?: (str: string) => string;
  getFilename?: (args: GetFileNameFunc) => string;
  getSrc?: (config: AzureStorageConfig, fileData: AzureStorageDataType) => string;
  azureStorageOptions: {
    account: string;
    accessKey: string;
    container: string;
  };
};

export type AzureStorageFieldInputType =
  | undefined
  | null
  | { upload?: Promise<FileUpload> | null; ref?: string | null };

export type AzureStorageFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    defaultValue?: FieldDefaultValue<AzureStorageFieldInputType, TGeneratedListTypes>;
    isRequired?: boolean;
    azureStorageConfig: AzureStorageConfig;
  };
