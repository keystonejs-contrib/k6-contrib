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

**Paremeters**
* `app`: used for providing custom express instance.  
* `expressOptions`: all those things can be set using `app.set(key, value)`  
* `configureExpress`: function argument which will be called similar to `configureExpress` method.
>`expressOptions` can be skipped altogether and only `configureExpress` may be used

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

// OR when skipping expressOptions

new ExpressApp(app => {
  app.set(...);
  app.use(...);
  app.get(...);
  app.post(...);
})
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
