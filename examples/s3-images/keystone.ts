import { config } from '@keystone-next/keystone';
import { lists } from './schema';
import 'dotenv/config';

export default config({
  db: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL || 'postgres://localhost/k6-s3-images',
  },
  lists,
});
