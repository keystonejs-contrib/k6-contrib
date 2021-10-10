import path from 'path';
import {
  BaseGeneratedListTypes,
  fieldType,
  FieldTypeFunc,
  CommonFieldConfig,
  orderDirectionEnum,
  filters,
} from '@keystone-next/keystone/types';
import { } from '@keystone-next/keystone';
import { graphql } from '@keystone-next/keystone';

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
    isIndexed?: boolean | 'unique';
    defaultValue?: number;
    validation?: {
      isRequired?: boolean;
      min?: number;
      max?: number;
    };
    db?: {
      isNullable?: boolean;
    };
  };

export const bigInt =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isIndexed,
    defaultValue: _defaultValue,
    validation,
    ...config
  }: BigIntFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
    meta => {
      const isNullable = config.db?.isNullable;
      const mode = isNullable === false ? 'required' : 'optional';

      return fieldType({
        kind: 'scalar',
        mode: 'optional',
        scalar: 'BigInt',
        index: isIndexed === true ? 'index' : isIndexed || undefined,
      })({
        ...config,
        input: {
          uniqueWhere: isIndexed === 'unique' ? { arg: graphql.arg({ type: graphql.String }) } : undefined,
          where: {
            arg: graphql.arg({ type: filters[meta.provider].String[mode] }),
            resolve: mode === 'optional' ? filters.resolveCommon : undefined,
          },
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
      });
    };
