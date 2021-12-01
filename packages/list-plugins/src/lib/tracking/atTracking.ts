import { TimestampFieldConfig } from '@keystone-6/core/dist/declarations/src/fields/types/timestamp';
import { timestamp } from '@keystone-6/core/fields';
import { ListConfig, BaseGeneratedListTypes, BaseFields } from '@keystone-6/core/types';
import { AtTrackingOptions } from '../types';

export const atTracking =
  (options: AtTrackingOptions = {}) =>
    <Fields extends BaseFields<BaseGeneratedListTypes>>(
      listConfig: ListConfig<BaseGeneratedListTypes, Fields>
    ): ListConfig<BaseGeneratedListTypes, Fields> => {
      const {
        created = true,
        updated = true,
        createdAtField = 'createdAt',
        updatedAtField = 'updatedAt',
        ...atFieldOptions
      } = options;

      const fieldOptions: TimestampFieldConfig<BaseGeneratedListTypes> = {
        access: {
          read: () => true,
          create: () => false,
          update: () => false,
        },
        ui: {
          createView: {
            fieldMode: 'hidden',
          },
          itemView: {
            fieldMode: 'read',
          },
        },
        graphql: { omit: ['update', 'create'] },
        ...atFieldOptions,
      };

      let fields = { ...listConfig.fields };
      if (updated) {
        fields = {
          ...fields,
          [updatedAtField]: timestamp({ ...fieldOptions, db: { ...fieldOptions.db, updatedAt: true } }),
        };
      }

      if (created) {
        fields = {
          ...fields,
          [createdAtField]: timestamp({ ...fieldOptions, defaultValue: { kind: 'now' } }),
        };
      }
      return {
        ...listConfig,
        fields: {
          ...listConfig.fields,
          ...fields,
        },
      };
    };

export const createdAt = (
  options: Omit<AtTrackingOptions, 'created' | 'updated' | 'updatedAtField'>
) => atTracking({ created: true, updated: false, ...options });
export const updatedAt = (
  options: Omit<AtTrackingOptions, 'created' | 'updated' | 'createdAtField'>
) => atTracking({ created: false, updated: true, ...options });
