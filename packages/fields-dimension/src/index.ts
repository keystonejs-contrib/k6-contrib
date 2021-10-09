import path from 'path';

import {
  BaseGeneratedListTypes,
  fieldType,
  FieldTypeFunc,
  KeystoneContext,
} from '@keystone-next/keystone/types';
import { graphql } from '@keystone-next/keystone';
import { DimensionData, DimensionFieldConfig, DimensionFieldInputType } from './types';

const views = path.join(path.dirname(__dirname), 'views');

const DimensionFieldInput = graphql.inputObject({
  name: 'DimensionFieldInput',
  fields: {
    unit: graphql.arg({ type: graphql.nonNull(graphql.String) }),
    length: graphql.arg({ type: graphql.nonNull(graphql.Float) }),
    width: graphql.arg({ type: graphql.nonNull(graphql.Float) }),
    height: graphql.arg({ type: graphql.nonNull(graphql.Float) }),
  },
});

async function inputResolver(data: DimensionFieldInputType, context: KeystoneContext) {
  if (data === null || data === undefined) {
    return { unit: data, length: data, width: data, height: data };
  }

  return { ...data } as DimensionData;
}

const dimensionUnits = [
  { label: 'Inches', value: 'in' },
  { label: 'Feet', value: 'ft' },
  { label: 'Millimeter', value: 'mm' },
  { label: 'Centimeter', value: 'cm' },
  { label: 'Meter', value: 'm' },
];

const DimensionOutputFields = graphql.fields<DimensionData>()({
  length: graphql.field({ type: graphql.nonNull(graphql.Float) }),
  width: graphql.field({ type: graphql.nonNull(graphql.Float) }),
  height: graphql.field({ type: graphql.nonNull(graphql.Float) }),
  unit: graphql.field({
    type: graphql.enum({
      name: 'DimensionEnumType',
      values: graphql.enumValues(dimensionUnits.map(u => u.value)),
    }),
  }),
});

const DimensionFieldOutput = graphql.interface<DimensionData>()({
  name: 'DimensionFieldOutput',
  fields: DimensionOutputFields,
  resolveType: () => 'DimensionFieldOutputType',
});

const DimensionFieldOutputType = graphql.object<DimensionData>()({
  name: 'DimensionFieldOutputType',
  interfaces: [DimensionFieldOutput],
  fields: DimensionOutputFields,
});

export const dimension =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isRequired,
    units = [],
    ui: { displayMode = 'select', ...ui } = {},
    defaultUnit = null,
    ...config
  }: DimensionFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta => {
    if ((config as any).isUnique) {
      throw Error('isUnique is not a supported option for field type dimension');
    }

    return fieldType({
      kind: 'multi',
      fields: {
        unit: { kind: 'scalar', scalar: 'String', mode: 'optional' },
        length: { kind: 'scalar', scalar: 'Float', mode: 'optional' },
        width: { kind: 'scalar', scalar: 'Float', mode: 'optional' },
        height: { kind: 'scalar', scalar: 'Float', mode: 'optional' },
      },
    })({
      ...config,
      getAdminMeta: () => ({
        units: dimensionUnits,
        displayMode,
        defaultUnit,
      }),
      input: {
        create: {
          arg: graphql.arg({ type: DimensionFieldInput }),
          resolve: inputResolver,
        },
        update: {
          arg: graphql.arg({ type: DimensionFieldInput }),
          resolve: inputResolver,
        },
      },
      output: graphql.field({
        type: DimensionFieldOutput,
        resolve({ value: { unit, length, width, height } }) {
          if (unit === null || length === null || width === null || height === null) {
            return null;
          }
          return { unit, length, width, height };
        },
      }),
      unreferencedConcreteInterfaceImplementations: [DimensionFieldOutputType],
      views,
    });
  };
