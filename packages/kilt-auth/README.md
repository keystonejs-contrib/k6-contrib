# Kilt-Auth

An authentication plugin for Keystone6 using Kilt Protocol's Sporran wallet for login using a DID.

## Usage

### .env file

Add `KILT_ADDRESS=wss://peregrine.kilt.io` to .env file

### User List

```ts
export const lists = {
  User: list({
    fields: {
      DID: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
      isAdmin: checkbox(),
      createdAt: timestamp({ db: { updatedAt: true } }),
    },
  }),
};
```

### keystone.ts

```ts
import { createAuth } from '@k6-contrib/kilt-auth';

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'DID',
  initFirstItem: { itemData: { isAdmin: true } },
});

export default withAuth(
  config({
    server: { cors: { origin: true, credentials: true } },
    db: {
      provider: 'sqlite',
      url: process.env.DATABASE_URL,
    },
    session: statelessSessions({
      secret: process.env.SERVER_SECRET,
    }),
    lists,
  })
);
```
