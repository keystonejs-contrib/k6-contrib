# History Plugin

It will generate a list automaticaly with the name you passed in listName in createHistory. You can also generate exclusive history list for each list by using exclusive true in history options.

## Usage

```ts
import { createHistory } from '@k6-contrib/history';

    const { withHistory } = createHistory({
      listName:'Log'
    });

    withAuth(
      withHistory(
        config({
          db: {
            provider: 'sqlite',
            url: 'file:./keystone.db',
          },
          ui: {
            isAccessAllowed: (context) => !!context.session?.data,
          },
          lists,
          session,
        })
      )
    );
  
    User: list({
      history:{
        history:true, 
        exclusive:true,
        suffix:'Log',
        exclude:['publishDate']
      },
    }),
```

## Config

| Option           | Type     | Default             | Description                               |
| ---------------- | -------- | ------------------- | ----------------------------------------- |
| `history`        | `Boolean`| `false`             | Allow for create history.                 |
| `exclusive`      | `Boolean`| `false`             | To generate exclusive list for history.   |
| `suffix`         | `String` | listName            | Add suffix in exclusive list.             |
| `exclude`        | `Array`  | `undefined`         | To exclude particular fields in list.     |

### `ui`

By default ui of list is hidden:

```
ui:{
  isHidden:true
}
```