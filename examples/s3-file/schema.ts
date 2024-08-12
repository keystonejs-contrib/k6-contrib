import { list } from '@keystone-6/core';
import { allowAll } from '@keystone-6/core/access';
import { select, relationship, text, timestamp } from '@keystone-6/core/fields';
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

export const lists = {
  Post: list({
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
      content: text(),
      image: s3Image({ s3Config }),
      image2: s3Image({ s3Config: { ...s3Config, folder: `${process.env.S3_PATH}2` } }),
      image3: s3Image({ s3Config: { ...s3Config }, ui: { itemView: { fieldMode: 'read' } } }),
      file: s3File({ s3Config }),
      file2: s3File({ s3Config }),
      file3: s3File({ s3Config, ui: { itemView: { fieldMode: 'read' } } }),
      publishDate: timestamp(),
      author: relationship({ ref: 'Author.posts', many: false }),
    },
  }),
  Author: list({
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      email: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
      posts: relationship({ ref: 'Post.author', many: true }),
    },
  }),
};
