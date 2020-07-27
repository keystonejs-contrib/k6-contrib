import { Text } from '@keystonejs/fields';
import { importView } from '@keystonejs/build-field-types';
import { WysiwygImplementation } from './Implementation';

export let CKEditor = {
  type: 'CKEditor',
  implementation: WysiwygImplementation,
  views: {
    Controller: Text.views.Controller,
    Field: importView('./views/Field'),
    Filter: Text.views.Filter,
  },
  adapters: Text.adapters,
};
