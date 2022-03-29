import path from 'path';
import Cryptr from 'cryptr';

import {
  BaseListTypeInfo,
  CommonFieldConfig,
  fieldType,
  FieldTypeFunc,
} from '@keystone-6/core/types';
import { graphql } from '@keystone-6/core';

const views = path.join(path.dirname(__dirname), 'views');

export type EncryptedFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    isIndexed?: boolean;
    secret: string;
    reverse?: boolean;
    ui?: {
      displayMode?: 'input' | 'textarea';
    };
    validation?: {
      isRequired?: boolean;
    };
  };

export const encrypted =
  <ListTypeInfo extends BaseListTypeInfo>({
    isIndexed,
    validation,
    secret,
    reverse = false,
    ...config
  }: EncryptedFieldConfig<ListTypeInfo>): FieldTypeFunc<ListTypeInfo> =>
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

      const fieldLabel = config.label ?? meta.fieldKey;
      return fieldType({
        kind: 'scalar',
        mode: 'optional',
        scalar: 'String',
        index: isIndexed === true ? 'index' : isIndexed || undefined,
      })({
        ...config,
        hooks: {
          ...config.hooks,
          async validateInput(args) {
            const value = args.resolvedData[meta.fieldKey];
            if ((validation?.isRequired && value === null)) {
              args.addValidationError(`${fieldLabel} is required`);
            }

            await config.hooks?.validateInput?.(args);
          },
        },
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
            isRequired: validation?.isRequired ?? false,
          };
        },
      });
    };
