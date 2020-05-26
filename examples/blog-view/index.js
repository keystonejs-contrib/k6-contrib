//imports for Keystone app core
const { Keystone } = require('@keystonejs/keystone');
const { PasswordAuthStrategy } = require('@keystonejs/auth-password');
const { MongooseAdapter } = require('@keystonejs/adapter-mongoose');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const { StaticApp } = require('@keystonejs/app-static');
const { ExpressApp } = require('@keystonejs-contrib/app-express');
const bodyParser = require('body-parser');

const initRoutes = require('./routes');
const { staticSrc, staticPath, distDir } = require('./config');
const { User, Post, PostCategory, Comment } = require('./schema');

const keystone = new Keystone({
  name: 'Keystone Demo Blog (View)',
  adapter: new MongooseAdapter(),
  onConnect: async () => {
    // Initialise some data.
    // NOTE: This is only for demo purposes and should not be used in production
    const users = await keystone.lists.User.adapter.findAll();
    if (!users.length) {
      const initialData = require('./initialData');
      await keystone.createItems(initialData);
    }
  },
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
  adminPath: '/admin',
  authStrategy,
  pages: [
    {
      label: 'About this project',
      path: 'about',
      component: require.resolve('./admin/pages/about'),
    },
    {
      label: 'Blog',
      children: [
        { listKey: 'Post' },
        { label: 'Categories', listKey: 'PostCategory' },
        { listKey: 'Comment' },
      ],
    },
    {
      label: 'People',
      children: ['User'],
    },
  ],
});

const blogApp = new ExpressApp(
  {
    views: './templates',
    'view engine': 'pug',
  },
  app => {
    app.use(bodyParser.urlencoded({ extended: true }));
    initRoutes(keystone, app);
  }
);

// this works too 
// const blogApp = new ExpressApp(app => {
//   app.set('views', './templates');
//   app.set('view engine', 'pug');
//   app.use(bodyParser.urlencoded({ extended: true }));
//   initRoutes(keystone, app);
// });

module.exports = {
  keystone,
  apps: [new GraphQLApp(), new StaticApp({ path: staticPath, src: staticSrc }), adminApp, blogApp],
  distDir,
};
