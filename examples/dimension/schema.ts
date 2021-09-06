import { createSchema, list } from '@keystone-next/keystone';
import { select, relationship, text, timestamp } from '@keystone-next/keystone/fields';
import { dimension } from '@k6-contrib/fields-dimension';
import { weight } from '@k6-contrib/fields-weight';
import 'dotenv/config';

export const lists = createSchema({
  Product: list({
    fields: {
      title: text({ isRequired: true }),
      status: select({
        dataType: 'enum',
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Published', value: 'published' },
        ],
      }),
      description: text(),
      dimension: dimension(),
      packageDimension: dimension({ ui: { displayMode: 'segmented-control' } }),
      weight: weight(),
      publishDate: timestamp(),
      author: relationship({ ref: 'Author.products', many: false }),
    },
  }),
  Author: list({
    fields: {
      name: text({ isRequired: true }),
      email: text({ isRequired: true, isIndexed: 'unique' }),
      products: relationship({ ref: 'Product.author', many: true }),
    },
  }),
});
