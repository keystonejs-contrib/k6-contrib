import path from 'path';

import {
  BaseGeneratedListTypes,
  fieldType,
  FieldTypeFunc,
  KeystoneContext,
  schema,
} from '@keystone-next/types';
import { WeightData, WeightFieldConfig, WeightFieldInputType } from './types';

const views = path.join(
  path.dirname(require.resolve('@k6-contrib/fields-weight/package.json')),
  'views'
);

const WeightFieldInput = schema.inputObject({
  name: 'WeightFieldInput',
  fields: {
    unit: schema.arg({ type: schema.nonNull(schema.String) }),
    value: schema.arg({ type: schema.nonNull(schema.Float) }),
  },
});

async function inputResolver(data: WeightFieldInputType, context: KeystoneContext) {
  if (data === null || data === undefined) {
    return { unit: data, value: data, };
  }

  return { ...data } as WeightData;
}

const weightUnits = [
  { label: 'Milligram', value: 'mg' },
  { label: 'Gram', value: 'g' },
  { label: 'Kilogram', value: 'kg' },
  { label: 'Pound', value: 'lb' },
  { label: 'Ounces', value: 'oz' },
];

const WeightOutputFields = schema.fields<WeightData>()({
  value: schema.field({ type: schema.nonNull(schema.Float) }),
  unit: schema.field({
    type: schema.enum({
      name: 'WeightEnumType',
      values: schema.enumValues(weightUnits.map(u => u.value)),
    }),
  }),
});

const WeightFieldOutput = schema.interface<WeightData>()({
  name: 'WeightFieldOutput',
  fields: WeightOutputFields,
  resolveType: () => 'WeightFieldOutputType',
});

const WeightFieldOutputType = schema.object<WeightData>()({
  name: 'WeightFieldOutputType',
  interfaces: [WeightFieldOutput],
  fields: WeightOutputFields,
});

export const weight =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isRequired,
    units = [],
    displayMode = 'select',
    defaultUnit = 'g',
    ...config
  }: WeightFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta => {
    if ((config as any).isUnique) {
      throw Error('isUnique is not a supported option for field type weight');
    }

    return fieldType({
      kind: 'multi',
      fields: {
        unit: { kind: 'scalar', scalar: 'String', mode: 'optional' },
        value: { kind: 'scalar', scalar: 'Float', mode: 'optional' },
      },
    })({
      ...config,
      getAdminMeta: () => ({
        units: weightUnits,
        displayMode,
        defaultUnit,
      }),
      input: {
        create: {
          arg: schema.arg({ type: WeightFieldInput }),
          resolve: inputResolver,
        },
        update: {
          arg: schema.arg({ type: WeightFieldInput }),
          resolve: inputResolver,
        },
      },
      output: schema.field({
        type: WeightFieldOutput,
        resolve({ value: { unit, value } }) {
          if (unit === null || value === null) {
            return null;
          }
          return { unit, value };
        },
      }),
      unreferencedConcreteInterfaceImplementations: [WeightFieldOutputType],
      views,
      __legacy: {
        isRequired,
        defaultValue: null,
      },
    });
  };
