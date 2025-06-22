import Cryptr from 'cryptr';

import {
  BaseFieldTypeInfo,
  BaseListTypeInfo,
  CommonFieldConfig,
  fieldType,
  FieldTypeFunc,
} from '@keystone-6/core/types';
import { g } from '@keystone-6/core';

export type EncryptedFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo, BaseFieldTypeInfo> & {
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
        if (data === null || data === undefined || data === '') {
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

      const fieldLabel = config.ui?.label ?? meta.fieldKey;
      return fieldType({
        kind: 'scalar',
        mode: 'optional',
        scalar: 'String',
        index: isIndexed === true ? 'index' : isIndexed || undefined,
      })({
        ...config,
        hooks: {
          ...config.hooks,
          validate: {
            ...config.hooks?.validate,
            async create(args) {
              const value = args.resolvedData[meta.fieldKey];
              if (validation?.isRequired && !value) {
                args.addValidationError(`${fieldLabel} is required`);
              }

              await config.hooks?.validate?.create?.(args);
            },
            async update(args) {
              const hasValue = typeof args.inputData[meta.fieldKey] !== 'undefined';
              const value = args.resolvedData[meta.fieldKey];
              if (hasValue && validation?.isRequired && (value === null || value === '')) {
                args.addValidationError(`${fieldLabel} is required`);
              }

              await config.hooks?.validate?.update?.(args);
            },
          },
        },
        input: {
          create: { arg: g.arg({ type: g.String }), resolve: inputResolver },
          update: { arg: g.arg({ type: g.String }), resolve: inputResolver },
        },
        output: g.field({
          type: g.String,
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
        views: '@k6-contrib/fields-encrypted/views',
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
