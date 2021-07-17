const { simpleListConfig } = require('./lib/simpleListConfig');

const required = (readonly = multiline = unique = indexed = true);

module.exports = {
  simpleListConfig,
  required,
  multiline,
  readonly,
  unique,
  indexed,
};
