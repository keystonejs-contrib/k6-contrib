import path from 'path';
import { Text } from '@keystonejs/fields';
import { WysiwygImplementation } from './Implementation';

const pkgDir = path.dirname(require.resolve('@keystonejs-contrib/fields-ckeditor/package.json'));

export let CKEditor = {
  type: 'CKEditor',
  implementation: WysiwygImplementation,
  views: {
    Controller: Text.views.Controller,
    Field: path.join(pkgDir, 'views/Field'),
    Filter: Text.views.Filter,
  },
  adapters: Text.adapters,
};
