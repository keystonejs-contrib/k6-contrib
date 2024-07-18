import 'dotenv/config';
import { config } from '@keystone-6/core';
import { lists } from './schema';

export default config({
  db: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL || 'postgres://localhost/k6-s3-images',
  },
  lists,
});
