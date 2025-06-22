import { CellComponent, FieldController, FieldControllerConfig } from '@keystone-6/core/types';

export { Field } from './Field';

export const Cell: CellComponent = ({ item, field }) => {
  const data = item[field.path] as WeightData | null;
  if (!data) return null;
  const { unit, value } = data;
  return (
    <div style={{ alignItems: 'center', display: 'flex', height: 24, lineHeight: 0, width: 24 }}>
      {`${value}${unit ? unit.toUpperCase() : ''}`}
    </div>
  );
};

type WeightData = { unit: string; value: string };

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
    description: config.description || null,
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
      return { [config.path]: { unit, value: parseFloat(value) } };
    },
  };
};
