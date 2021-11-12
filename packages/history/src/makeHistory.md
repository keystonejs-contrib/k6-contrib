<!--[meta]
section: history
title: history
[meta]-->

# history Plugin

Add `History` list in your schema.

Add `oldValue`, `newValue`, `orignal`, `operation`and `createdAt` fields to History list. These fields are read-only
but they will be updated automatically when items are created or updated.

## Usage

```ts
import { history } from '@k6-contrib/history';

const withHistory = history();

const User = list(withHistory({
  ui: {...},
  fields: {...},
  ...
}))
```
### `access`

By default access control in Histroy list is read only:

```javascript allowCopy=false showLanguage=false
{
  read: true,
  create: false,
  update: false
}
```