# Dimension Field

```ts
import { dimension } from '@k6-contrib/fields-dimension';
import 'dotenv/config';

const Product = list({
  fields: {
    title: text({ isRequired: true }),
    content: text(),
    dimension: dimension({}),
    packageDimension: dimension({}),
  },
});
```
