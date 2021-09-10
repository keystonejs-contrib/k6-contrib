/* @jsx jsx */

import { jsx } from '@keystone-ui/core';
import {
  CardValueComponent,
  CellComponent,
  FieldController,
  FieldControllerConfig,
} from '@keystone-next/keystone/types';
import { FieldContainer, FieldLabel } from '@keystone-ui/fields';

export { Field } from './Field';

export const Cell: CellComponent = ({ item, field }) => {
  const data: WeightData = item[field.path];
  if (!data) return null;
  const { unit, value } = data;
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
      {`${value}${unit.toUpperCase()}`}
    </div>
  );
};

export const CardValue: CardValueComponent = ({ item, field }) => {
  const { unit, value } = item[field.path];
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      <div>{`${value}${unit.toUpperCase()}`}</div>
    </FieldContainer>
  );
};

type WeightData = {
  unit: string;
  value: string;
};

export type WeightValue = null | WeightData;

type WeightController = FieldController<WeightValue> & {
  units: { label: string; value: string }[];
  defaultUnit: string | null;
  displayMode: 'select' | 'segmented-control';
};

type Config = FieldControllerConfig<{
  units: { label: string; value: string | number }[];
  defaultUnit: string | null;
  displayMode: 'select' | 'segmented-control';
}>;

export const controller = (config: Config): WeightController => {
  const optionsWithStringValues = config.fieldMeta.units.map(x => ({
    label: x.label,
    value: x.value.toString(),
  }));
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: `${config.path} {
        unit
        value
      }`,
    defaultValue: null,
    displayMode: config.fieldMeta.displayMode,
    units: optionsWithStringValues,
    defaultUnit: config.fieldMeta.defaultUnit,
    deserialize(item) {
      const weight = item[config.path];
      if (weight) {
        return {
          unit: weight.unit,
          value: typeof weight.value === 'number' ? weight.value + '' : '',
        };
      }
      return { unit: null, value: '' };
    },
    validate(data): boolean {
      if (!data) return true;
      const { unit, value } = data;
      if (typeof unit !== 'string' && isNaN(parseFloat(value))) return true;
      return typeof unit === 'string' && !isNaN(parseFloat(value));
    },
    serialize(weight) {
      if (!weight) return { [config.path]: null };
      const { unit, value } = weight;
      if (!unit && isNaN(parseFloat(value))) return null;
      return {
        [config.path]: {
          unit,
          value: parseFloat(value),
        },
      };
    },
  };
};
