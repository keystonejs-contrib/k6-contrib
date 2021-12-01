import { list } from '@keystone-6/core';
import { select, relationship, text, timestamp } from '@keystone-6/core/fields';
import { S3ImagesConfig, s3Images } from '@k6-contrib/fields-s3-images';
import 'dotenv/config';

const s3Config: S3ImagesConfig = {
  bucket: process.env.S3_BUCKET as string,
  folder: process.env.S3_PATH,
  baseUrl: process.env.S3_BASE_URL,
  s3Options: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION,
  },
  uploadParams() {
    return {
      ACL: 'public-read',
    };
  },
};

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
      image: s3Images({ s3Config }),
      image2: s3Images({ s3Config: { ...s3Config, folder: `${process.env.S3_PATH}2`, sizes: { sm: 480, md: 1024, lg: 1920 } } }),
      publishDate: timestamp(),
      author: relationship({ ref: 'Author.posts', many: false }),
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
