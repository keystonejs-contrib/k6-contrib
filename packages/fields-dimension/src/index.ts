import path from 'path';

import {
  BaseListTypeInfo,
  fieldType,
  FieldTypeFunc,
  KeystoneContext,
} from '@keystone-6/core/types';
import { graphql } from '@keystone-6/core';
import { DimensionData, DimensionFieldConfig, DimensionFieldInputType } from './types';

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
  <ListTypeInfo extends BaseListTypeInfo>({
    validation,
    units = [],
    ui: { displayMode = 'select', ...ui } = {},
    defaultUnit = null,
    ...config
  }: DimensionFieldConfig<ListTypeInfo> = {}): FieldTypeFunc<ListTypeInfo> =>
    meta => {
      if ((config as any).isUnique) {
        throw Error('isUnique is not a supported option for field type dimension');
      }

      const fieldLabel = config.label ?? meta.fieldKey;
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
        hooks: {
          ...config.hooks,
          async validateInput(args) {
            const value = args.resolvedData[meta.fieldKey];
            if ((validation?.isRequired) && (!value || !value.unit || [value.length, value.width, value.height].some(item => typeof item === 'undefined' || item === null))) {
              args.addValidationError(`${fieldLabel} is required`);
            }

            await config.hooks?.validateInput?.(args);
          },
        },
        getAdminMeta: () => ({
          units: dimensionUnits,
          displayMode,
          defaultUnit,
          isRequired: validation?.isRequired ?? false,
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
        views: '@k6-contrib/fields-dimension/views',
      });
    };
