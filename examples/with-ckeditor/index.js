//imports for Keystone app core
const { Keystone } = require('@keystonejs/keystone');
const { PasswordAuthStrategy } = require('@keystonejs/auth-password');
const { MongooseAdapter } = require('@keystonejs/adapter-mongoose');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const { StaticApp } = require('@keystonejs/app-static');
const { createItems } = require('@keystonejs/server-side-graphql-client');

const { staticRoute, staticPath, distDir } = require('./config');
const { User, Post, PostCategory, Comment } = require('./schema');

const keystone = new Keystone({
  adapter: new MongooseAdapter({ mongoUri: 'mongodb://localhost/keystone-example-with-ckeditor' }),
  onConnect: async () => {
    // Initialise some data.
    // NOTE: This is only for demo purposes and should not be used in production
    const users = await keystone.lists.User.adapter.findAll();
    if (!users.length) {
      const initialData = require('./initialData');
      await createItems({ keystone, listKey: 'User', items: initialData.User });
    }
  },
  cookieSecret: process.env.COOKIE_SECRET,
  cookie: { secure: process.env.INSECURE_COOKIES ? false : undefined },
});

keystone.createList('User', User);
keystone.createList('Post', Post);
keystone.createList('PostCategory', PostCategory);
keystone.createList('Comment', Comment);

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
});

const adminApp = new AdminUIApp({
  name: 'Keystone Example With CKEditor',
  adminPath: '/admin',
  authStrategy,
});
module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new StaticApp({ path: staticRoute, src: staticPath }),
    adminApp,
  ],
  distDir,
};
