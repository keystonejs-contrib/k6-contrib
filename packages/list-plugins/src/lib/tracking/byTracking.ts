import type { ListConfig, BaseListTypeInfo, BaseFields } from '@keystone-6/core/types';
import type { RelationshipFieldConfig } from '@keystone-6/core/fields';
import { relationship } from '@keystone-6/core/fields';

import type { ByTrackingOptions, ResolveInputHook } from '../types';

import { composeHook } from '../utils';

export const byTracking =
  (options: ByTrackingOptions = { ref: 'User' }) =>
    <ListTypeInfo extends BaseListTypeInfo>(
      listConfig: ListConfig<ListTypeInfo>
    ): ListConfig<ListTypeInfo> => {
      const {
        created = true,
        updated = true,
        ref = 'User',
        createdByField = 'createdBy',
        updatedByField = 'updatedBy',
        ...byFieldOptions
      } = options;

      const fieldOptions: RelationshipFieldConfig<BaseListTypeInfo> = {
        ref,
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
        graphql: { omit: { update: true, create: true } },
        ...byFieldOptions,
      };

      let fields = { ...listConfig.fields };
      if (updated) {
        fields = {
          ...fields,
          [updatedByField]: relationship({ ...fieldOptions }),
        };
      }

      if (created) {
        fields = {
          ...fields,
          [createdByField]: relationship({ ...fieldOptions }),
        };
      }

      const newResolveInput: ResolveInputHook = ({ resolvedData, operation, context }) => {
        // If not logged in, the id is set to `null`
        const { session: { itemId: id = null, listKey = null } = {} } = context;

        // this avoids connecting item if the auth list is different than the list key
        if (listKey === ref) {
          if (operation === 'create') {
            // create mode
            if (created) {
              resolvedData[createdByField] = { connect: { id } };
            }
            if (updated) {
              resolvedData[updatedByField] = { connect: { id } };
            }
          }
          if (operation === 'update') {
            // update mode

            // do not allow overriding createdBy field
            if (created) {
              delete resolvedData[createdByField]; // createdByField No longer sent by api/admin, but access control can be skipped!
            }
            // opted-in to updatedBy tracking
            if (updated) {
              resolvedData[updatedByField] = { connect: { id } };
            }
          }
        }
        return resolvedData;
      };

      const originalResolveInput = listConfig.hooks?.resolveInput;
      const originalCreateHook = listConfig.hooks?.resolveInput?.create;
      const originalUpdateHook = listConfig.hooks?.resolveInput?.update;
      const resolveInput =
        typeof originalResolveInput === 'function'
          ? composeHook(originalResolveInput, newResolveInput)
          : {
              create: composeHook(originalCreateHook, newResolveInput),
              update: composeHook(originalUpdateHook, newResolveInput),
            };

      return {
        ...listConfig,
        fields: {
          ...listConfig.fields,
          ...fields,
        },
        hooks: {
          ...listConfig.hooks,
          resolveInput,
        },
      };
    };

export const createdBy = (
  options: Omit<ByTrackingOptions, 'created' | 'updated' | 'updatedByField'>
) => byTracking({ created: true, updated: false, ...options });
export const updatedBy = (
  options: Omit<ByTrackingOptions, 'created' | 'updated' | 'createdByField'>
) => byTracking({ created: false, updated: true, ...options });
