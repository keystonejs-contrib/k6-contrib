---
'@k6-contrib/example-azure': minor
'@k6-contrib/example-dimension': minor
'@k6-contrib/example-s3': minor
'@k6-contrib/example-s3-images': minor
'@k6-contrib/fields-azure': minor
'@k6-contrib/fields-bigint': minor
'@k6-contrib/fields-dimension': minor
'@k6-contrib/fields-encrypted': minor
'@k6-contrib/fields-s3': minor
'@k6-contrib/fields-s3-images': minor
'@k6-contrib/fields-weight': minor
'@k6-contrib/list-plugins': minor
---

Fix issue with invalid peer dependency specifiers and added linting to k6-contrib packages. Removed direct dependency on `graphql-upload` and made a peer dependency as that is required by Keystone core. This avoids potential issues with mixing up versions of `graphql`, which `graphql-upload` depends upon.
