'use client';

import {
  BaseListTypeInfo,
  CommonFieldConfig,
  fieldType,
  FieldTypeFunc,
} from '@keystone-6/core/types';
import { g } from '@keystone-6/core';

export type EditorJsFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo, any> & {
    isIndexed?: boolean;
    ui?: {
      tools?: Record<string, any>;
    };
    validation?: {
      isRequired?: boolean;
    };
  };

export const editorJs =
  <ListTypeInfo extends BaseListTypeInfo>({
    isIndexed,
    validation,
    ...config
  }: EditorJsFieldConfig<ListTypeInfo>): FieldTypeFunc<ListTypeInfo> =>
    meta => {
      function resolveInput(value: string | null | undefined) {
        if (value === undefined) return undefined;
        return JSON.stringify(value);
      }

      function resolveOutput(value: string | null | undefined) {
        if (value === null || typeof value === 'undefined') return '';
        return JSON.parse(value) as any;
      }

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
          create: { arg: g.arg({ type: g.String }), resolve: resolveInput },
          update: { arg: g.arg({ type: g.String }), resolve: resolveInput },
        },
        output: g.field({
          type: g.String,
          resolve: ({ value, item }, args, context, info) => {
            return resolveOutput(value);
          },
        }),
        views: '@k6-contrib/fields-editorjs/views',
        getAdminMeta() {
          return {};
        },
      });
    };
