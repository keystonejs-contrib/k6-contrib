import { list } from '@keystone-6/core';
import { select, relationship, text, timestamp } from '@keystone-6/core/fields';
import { nestedSet } from '@k6-contrib/fields-nestedset';

import 'dotenv/config';


export const lists = {
  Post: list({
    fields: {
      title: text({ validation: { isRequired: true } }),
      status: select({
        type: 'enum',
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Published', value: 'published' },
        ],
      }),
      content: text(),
      publishDate: timestamp(),
      author: relationship({ ref: 'Author.posts', many: false }),
      nestedSet: nestedSet()
    },
  }),
  Author: list({
    fields: {
      name: text({ validation: { isRequired: true } }),
      email: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
      posts: relationship({ ref: 'Post.author', many: true }),
    },
  }),
};
