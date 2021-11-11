# List Plugins

# atTracking

Adds `createdAt` and `updatedAt` fields to a list. These fields are read-only by will be updated automatically when items are created or updated.

## Usage

```ts
import { atTracking } from '@k6-contrib/list-plugins';

const withAtTracking = atTracking({});

const User = list(withAtTracking({
  ui: {...},
  fields: {...},
  ...
}))
```

## Config

| Option           | Type     | Default             | Description                               |
| ---------------- | -------- | ------------------- | ----------------------------------------- |
| `createdAtField` | `String` | `createdAt`         | Name of the `createdAt` field.            |
| `updatedAtField` | `String` | `updatedAt`         | Name of the `createdAt` field.            |
| `format`         | `String` | `MM/DD/YYYY h:mm A` | Format of the generated `DateTime` field. |
| `access`         | `Object` | See: access         | Change default access controls.           |

### `access`

By default access control on at tracking fields is read only:

```javascript
{
  read: true,
  create: false,
  update: false
}
```

## Disabling created or updated

You can import _either_ `createdAt` or `updatedAt` to apply a single tracking field:

```javascript
const { createdAt, updatedAt } = require('@keystonejs/list-plugins');
```

_Note_: The API is the same.

# byTracking

Adds `createdBy` and `updatedBy` fields to a list. These fields are read-only by will be updated automatically when items are created or updated.

## Usage

```ts
import { byTracking } from '@k6-contrib/list-plugins';

const withByTracking = byTracking({});

const User = list(withByTracking({
  ui: {...},
  fields: {...},
  ...
}))
```

## Config

| Option           | Type     | Default     | Description                                          |
| ---------------- | -------- | ----------- | ---------------------------------------------------- |
| `createdByField` | `String` | `createdBy` | Name of the `createdBy` field.                       |
| `updatedByField` | `String` | `updatedBy` | Name of the `createdBy` field.                       |
| `ref`            | `String` | `User`      | A reference to the list authenticated items (users). |
| `access`         | `Object` | See: access | Change default access controls.                      |

### `access`

By default access control on at tracking fields is read only:

```javascript
{
  read: true,
  create: false,
  update: false
}
```

## Disabling created or updated

You can import _either_ `createdBy` or `updatedBy` to apply a single tracking field:

```javascript
const { createdBy, updatedBy } = require('@keystonejs/list-plugins');
```

_Note_: The API is the same.

# singleton

## NOT ported

~~This plugin makes a list singleton by allowing only one item in the list. Useful for list which must contain only one items.~~

# logging

This plugin provides a mechanism for logging all mutations in a Keystone system.

## Usage

```ts
const { logging } = require('@k6-contrib/list-plugins');

const withLogging = logging();
const withLogging = logging(args => console.log(args));

const User = list(withLogging({
  ui: {...},
  fields: {...},
  ...
}))

```

## Provided hooks

The `logging` plugin will log the arguments of all mutations with the function `args => console.log(JSON.stringify(args))`.
You can customise its behaviour by providing an alternate logging function.

The plugin provides the following hooks:

- `afterChange`
- `afterDelete`
- `afterAuth`
- `afterUnauth`

The logging function for each hook recieves specific arguments related to the mutation.

### afterChange (create)

| Option          | Type     | Description                               |
| --------------- | -------- | ----------------------------------------- |
| `operation`     | `String` | `"create"`                                |
| `authedItem`    | `Object` | The currently authenticated item.         |
| `authedListKey` | `String` | The list currently authenticated against. |
| `listKey`       | `String` | The key of the list being operated on.    |
| `originalInput` | `Object` | The original input to the mutation.       |
| `createdItem`   | `Object` | The database record of the created item.  |

### afterChange (update)

| Option          | Type     | Description                                                                                                    |
| --------------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| `operation`     | `String` | `"update"`                                                                                                     |
| `authedItem`    | `Object` | The currently authenticated item.                                                                              |
| `authedListKey` | `String` | The list currently authenticated against.                                                                      |
| `listKey`       | `String` | The key of the list being operated on.                                                                         |
| `originalInput` | `Object` | The original input to the mutation.                                                                            |
| `changedItem`   | `Object` | The database record of the updated item. This will only include those fields which have actually been changed. |

### afterDelete

| Option          | Type     | Description                               |
| --------------- | -------- | ----------------------------------------- |
| `operation`     | `String` | `"delete"`                                |
| `authedItem`    | `Object` | The currently authenticated item.         |
| `authedListKey` | `String` | The list currently authenticated against. |
| `listKey`       | `String` | The key of the list being operated on.    |
| `deletedItem`   | `Object` | The database record of the deleted item.  |

### Deprecated - Not available in keystone 6 yet

### afterAuth

| Option          | Type      | Description                                             |
| --------------- | --------- | ------------------------------------------------------- |
| `operation`     | `String`  | `"authenticate"`                                        |
| `authedItem`    | `Object`  | The currently authenticated item.                       |
| `authedListKey` | `String`  | The list currently authenticated against.               |
| `listKey`       | `String`  | The key of the list being operated on.                  |
| `item`          | `Object`  | The authenticated item                                  |
| `success`       | `Boolean` | A success indicator returned by authentication strategy |
| `message`       | `String`  | A success message returned by authentication strategy   |
| `token`         | `String`  | The token returned by authentication strategy           |

### afterUnauth

| Option          | Type     | Description                               |
| --------------- | -------- | ----------------------------------------- |
| `operation`     | `String` | `"unauthenticate"`                        |
| `authedItem`    | `Object` | The currently authenticated item.         |
| `authedListKey` | `String` | The list currently authenticated against. |
| `listKey`       | `String` | The key of the list being operated on.    |
| `itemId`        | `String` | The `ID` of the unauthenticated item      |
