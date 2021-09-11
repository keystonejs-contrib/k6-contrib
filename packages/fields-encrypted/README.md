# Encrypted Field

```ts
import { encrypted } from '@k6-contrib/fields-encrypted';
import 'dotenv/config';

const Product = list({
  fields: {
    title: text({ isRequired: true }),
    content: text(),
    encrypted: encrypted({reverse: true, secret: "some secret to encrypt with}), // reverse option lets you see the value in admin ui or in graphql
    encrypted2: encrypted({secret: "some secret to encrypt with}),
  },
});
```
