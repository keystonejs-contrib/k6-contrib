# @k6-contrib-next/session

## 1.0.0

### Major Changes

- d8c6ce0: Add support for API key based authentication, by default it looks for apiKey field in User list.

  this is base don stateless session from keystone, additional options

  - listKey: default to `User`
  - apiKeyField: defaults to `apiKey`
  - apiKeyHeader: defaults to `x-api-key`
