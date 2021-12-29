import { config } from '@keystone-6/core';
import { statelessSessions } from '@keystone-6/core/session';
import { createAuth } from '../../packages/kilt-auth';
import { lists } from './schema';

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'DID',
});

export default withAuth(
  config({
    server: { cors: { origin: true, credentials: true } },
    db: {
      provider: 'sqlite',
      url: process.env.DATABASE_URL || 'file:./keystone-example.db',
    },
    session: statelessSessions({ secret: process.env.SERVER_SECRET }),
    lists,
  })
);
