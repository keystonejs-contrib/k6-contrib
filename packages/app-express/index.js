const fs = require('fs-extra');
const express = require('express');
const fallback = require('express-history-api-fallback');
const pathModule = require('path');

class ExpressApp {
  constructor({ app = express(), ...expressOptions }) {
    Object.entries(expressOptions).forEach(([setting, value]) => app.set(setting, value));
    this.middleWare = app;
  }

  use(...middleware) {
    return this.middleWare.use(...middleware);
  }

  set(...setOptions) {
    return this.middleWare.set(...setOptions);
  }

  configureExpress(fn) {
    if (typeof fn === 'function') {
      fn(this.middleWare);
    }
  }

  prepareMiddleware() {
    return this.middleWare;
  }
}

module.exports = {
  ExpressApp,
};
