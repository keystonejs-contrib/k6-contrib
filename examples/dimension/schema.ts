import { list } from '@keystone-next/keystone';
import { select, relationship, text, timestamp } from '@keystone-next/keystone/fields';
import { dimension } from '@k6-contrib/fields-dimension';
import { weight } from '@k6-contrib/fields-weight';
import 'dotenv/config';

export const lists = {
  Product: list({
    fields: {
      title: text({ validation: { isRequired: true } }),
      status: select({
        type: 'enum',
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Published', value: 'published' },
        ],
      }),
      description: text(),
      dimension: dimension(),
      dimensionRequired: dimension({ validation: { isRequired: true } }),
      packageDimension: dimension({ ui: { displayMode: 'segmented-control' } }),
      weight: weight(),
      weightRequired: weight({ validation: { isRequired: true } }),
      publishDate: timestamp(),
      author: relationship({ ref: 'Author.products', many: false }),
    },
  }),
  Author: list({
    fields: {
      name: text({ validation: { isRequired: true } }),
      email: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
      products: relationship({ ref: 'Product.author', many: true }),
    },
  }),
};
