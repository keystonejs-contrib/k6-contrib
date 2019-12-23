const express = require('express');
const bodyParser = require('body-parser');

const { keystone, apps } = require('./index');
const { port } = require('./config');
const initRoutes = require('./routes');
const { logAdminRoutes } = require('./utils');

keystone
  .prepare({ apps, dev: process.env.NODE_ENV !== 'production' })
  .then(async ({ middlewares }) => {
    await keystone.connect();

    const blogApp = express();
    blogApp.use(bodyParser.urlencoded({ extended: true }));
    blogApp.set('views', './templates');
    blogApp.set('view engine', 'pug');
    initRoutes(keystone, blogApp);
    
    const app = express();

    app.use([...middlewares, blogApp]);

    app.listen(port, error => {
      if (error) throw error;
      logAdminRoutes(apps, port);
    });
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
