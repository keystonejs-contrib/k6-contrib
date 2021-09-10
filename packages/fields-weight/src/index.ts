import path from 'path';

import {
  BaseGeneratedListTypes,
  fieldType,
  FieldTypeFunc,
  KeystoneContext,
  graphql,
} from '@keystone-next/keystone/types';
import { WeightData, WeightFieldConfig, WeightFieldInputType } from './types';

const views = path.join(
  path.dirname(require.resolve('@k6-contrib/fields-weight/package.json')),
  'views'
);

const WeightFieldInput = graphql.inputObject({
  name: 'WeightFieldInput',
  fields: {
    unit: graphql.arg({ type: graphql.nonNull(graphql.String) }),
    value: graphql.arg({ type: graphql.nonNull(graphql.Float) }),
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

const WeightOutputFields = graphql.fields<WeightData>()({
  value: graphql.field({ type: graphql.nonNull(graphql.Float) }),
  unit: graphql.field({
    type: graphql.enum({
      name: 'WeightEnumType',
      values: graphql.enumValues(weightUnits.map(u => u.value)),
    }),
  }),
});

const WeightFieldOutput = graphql.interface<WeightData>()({
  name: 'WeightFieldOutput',
  fields: WeightOutputFields,
  resolveType: () => 'WeightFieldOutputType',
});

const WeightFieldOutputType = graphql.object<WeightData>()({
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
          arg: graphql.arg({ type: WeightFieldInput }),
          resolve: inputResolver,
        },
        update: {
          arg: graphql.arg({ type: WeightFieldInput }),
          resolve: inputResolver,
        },
      },
      output: graphql.field({
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
