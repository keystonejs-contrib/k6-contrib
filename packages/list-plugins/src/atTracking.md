<!--[meta]
section: list-plugins
title: atTracking
[meta]-->

# atTracking Plugin

Add `createdAt` and `updatedAt` fields to a list. These fields are read-only
but they will be updated automatically when items are created or updated.

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
| `updatedAtField` | `String` | `updatedAt`         | Name of the `updatedAt` field.            |
| `format`         | `String` | `MM/DD/YYYY h:mm A` | Format of the generated `DateTime` field. |
| `access`         | `Object` | See: access         | Change default access controls.           |

### `access`

By default access control on at tracking fields is read only:

```javascript allowCopy=false showLanguage=false
{
  read: true,
  create: false,
  update: false
}
```

## Granular control

If you prefer, you can import _either_ `createdAt` or `updatedAt` to apply a single tracking field:

```javascript
import { createdAt, updatedAt } from '@k6-contrib/list-plugins';
```

> **Note:** The API is the same for each export as `atTracking`.
