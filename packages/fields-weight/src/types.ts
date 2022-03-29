import { BaseListTypeInfo, CommonFieldConfig } from '@keystone-6/core/types';

export type WeightData = {
  unit: string;
  value: number;
};

export type WeightFieldInputType =
  | undefined
  | null
  | { unit: string; value: number };

export type WeightFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    displayMode?: 'select' | 'segmented-control';
    defaultUnit?: string | null;
    units?: { label: string; value: string }[];
    ui?: {
      displayMode?: 'select' | 'segmented-control';
    };
    validation?: {
      isRequired?: boolean;
    };
  };
