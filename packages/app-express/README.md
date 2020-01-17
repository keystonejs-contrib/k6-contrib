---
section: packages
title: Express App
---

# Express App

This package helps create custom middleware using express config

## initialize

#### Constructor
```js
new ExpressApp({
  app = express(),
  ...expressOptions
}, configureExpress = app => {})
```

where `expressOptions` is all those things can be set using `app.set(key, value)`
where `configureExpress` is function argument which will be called similar to `configureExpress` method.

##### example:

```js
const customApp = new ExpressApp({
    views: './templates',
    'view engine': 'pug',
  },
  app => {
    app.use(bodyParser.urlencoded({ extended: true }));
    someOtherMethod(keystone, app);
  }
);
```


#### Methods

##### configureExpress(fn)

useful for configuring the express instance for more settings.

```js
const customApp = new ExpressApp({....config});
customApp.configureExpress(app => {
  app.use(....);
  someOthermethod(app);
})
```


##### use(middleware)

proxy for `app.use` method for express instance wrapped inside

```js
const customApp = new ExpressApp({....config});
customApp.use(bodyParser());
```

##### set(key, value)

proxy for `app.set` method for express instance wrapped inside

```js
const customApp = new ExpressApp({....config});
customApp.set('my option', 'my value');
```
