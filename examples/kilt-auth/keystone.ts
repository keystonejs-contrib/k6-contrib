import { config } from '@keystone-6/core';
import { statelessSessions } from '@keystone-6/core/session';
import dotenv from 'dotenv';
import { createAuth } from '../../packages/kilt-auth';
import { lists } from './schema';

dotenv.config();

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'DID',
  initFirstItem: { itemData: { isAdmin: true } },
});

export default withAuth(
  config({
    server: { cors: { origin: true, credentials: true } },
    db: {
      provider: 'sqlite',
      url: process.env.DATABASE_URL || 'file:./keystone-example.db',
    },
    session: statelessSessions({
      secret: process.env.SERVER_SECRET || 'THIS___IS___A___VERY___BAD___SECRET',
    }),
    lists,
  })
);
