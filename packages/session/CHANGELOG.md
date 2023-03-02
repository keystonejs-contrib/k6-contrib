# @k6-contrib-next/session

## 5.0.0

### Major Changes

- Upgraded to support latest keystone version (`@keystone-6/core@5.1.0`)

## 4.0.0

### Major Changes

- Upgraded to support latest keystone version (`@keystone-6/core@4.0.0`)

## 3.0.0

### Major Changes

- upgraded keystone version to 3.0.0

## 2.0.0

### Major Changes

- 3219ffa: Upgraded to support latest keystone version (`@keystone-6/core@2.1.0`). This brings react@18 support

## 1.0.0

### Major Changes

- d8c6ce0: Add support for API key based authentication, by default it looks for apiKey field in User list.

  this is base don stateless session from keystone, additional options

  - listKey: default to `User`
  - apiKeyField: defaults to `apiKey`
  - apiKeyHeader: defaults to `x-api-key`
