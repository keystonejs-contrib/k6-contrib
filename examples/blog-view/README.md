# Demo Project: Blog-View

This is the Blog demo ported to use new View api which brings View feature from Keystone v4

This is the Blog, a Demo Project for Keystone. Compared to the todo list, it is more complex and contains more features that really showcase the power of Keystone - one of which is 'relationships'. The Blog contains four lists - Posts, Post Categories, Users and Comments. Users can create Comments that relate to a certain Post, and Admins can create Posts that can relate to one or more Post Categories.

The Blog is a great example and boilerplate for more complex, real-world implementations of Keystone.

## Running the Project.

To run this project, open your terminal and run `yarn` within the Keystone Contrib project root to install all required packages, then run `yarn dev` or `yarn start` to begin running Keystone.

The Keystone Admin UI is reachable from `localhost:3000/admin`. To log in, use the following credentials:

Username: `admin@keystonejs.com`
Password: `password`

To see an example view app using Keystone's GraphQl APIs, head to `localhost:3000`.

You can change the port that this demo runs on by setting the `PORT` environment variable.

```sh
PORT=5000 bolt start blog
```

## Example Running Mode

### using keystone
see `index.js`, especially use of `blogApp` where we mimic this as keystone middleware alike.

run `yarn dev` or `yarn start`

> `configureExpress` method does not seems to work currently.  

To make use of this method, you must do it like this:-
```js
const blogApp = {
  prepareMiddleware: ({ keystone }) => {
    const app = express();
    app.use(bodyParser.urlencoded({ extended: true })); // use correct body parser for this sub app.
    app.set('views', './templates'); // set view path
    app.set('view engine', 'pug'); // set view engine
    initRoutes(keystone, app); // initialize your express routes

    return app;
  }
}

// later use this in exporting
module.exports = {
  keystone,
  apps: [
    // .. other keystone apps like admin ui, graphql or static app.
    blogApp,
  ],
  distDir,
};

```



### Custom Server
see `server.js` and `index_custom.js` for how to use custom server.

run `yarn dev:custom` or `yarn start:custom`
