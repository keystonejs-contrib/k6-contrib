# S3 Sharp Image Optimized Field

```ts
import { S3ImagesConfig, s3Images } from '@k6-contrib/fields-s3-images';
import 'dotenv/config';

const s3sConfig: S3sConfig = {
  bucketName: process.env.S3_BUCKET, // name of bucket
  pathPrefix: process.env.S3_PATH,
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  endpoint: process.env.S3_ENDPOINT, // use region for aws, endpoint for s3 compatible storage
  region: process.env.S3_REGION!,
  acl: 'public-read',
  signed: {expiry: 3600}, // in seconds to generate pre signed urls.
  preserve: true, // do not delete the old image automatically
  sizes: {
    sm: 360,
    md: 720,
    lg: 1280,

    // optional
    // if specified, a base64 data url will be generated from an image resized to this number of pixels
    // see: https://nextjs.org/docs/api-reference/next/image#blurdataurl for potential uses
    base64: 200,
  },
  // optional - use it to use a meaningful name to uploads
  transformName: url => url
};

const Post = list({
  fields: {
    title: text({ validation: { isRequired: true } }),
    content: text(),
    image: s3Image({ s3Config }),
    file: s3File({ s3Config }),
  },
});
```

```graphql
query {
  images {
    image {
      id
      width
      height

      # defaults to size: md
      url

      lgUrl: url(size: lg)

      # base64 data url (if enabled via config, otherwise `null`)
      placeholderUrl: url(size: base64)

      # img html element compatible srcset
      srcSet(sizes: [sm, md, lg])
    }
  }
}
```
