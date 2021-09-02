/* @jsx jsx */

import { jsx } from '@keystone-ui/core';
import {
  CardValueComponent,
  CellComponent,
  FieldController,
  FieldControllerConfig,
} from '@keystone-next/types';
import { FieldContainer, FieldLabel } from '@keystone-ui/fields';
import { validateDimension } from './Field';

export { Field } from './Field';

export const Cell: CellComponent = ({ item, field }) => {
  const data = item[field.path];
  console.log(data);
  console.log(item);
  if (!data) return null;
  const { unit, length, width, height } = data;
  return (
    <div
      css={{
        alignItems: 'center',
        display: 'flex',
        height: 24,
        lineHeight: 0,
        width: 24,
      }}
    >
      {`${length}x${width}x${height}${unit.toUpperCase()}`}
    </div>
  );
};

export const CardValue: CardValueComponent = ({ item, field }) => {
  const { unit, length, width, height } = item[field.path];
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      <div>{`${length}x${width}x${height}${unit.toUpperCase()}`}</div>
    </FieldContainer>
  );
};

type DimensionData = {
  unit: string;
  length: number;
  width: number;
  height: number;
};

export type DimensionValue = null | DimensionData;

type DimensionController = FieldController<DimensionValue> & {
  units: { label: string; value: string }[];
  defaultUnit: string | null;
  displayMode: 'select' | 'segmented-control';
};

type Config = FieldControllerConfig<{
  units: { label: string; value: string | number }[];
  defaultUnit: string | null;
  displayMode: 'select' | 'segmented-control';
}>;

export const controller = (config: Config): DimensionController => {
  const optionsWithStringValues = config.fieldMeta.units.map(x => ({
    label: x.label,
    value: x.value.toString(),
  }));
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: `${config.path} {
        unit
        length
        width
        height
      }`,
    defaultValue: null,
    displayMode: config.fieldMeta.displayMode,
    units: optionsWithStringValues,
    defaultUnit: config.fieldMeta.defaultUnit,
    deserialize(item) {
      const value = item[config.path];
      if (!value) return null;
      return {
        unit: value.unit,
        length: value.length,
        width: value.width,
        height: value.height,
      };
    },
    validate(value): boolean {
      return value === undefined;
    },
    serialize(value) {
      if (!value) return { [config.path]: null };
      const { unit, length, width, height } = value;
      return {
        [config.path]: {
          unit,
          length: Number(length),
          width: Number(width),
          height: Number(height),
        },
      };
    },
  };
};
