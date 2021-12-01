import { config } from '@keystone-6/core';
import { lists } from './schema';
import 'dotenv/config';

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',
  },
  lists,
});
