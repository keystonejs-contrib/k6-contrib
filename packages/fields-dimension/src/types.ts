import { BaseFieldTypeInfo, BaseListTypeInfo, CommonFieldConfig } from '@keystone-6/core/types';

export type DimensionData = {
  unit: string;
  length: number;
  width: number;
  height: number;
};

export type DimensionFieldInputType =
  | undefined
  | null
  | { unit: string; length: number; width: number; height: number; };

export type DimensionFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo, BaseFieldTypeInfo> & {
    defaultUnit?: string | null;
    units?: { label: string; value: string; }[];
    ui?: {
      displayMode?: 'select' | 'segmented-control';
    };
    validation?: {
      isRequired?: boolean;
    };
  };
