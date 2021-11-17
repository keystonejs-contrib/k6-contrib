import { config } from '@keystone-next/keystone';
import { statelessSessions } from '@keystone-next/keystone/session';
import { createAuth } from '@keystone-next/auth';
import { createHistory } from '../../packages/history/src';

import { lists } from './schema';

let sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'The SESSION_SECRET environment variable must be set in production'
    );
  } else {
    sessionSecret = '-- DEV COOKIE SECRET; CHANGE ME --';
  }
}

let sessionMaxAge = 60 * 60 * 24 * 30; // 30 days

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  sessionData: 'name',
  initFirstItem: {
    fields: ['name', 'email', 'password'],
  },
});
const { withHistory } = createHistory({
  listKey: 'History',
});

const session = statelessSessions({
  maxAge: sessionMaxAge,
  secret: sessionSecret,
});

// withAuth(
//     config({
//       db: {
//         provider: 'sqlite',
//         url: 'file:./keystone.db',
//       },
//       ui: {
//         isAccessAllowed: (context) => !!context.session?.data,
//       },
//       lists,
//       session,
//     })
// );
export default withHistory(
  config({
    db: {
      provider: 'sqlite',
      url: 'file:./keystone.db',
    },
    lists
  })
);