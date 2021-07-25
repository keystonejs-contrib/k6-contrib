import path from 'path';
import {
  BaseGeneratedListTypes,
  FieldDefaultValue,
  fieldType,
  FieldTypeFunc,
  CommonFieldConfig,
  legacyFilters,
  orderDirectionEnum,
  schema,
} from '@keystone-next/types';

export function getIndexType({
  isIndexed,
  isUnique,
}: {
  isIndexed?: boolean;
  isUnique?: boolean;
}): undefined | 'index' | 'unique' {
  if (isUnique && isIndexed) {
    throw new Error('Only one of isUnique and isIndexed can be passed to field types');
  }
  return isIndexed ? 'index' : isUnique ? 'unique' : undefined;
}

const views = path.join(
  path.dirname(require.resolve('@k6-contrib/fields-bigint/package.json')),
  'views'
);

export type BigIntFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    defaultValue?: FieldDefaultValue<number, TGeneratedListTypes>;
    isRequired?: boolean;
    isUnique?: boolean;
    isIndexed?: boolean;
  };

export const bigInt =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isIndexed,
    isUnique,
    isRequired,
    defaultValue,
    ...config
  }: BigIntFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta =>
    fieldType({
      kind: 'scalar',
      mode: 'optional',
      scalar: 'BigInt',
      index: getIndexType({ isIndexed, isUnique }),
    })({
      ...config,
      input: {
        uniqueWhere: isUnique ? { arg: schema.arg({ type: schema.String }) } : undefined,
        create: {
          arg: schema.arg({ type: schema.String }),
          resolve(val) {
            if (val == null) return val;
            return BigInt(val);
          },
        },
        update: {
          arg: schema.arg({ type: schema.String }),
          resolve(val) {
            if (val == null) return val;
            return BigInt(val);
          },
        },
        orderBy: { arg: schema.arg({ type: orderDirectionEnum }) },
      },
      output: schema.field({
        type: schema.String,
        resolve({ value }) {
          if (value === null) return null;
          return value + '';
        },
      }),
      views,
      __legacy: {
        filters: {
          fields: {
            ...legacyFilters.fields.equalityInputFields(meta.fieldKey, schema.String),
            ...legacyFilters.fields.orderingInputFields(meta.fieldKey, schema.String),
            ...legacyFilters.fields.inInputFields(meta.fieldKey, schema.String),
          },
          impls: {
            ...legacyFilters.impls.equalityConditions(meta.fieldKey),
            ...legacyFilters.impls.orderingConditions(meta.fieldKey),
            ...legacyFilters.impls.inConditions(meta.fieldKey),
          },
        },
        isRequired,
        defaultValue,
      },
    });
