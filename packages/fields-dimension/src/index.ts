import {
  BaseListTypeInfo,
  fieldType,
  FieldTypeFunc,
  KeystoneContext,
} from '@keystone-6/core/types';
import { g } from '@keystone-6/core';
import { DimensionData, DimensionFieldConfig, DimensionFieldInputType } from './types';
import { controller } from './views'

const DimensionFieldInput = g.inputObject({
  name: 'DimensionFieldInput',
  fields: {
    unit: g.arg({ type: g.nonNull(g.String) }),
    length: g.arg({ type: g.nonNull(g.Float) }),
    width: g.arg({ type: g.nonNull(g.Float) }),
    height: g.arg({ type: g.nonNull(g.Float) }),
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

const DimensionOutputFields = g.fields<DimensionData>()({
  length: g.field({ type: g.nonNull(g.Float) }),
  width: g.field({ type: g.nonNull(g.Float) }),
  height: g.field({ type: g.nonNull(g.Float) }),
  unit: g.field({
    type: g.enum({
      name: 'DimensionEnumType',
      values: g.enumValues(dimensionUnits.map(u => u.value)),
    }),
  }),
});

const DimensionFieldOutput = g.interface<DimensionData>()({
  name: 'DimensionFieldOutput',
  fields: DimensionOutputFields,
  resolveType: () => 'DimensionFieldOutputType',
});

const DimensionFieldOutputType = g.object<DimensionData>()({
  name: 'DimensionFieldOutputType',
  interfaces: [DimensionFieldOutput],
  fields: DimensionOutputFields,
});

export function dimension<ListTypeInfo extends BaseListTypeInfo>({
  validation, units = [], ui: { displayMode = 'select', ...ui } = {}, defaultUnit = null, ...config
}: DimensionFieldConfig<ListTypeInfo> = {}): FieldTypeFunc<ListTypeInfo> {
  return meta => {
    if ((config as any).isUnique) {
      throw Error('isUnique is not a supported option for field type dimension');
    }

    const fieldLabel = ui.label ?? meta.fieldKey;
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
        validate: {
          ...config.hooks?.validate,
          async create(args) {
            const value = args.resolvedData[meta.fieldKey];
            if (validation?.isRequired &&
              (value === null ||
                [value.unit, value.length, value.width, value.height].some(
                  item => typeof item === 'undefined' || item === null
                ))) {
              args.addValidationError(`${fieldLabel} is required`);
            }

            await config.hooks?.validate?.create?.(args);
          },
          async update(args) {
            const hasValue = typeof args.inputData[meta.fieldKey] !== 'undefined';
            const value = args.resolvedData[meta.fieldKey];
            if (validation?.isRequired &&
              hasValue &&
              (value === null ||
                [value.unit, value.length, value.width, value.height].some(
                  item => typeof item === 'undefined' || item === null
                ))) {
              args.addValidationError(`${fieldLabel} is required`);
            }

            await config.hooks?.validate?.update?.(args);
          },
        },
      },
      getAdminMeta() {
        return {
          units: dimensionUnits,
          displayMode,
          defaultUnit,
          isRequired: validation?.isRequired ?? false,
        } as Parameters<typeof controller>[0]['fieldMeta'];
      },
      input: {
        create: {
          arg: g.arg({ type: DimensionFieldInput }),
          resolve: inputResolver,
        },
        update: {
          arg: g.arg({ type: DimensionFieldInput }),
          resolve: inputResolver,
        },
      },
      output: g.field({
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
}
