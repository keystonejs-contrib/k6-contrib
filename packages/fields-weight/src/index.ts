import path from 'path';

import {
  BaseGeneratedListTypes,
  fieldType,
  FieldTypeFunc,
  KeystoneContext,
} from '@keystone-next/keystone/types';
import { graphql } from '@keystone-next/keystone';
import { WeightData, WeightFieldConfig, WeightFieldInputType } from './types';

const views = path.join(path.dirname(__dirname), 'views');

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
    validation,
    units = [],
    displayMode = 'select',
    defaultUnit = 'g',
    ...config
  }: WeightFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
    meta => {
      if ((config as any).isUnique) {
        throw Error('isUnique is not a supported option for field type weight');
      }

      const fieldLabel = config.label ?? meta.fieldKey;
      return fieldType({
        kind: 'multi',
        fields: {
          unit: { kind: 'scalar', scalar: 'String', mode: 'optional' },
          value: { kind: 'scalar', scalar: 'Float', mode: 'optional' },
        },
      })({
        ...config,
        hooks: {
          ...config.hooks,
          async validateInput(args) {
            const value = args.resolvedData[meta.fieldKey];
            if ((validation?.isRequired) && (!value || !value.unit || !value.value)) {
              args.addValidationError(`${fieldLabel} is required`);
            }

            await config.hooks?.validateInput?.(args);
          },
        },
        getAdminMeta: () => ({
          units: weightUnits,
          displayMode,
          defaultUnit,
          isRequired: validation?.isRequired ?? false,
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
      });
    };
