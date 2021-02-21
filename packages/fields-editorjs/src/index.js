import { Text } from '@keystonejs/fields';
import { EditorJsImplementation } from './Implementation';

const pkgDir = path.dirname(require.resolve('@keystonejs-contrib/fields-editorjs/package.json'));
export const resolveView = pathname => path.join(pkgDir, pathname);

export let EditorJs = {
  type: 'EditorJs',
  implementation: EditorJsImplementation,
  views: {
    Controller: resolveView('views/Controller'),
    Field: resolveView('views/Field'),
    Filter: Text.views.Filter,
  },
  adapters: Text.adapters,
};
