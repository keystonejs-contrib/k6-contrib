import { relationship } from '@keystone-next/keystone/fields';
import { ListConfig, BaseGeneratedListTypes, BaseFields } from '@keystone-next/keystone/types';
import { ByTrackingOptions, ResolveInputHook } from '../types';
import { composeHook } from '../utils';
import type { RelationshipFieldConfig } from '@keystone-next/keystone/dist/declarations/src/fields/types/relationship';

export const byTracking =
  (options: ByTrackingOptions = { ref: 'User' }) =>
  <Fields extends BaseFields<BaseGeneratedListTypes>>(
    listConfig: ListConfig<BaseGeneratedListTypes, Fields>
  ): ListConfig<BaseGeneratedListTypes, Fields> => {
    const {
      created = true,
      updated = true,
      ref = 'User',
      createdByField = 'createdBy',
      updatedByField = 'updatedBy',
      ...byFieldOptions
    } = options;

    const fieldOptions: RelationshipFieldConfig<BaseGeneratedListTypes> = {
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
      graphql: { omit: ['update', 'create'] },
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
    const resolveInput: ResolveInputHook = composeHook(originalResolveInput, newResolveInput);
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
