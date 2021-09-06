import { createSchema, list } from '@keystone-next/keystone';
import { select, relationship, text, timestamp } from '@keystone-next/keystone/fields';
import { azureStorageImage, azureStorageFile, AzureStorageConfig } from '@k6-contrib/fields-azure';
import 'dotenv/config';

const config: AzureStorageConfig = {
  azureStorageOptions: {
    account: process.env.AZURE_STORAGE_ACCOUNT_NAME || '',
    accessKey: process.env.AZURE_STORAGE_ACCESS_KEY || '',
    container: process.env.AZURE_STORAGE_CONTAINER || '',
  },
};

export const lists = createSchema({
  Post: list({
    fields: {
      title: text({ isRequired: true }),
      status: select({
        dataType: 'enum',
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Published', value: 'published' },
        ],
      }),
      content: text(),
      image: azureStorageImage({ azureStorageConfig: config }),
      image2: azureStorageImage({
        azureStorageConfig: config,
      }),
      file: azureStorageFile({ azureStorageConfig: config }),
      file2: azureStorageFile({ azureStorageConfig: config }),
      publishDate: timestamp(),
      author: relationship({ ref: 'Author.posts', many: false }),
    },
  }),
  Author: list({
    fields: {
      name: text({ isRequired: true }),
      email: text({ isRequired: true, isIndexed: 'unique' }),
      posts: relationship({ ref: 'Post.author', many: true }),
    },
  }),
});
