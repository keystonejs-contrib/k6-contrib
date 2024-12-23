import 'dotenv/config';
import { list } from '@keystone-6/core';
import { select, relationship, text, timestamp } from '@keystone-6/core/fields';
import { S3ImagesConfig, s3Images } from '@k6-contrib/fields-s3-images';
import { allowAll } from '@keystone-6/core/access';

const s3Config: S3ImagesConfig = {
  bucketName: process.env.S3_BUCKET as string,
  pathPrefix: process.env.S3_PATH,
  // baseUrl: process.env.S3_BASE_URL,
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION!,
  acl: 'public-read',
  // preserve: true,
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
      image: s3Images({ s3Config: {
        ...s3Config,
        pathPrefix: `${process.env.S3_PATH}/`,
      } }),
      image2: s3Images({
        s3Config: {
          ...s3Config,
          pathPrefix: `${process.env.S3_PATH}2/`,
          sizes: { sm: 480, md: 1024, lg: 1920 },
        },
      }),
      image3: s3Images({
        s3Config: {
          ...s3Config,
          pathPrefix: `${process.env.S3_PATH}/`,
          sizes: { sm: 480, md: 1024, lg: 0 },
        },
      }),
      image4: s3Images({
        s3Config: { ...s3Config, pathPrefix: `${process.env.S3_PATH}/`, sizes: { sm: 0, md: 0 } },
        ui: { itemView: { fieldMode: 'read' } },
      }),
      image5: s3Images({
        s3Config: {
          ...s3Config,
          pathPrefix: `${process.env.S3_PATH}/`,
          sizes: { md: 0, base64: 100 },
        },
        ui: { itemView: { fieldMode: 'read' } },
      }),
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
