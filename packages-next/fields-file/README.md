<!--[meta]
section: api
subSection: field-types
title: File
[meta]-->

# File Field

Support files hosted in a range of different contexts, e.g. in the local filesystem, or on a cloud based file server using s3 adapter.

## Usage

```ts
import { file } from '@keystonejs-contrib-next/fields-file';
import { LocalFileAdapter, S3Adapter } from '@keystone-next/file-adapters-legacy';

const fileAdapter = new LocalFileAdapter({
  /*...config */
});

const s3Options = {
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  endpoint: process.env.S3_ENDPOINT,
  region: 'REGION',
};

const s3Adapter = new S3Adapter({
  bucket: process.env.S3_BUCKET,
  folder: process.env.S3_PATH,
  // this for digitalocean - see s3 config for aws and other s3 compatible providers
  publicUrl: ({ id, filename, _meta }) =>
    `${process.env.S3_CDN_URL}/${process.env.S3_PATH}/${filename}`,
  s3Options,
  // based on need to make url public or not
  uploadParams: ({ filename, id, mimetype, encoding }) => ({
    ACL: 'public-read',
    Metadata: {
      keystone_id: `${id}`,
    },
  }),
});

const User = list(
  withAtTracking({
    ui: {
      /*... */
    },
    fields: {
      file: {
        type: File,
        adapter: fileAdapter, // or s3Adapter
        isRequired: true,
      },
    },
    /*... */
  })
);
```

### Config

| Option       | Type      | Default  | Description                                                                             |
| ------------ | --------- | -------- | --------------------------------------------------------------------------------------- |
| `adapter`    | `Object`  | Required | See the [File Adapters](/packages/file-adapters/README.md) page for available adapters. |
| `isRequired` | `Boolean` | `false`  | Does this field require a value?                                                        |
