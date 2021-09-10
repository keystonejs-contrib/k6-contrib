import { createSchema, list } from '@keystone-next/keystone';
import { select, relationship, text, timestamp } from '@keystone-next/keystone/fields';
import { S3Config, s3File, s3Image } from '@k6-contrib/fields-s3';
import 'dotenv/config';

const s3Config: S3Config = {
  bucket: process.env.S3_BUCKET as string,
  folder: process.env.S3_PATH,
  baseUrl: process.env.S3_BASE_URL,
  s3Options: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    endpoint: process.env.S3_ENDPOINT,
  },
  uploadParams() {
    return {
      ACL: 'public-read',
    };
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
      image: s3Image({ s3Config }),
      image2: s3Image({ s3Config: {...s3Config, folder: `${process.env.S3_PATH}2`} }),
      file: s3File({ s3Config }),
      file2: s3File({ s3Config }),
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
