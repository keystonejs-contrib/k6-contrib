import 'dotenv/config';
import { list } from '@keystone-6/core';
import { select, relationship, text, timestamp } from '@keystone-6/core/fields';
import { dimension } from '@k6-contrib/fields-dimension';
import { weight } from '@k6-contrib/fields-weight';
import { allowAll } from '@keystone-6/core/access';

export const lists = {
  Product: list({
    access: allowAll,
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
      weightSegment: weight({ ui: { displayMode: 'segmented-control' } }),
      weightSegmentRequired: weight({ validation: { isRequired: true }, ui: { displayMode: 'segmented-control' } }),
      publishDate: timestamp(),
      author: relationship({ ref: 'Author.products', many: false }),
    },
  }),
  Author: list({
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      email: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
      products: relationship({ ref: 'Product.author', many: true }),
    },
  }),
};
