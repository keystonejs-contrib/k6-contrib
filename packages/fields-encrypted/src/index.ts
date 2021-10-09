import path from 'path';
import Cryptr from 'cryptr';

import {
  BaseGeneratedListTypes,
  CommonFieldConfig,
  fieldType,
  FieldTypeFunc,
} from '@keystone-next/keystone/types';
import { graphql } from '@keystone-next/keystone';

const views = path.join(path.dirname(__dirname), 'views');

export type EncryptedFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    defaultValue?: string;
    isIndexed?: boolean;
    isRequired?: boolean;
    secret: string;
    reverse?: boolean;
    ui?: {
      displayMode?: 'input' | 'textarea';
    };
  };

export const encrypted =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isIndexed,
    isRequired,
    defaultValue,
    secret,
    reverse = false,
    ...config
  }: EncryptedFieldConfig<TGeneratedListTypes>): FieldTypeFunc =>
  meta => {
    const inputResolver = async (data: string | undefined | null) => {
      if (data === null || data === undefined) {
        return data;
      }
      try {
        const cryptr = new Cryptr(secret);
        return cryptr.encrypt(data);
      } catch (error) {
        debugger;
        throw error;
      }
    };
    return fieldType({
      kind: 'scalar',
      mode: 'optional',
      scalar: 'String',
      index: isIndexed === true ? 'index' : isIndexed || undefined,
    })({
      ...config,
      input: {
        create: { arg: graphql.arg({ type: graphql.String }), resolve: inputResolver },
        update: { arg: graphql.arg({ type: graphql.String }), resolve: inputResolver },
      },
      output: graphql.field({
        type: graphql.String,
        resolve: ({ value }) => {
          if (reverse && value) {
            try {
              const cryptr = new Cryptr(secret);
              return cryptr.decrypt(value);
            } catch (error) {
              return null;
            }
          }
          return value;
        },
      }),
      views,
      getAdminMeta() {
        return {
          displayMode: config.ui?.displayMode ?? 'input',
          shouldUseModeInsensitive: meta.provider === 'postgresql',
          reverse,
        };
      },
    });
  };
