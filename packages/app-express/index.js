const fs = require('fs-extra');
const express = require('express');
const fallback = require('express-history-api-fallback');
const pathModule = require('path');

class ExpressApp {
  constructor(options, configureExpress = app => {}) {
    let _options = options;
    if (typeof options === 'function') {
      configureExpress = options;
      _options = {}
    }
    const { app = express(), ...expressOptions } = _options || {};

    Object.entries(expressOptions).forEach(([setting, value]) => app.set(setting, value));
    if (typeof configureExpress === 'function') {
      configureExpress(app);
    }
    this.app = app;
  }

  use(...middleware) {
    return this.app.use(...middleware);
  }

  set(...setOptions) {
    return this.app.set(...setOptions);
  }

  configureExpress(fn) {
    if (typeof fn === 'function') {
      fn(this.app);
    }
  }

  prepareMiddleware() {
    return this.app;
  }
}

module.exports = {
  ExpressApp,
};
