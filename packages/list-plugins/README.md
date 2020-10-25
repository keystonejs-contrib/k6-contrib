# Contrib List Plugins

# simpleListConfig

helps make list config cleaner compared to default KeystoneJs way.

## Usage

```js
const {
  simpleListConfig,
  required,
  unique,
  indexed,
  readonly,
  multiline,
} = require('@keystonejs-contrib/list-plugins');
// values for required, unique, indexed, readonly, multiline all are true
keystone.createList('ListWithPlugin', {
  fields: {
    type: FieldType,
    required, // isRequired
    unique, // isUnique
    indexed, // isIndexed
    readonly, // adminConfig: { isReadOnly }
    multiline, // isMultiline
    default: 'text\nvalue', // defaultValue
  },
  plugins: [
    simpleListConfig(), // function to make it easier to add plugin config later
  ],
});
```
