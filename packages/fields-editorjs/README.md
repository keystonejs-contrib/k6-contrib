# EditorJS Field

```ts
import { editorJs } from '@k6-contrib/fields-editorjs';
import 'dotenv/config';

const Product = list({
  fields: {
    title: text({ validation: { isRequired: true } }),
    content: text(),
    editorJs: editorJs({}),
  },
});
```
