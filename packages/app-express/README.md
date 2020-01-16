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
})
```

where `expressOptions` is all those things can be set using `app.set(key, value)`

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
