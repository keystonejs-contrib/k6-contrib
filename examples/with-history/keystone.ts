import 'dotenv/config';
/*
Welcome to Keystone! This file is what keystone uses to start the app.

It looks at the default export, and expects a Keystone config object.

You can find all the config options in our docs here: https://keystonejs.com/docs/apis/config
*/

import { config } from '@keystone-6/core';

// Look in the schema file for how we define our lists, and how users interact with them through graphql or the Admin UI
import { lists } from './schema';

// Keystone auth is configured separately - check out the basic auth setup we are importing from our auth file.
import { withAuth, session } from './auth';
import { withHistory } from './auth';

export default withAuth(
  withHistory(
    // Using the config function helps typescript guide you to the available options.
    config({
      server: {
        extendExpressApp: (app: any, commonContext: any) => {
          app.get('/api/users', async (req: any, res: any) => {
            const context = await commonContext.withRequest(req, res);
            const users = await context.query.User.findMany();
            res.json(users);
          });
        },
        port: Number(process.env.PORT) || 8100,
      },
      // the db sets the database provider - we're using sqlite for the fastest startup experience
      db: {
        provider: 'postgresql',
        url: 'postgresql://postgres:secret@localhost:5432/postgres',
      },
      // This config allows us to set up features of the Admin UI https://keystonejs.com/docs/apis/config#ui
      lists,
      session,
    })
  )
);
