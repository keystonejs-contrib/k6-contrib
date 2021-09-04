import { BaseGeneratedListTypes, CommonFieldConfig } from '@keystone-next/types';

export type WeightData = {
  unit: string;
  value: number;
};

export type WeightFieldInputType =
  | undefined
  | null
  | { unit: string; value: number };

export type WeightFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    displayMode?: 'select' | 'segmented-control';
    defaultUnit?: string | null;
    units?: { label: string; value: string }[];
    ui?: {
      displayMode?: 'select' | 'segmented-control';
    };
    isRequired?: boolean;
  };
