import { BaseGeneratedListTypes, CommonFieldConfig } from '@keystone-next/types';

export type DimensionData = {
  unit: string;
  length: number;
  width: number;
  height: number;
};

export type DimensionFieldInputType =
  | undefined
  | null
  | { unit: string; length: number; width: number; height: number };

export type DimensionFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    defaultUnit?: string | null;
    units?: { label: string; value: string }[];
    ui?: {
      displayMode?: 'select' | 'segmented-control';
    };
    isRequired?: boolean;
  };
