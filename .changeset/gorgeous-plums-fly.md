---
'@k6-contrib/session': major
'@k6-contrib/example-basic': patch
---

Ad support for API key based authentication, by default it looks for apiKey field in User list. 

this is base don stateless session from keystone, additional options 

* listKey: default to `User`
* apiKeyField: defaults to `apiKey`
* apiKeyHeader: defaults to `x-api-key`
