import { list } from '@keystone-6/core';
import { text, relationship, password, timestamp, select } from '@keystone-6/core/fields';
import { document } from '@keystone-6/fields-document';
import { configureTracking } from '@k6-contrib/list-plugins';
import { allowAll } from '@keystone-6/core/access';

const withTracking = configureTracking({ atTrackingOptions: { isIndexed: true } });

export const lists = {
  User: list(
    withTracking({
      access: { operation: allowAll },
      history: true,
      ui: {
        listView: {
          initialColumns: ['name', 'posts'],
        },
      },
      fields: {
        name: text({ validation: { isRequired: true } }),
        email: text({ validation: { isRequired: true }, isIndexed: 'unique', isFilterable: true }),
        password: password({ validation: { isRequired: true } }),
        posts: relationship({ ref: 'Post.author', many: true }),
      },
    })
  ),
  Post: list({
    history: {
      history: true,
      exclusive: true,
      suffix: 'Log',
      exclude: ['publishDate'],
    },
    access: { operation: allowAll },
    fields: {
      title: text(),
      status: select({
        options: [
          { label: 'Published', value: 'published' },
          { label: 'Draft', value: 'draft' },
        ],
        ui: {
          displayMode: 'segmented-control',
        },
      }),
      content: document({
        formatting: true,
        layouts: [
          [1, 1],
          [1, 1, 1],
          [2, 1],
          [1, 2],
          [1, 2, 1],
        ],
        links: true,
        dividers: true,
      }),
      publishDate: timestamp(),
      author: relationship({
        ref: 'User.posts',
        ui: {
          displayMode: 'cards',
          cardFields: ['name', 'email'],
          inlineEdit: { fields: ['name', 'email'] },
          linkToItem: true,
          inlineCreate: { fields: ['name', 'email'] },
        },
      }),
      tags: relationship({
        ref: 'Tag.posts',
        ui: {
          displayMode: 'cards',
          cardFields: ['name'],
          inlineEdit: { fields: ['name'] },
          linkToItem: true,
          inlineConnect: true,
          inlineCreate: { fields: ['name'] },
        },
        many: true,
      }),
    },
  }),
  Tag: list(
    withTracking({
      access: { operation: allowAll },
      ui: {
        isHidden: true,
      },
      fields: {
        name: text(),
        posts: relationship({
          ref: 'Post.tags',
        }),
      },
    })
  ),
};
