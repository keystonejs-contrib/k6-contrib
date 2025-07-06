import { mergeSchemas } from '@graphql-tools/schema';
import { list, graphql } from '@keystone-6/core';
import {
  text,
  relationship,
  checkbox,
  password,
  timestamp,
  select,
  virtual,
  image,
  file,
} from '@keystone-6/core/fields';
import { allowAll } from '@keystone-6/core/access';
import { gql } from '@keystone-6/core/admin-ui/apollo';
import { document } from '@keystone-6/fields-document';
import { encrypted } from '@k6-contrib/fields-encrypted';
import { editorJs } from '@k6-contrib/fields-editorjs';
import { configureTracking } from '@k6-contrib/list-plugins';
import { fields } from '@keystone-6/fields-document/component-blocks';

// import { cloudinaryImage } from '@keystone-6/cloudinary';
import { KeystoneListsAPI } from '@keystone-6/core/types';
import { componentBlocks } from './admin/fieldViews/Content';
// import { KeystoneListsTypeInfo } from '.keystone/types';

// TODO: Can we generate this type based on sessionData in the main config?
type AccessArgs = {
  session?: {
    itemId?: string;
    listKey?: string;
    data?: {
      name?: string;
      isAdmin: boolean;
    };
  };
  item?: any;
};
export const access = {
  isAdmin: ({ session }: AccessArgs) => !!session?.data?.isAdmin,
};

const randomNumber = () => Math.round(Math.random() * 10);

const withTracking = configureTracking({});

export const lists = {
  User: list({
    access: allowAll,
    db: {},
    ui: {
      listView: {
        initialColumns: ['name', 'posts', 'avatar'],
      },
    },
    fields: {
      /** The user's first and last name. */
      name: text({ validation: { isRequired: true } }),
      /** Email is used to log into the system. */
      email: text({
        validation: { isRequired: true },
        isIndexed: 'unique',
        isFilterable: true,
        isOrderable: true,
      }),
      editorJs: editorJs({
        ui: {
          views: './admin/tools',
        },
      }),
      secret: encrypted({
        reverse: true,
        secret: process.env.ENCRYPTION_KEYS || 'Super secret encryption keys for testing',
      }),
      secretRequired: encrypted({
        validation: { isRequired: true },
        reverse: true,
        secret: process.env.ENCRYPTION_KEYS || 'Super secret encryption keys for testing',
      }),
      superSecret: encrypted({
        secret: process.env.ENCRYPTION_KEYS || 'Super secret encryption keys for testing',
      }),
      superSecretRequired: encrypted({
        validation: { isRequired: true },
        secret: process.env.ENCRYPTION_KEYS || 'Super secret encryption keys for testing',
      }),
      secret2: encrypted({
        reverse: true,
        ui: { displayMode: 'textarea' },
        secret: process.env.ENCRYPTION_KEYS || 'Super secret encryption keys for testing',
      }),
      secret2Required: encrypted({
        validation: { isRequired: true },
        reverse: true,
        ui: { displayMode: 'textarea' },
        secret: process.env.ENCRYPTION_KEYS || 'Super secret encryption keys for testing',
      }),
      superSecret2: encrypted({
        ui: { displayMode: 'textarea' },
        secret: process.env.ENCRYPTION_KEYS || 'Super secret encryption keys for testing',
      }),
      superSecret2Required: encrypted({
        validation: { isRequired: true },
        ui: { displayMode: 'textarea' },
        secret: process.env.ENCRYPTION_KEYS || 'Super secret encryption keys for testing',
      }),
      /** Avatar upload for the users profile, stored locally */
      // avatar: image(),
      // attachment: file(),
      /** Used to log in. */
      password: password(),
      /** Administrators have more access to various lists and fields. */
      isAdmin: checkbox({
        access: {
          create: access.isAdmin,
          read: access.isAdmin,
          update: access.isAdmin,
        },
        ui: {
          createView: {
            fieldMode: args => (access.isAdmin(args) ? 'edit' : 'hidden'),
          },
          itemView: {
            fieldMode: args => (access.isAdmin(args) ? 'edit' : 'read'),
          },
        },
      }),
      roles: text({}),
      phoneNumbers: relationship({
        ref: 'PhoneNumber.user',
        many: true,
        ui: {
          // TODO: Work out how to use custom views to customise the card + edit / create forms
          // views: './admin/fieldViews/user/phoneNumber',
          displayMode: 'cards',
          cardFields: ['type', 'value'],
          inlineEdit: { fields: ['type', 'value'] },
          inlineCreate: { fields: ['type', 'value'] },
          linkToItem: true,
          // removeMode: 'delete',
        },
      }),
      posts: relationship({ ref: 'Post.author', many: true }),
      randomNumber: virtual({
        field: graphql.field({
          type: graphql.Float,
          resolve() {
            return randomNumber();
          },
        }),
      }),
      apiKey: text({}),
    },
  }),
  PhoneNumber: list(
    withTracking({
      access: allowAll,
      ui: {
        isHidden: true,
        // parentRelationship: 'user',
      },
      fields: {
        label: virtual({
          field: graphql.field({
            type: graphql.String,
            resolve(item: any) {
              return `${item.type} - ${item.value}`;
            },
          }),
          ui: {
            listView: {
              fieldMode: 'hidden',
            },
            itemView: {
              fieldMode: 'hidden',
            },
          },
        }),
        user: relationship({ ref: 'User.phoneNumbers' }),
        type: select({
          options: [
            { label: 'Home', value: 'home' },
            { label: 'Work', value: 'work' },
            { label: 'Mobile', value: 'mobile' },
          ],
          ui: {
            displayMode: 'segmented-control',
          },
        }),
        value: text({}),
      },
    })
  ),
  Post: list(
    withTracking({
      access: {
        operation: {
          query: access.isAdmin,
          create: access.isAdmin,
          update: access.isAdmin,
          delete: access.isAdmin,
        },
      },
      fields: {
        title: text(),
        // TODO: expand this out into a proper example project
        // Enable this line to test custom field views
        // test: text({ ui: { views: require.resolve('./admin/fieldViews/Test.tsx') } }),
        status: select({
          options: [
            { label: 'Published', value: 'published' },
            { label: 'Draft', value: 'draft' },
          ],
          ui: {
            displayMode: 'segmented-control',
          },
        }),
        // content: document({
        //   ui: { views: require.resolve('./admin/fieldViews/Content.tsx') },
        //   relationships: {
        //     mention: {
        //       label: 'Mention',
        //       listKey: 'User',
        //     },
        //   },
        //   formatting: true,
        //   layouts: [
        //     [1, 1],
        //     [1, 1, 1],
        //     [2, 1],
        //     [1, 2],
        //     [1, 2, 1],
        //   ],
        //   links: true,
        //   dividers: true,
        //   componentBlocks,
        // }),
        publishDate: timestamp(),
        author: relationship({
          ref: 'User.posts',
        }),
      },
    })
  ),
};

export const extendGraphqlSchema = schema =>
  mergeSchemas({
    schemas: [schema],
    typeDefs: gql`
      type Query {
        randomNumber: RandomNumber
      }
      type RandomNumber {
        number: Int
        generatedAt: String
      }
      type Mutation {
        createRandomPosts: [Post!]!
      }
    `,
    resolvers: {
      RandomNumber: {
        number(rootVal: { number: number }) {
          return rootVal.number * 1000;
        },
      },
      Mutation: {
        createRandomPosts(root, args, context) {
          // TODO: add a way to verify access control here, e.g
          // await context.verifyAccessControl(userIsAdmin);
          const data = Array.from({ length: 2 }).map((x, i) => ({ title: `Post ${i}` }));
          // note this usage of the type is important because it tests that the generated
          // KeystoneListsTypeInfo extends Record<string, BaseListTypeInfo>
          const lists: KeystoneListsAPI<any> = context.query;
          console.log(data);
          // context.sudo().query.Post.createMany({ data });
          return context.sudo().db.Post.createMany({ data });
        },
      },
      Query: {
        randomNumber: () => ({
          number: randomNumber(),
          generatedAt: Date.now(),
        }),
      },
    },
  });
