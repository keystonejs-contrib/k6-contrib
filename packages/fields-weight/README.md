# Weight Field

```ts
import { weight } from '@k6-contrib/fields-weight';
import 'dotenv/config';

const Product = list({
  fields: {
    title: text({ validation: { isRequired: true } }),
    content: text(),
    weight: weight({}),
    packageWeight: weight({}),
  },
});
```
