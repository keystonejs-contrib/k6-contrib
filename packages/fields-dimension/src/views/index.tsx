/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@keystone-ui/core';
import {
  CardValueComponent,
  CellComponent,
  FieldController,
  FieldControllerConfig,
} from '@keystone-6/core/types';
import { FieldContainer, FieldLabel } from '@keystone-ui/fields';

export { Field } from './Field';

export const Cell: CellComponent = ({ item, field }) => {
  const data = item[field.path];
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
  length: string;
  width: string;
  height: string;
};

export type DimensionValue = DimensionData | null;

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
      if (value) {
        return {
          unit: value.unit,
          length: typeof value.length === 'number' ? value.length + '' : '',
          width: typeof value.width === 'number' ? value.width + '' : '',
          height: typeof value.height === 'number' ? value.height + '' : '',
        };
      }
      return { unit: null, length: '', width: '', height: '' };
    },
    validate(data): boolean {
      if (!data) return true;
      const { unit, length, width, height } = data;
      if (
        typeof unit !== 'string' &&
        isNaN(parseFloat(length)) &&
        isNaN(parseFloat(width)) &&
        isNaN(parseFloat(height))
      )
        return true;

      return (
        typeof unit === 'string' &&
        !isNaN(parseFloat(length)) &&
        !isNaN(parseFloat(width)) &&
        !isNaN(parseFloat(height))
      );
    },
    serialize(value) {
      if (!value) return { [config.path]: null };
      const { unit, length, width, height } = value;
      if (
        !unit &&
        isNaN(parseFloat(length)) &&
        isNaN(parseFloat(width)) &&
        isNaN(parseFloat(height))
      )
        return null;
      return {
        [config.path]: {
          unit,
          length: parseFloat(length),
          width: parseFloat(width),
          height: parseFloat(height),
        },
      };
    },
  };
};
