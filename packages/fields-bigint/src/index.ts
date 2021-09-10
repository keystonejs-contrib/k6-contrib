import path from 'path';
import {
  BaseGeneratedListTypes,
  FieldDefaultValue,
  fieldType,
  FieldTypeFunc,
  CommonFieldConfig,
  orderDirectionEnum,
  graphql,
} from '@keystone-next/keystone/types';

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

const views = path.join(path.dirname(__dirname), 'views');

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
        uniqueWhere: isUnique ? { arg: graphql.arg({ type: graphql.String }) } : undefined,
        create: {
          arg: graphql.arg({ type: graphql.String }),
          resolve(val) {
            if (val == null) return val;
            return BigInt(val);
          },
        },
        update: {
          arg: graphql.arg({ type: graphql.String }),
          resolve(val) {
            if (val == null) return val;
            return BigInt(val);
          },
        },
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      output: graphql.field({
        type: graphql.String,
        resolve({ value }) {
          if (value === null) return null;
          return value + '';
        },
      }),
      views,
      __legacy: { isRequired, defaultValue },
    });
