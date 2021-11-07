---
'@k6-contrib/example-azure': minor
'@k6-contrib/example-basic': minor
'@k6-contrib/example-dimension': minor
'@k6-contrib/example-s3': minor
'@k6-contrib/example-s3-images': minor
'@k6-contrib/example-with-tracking': minor
'@k6-contrib/fields-azure': minor
'@k6-contrib/fields-bigint': minor
'@k6-contrib/fields-dimension': minor
'@k6-contrib/fields-encrypted': minor
'@k6-contrib/fields-s3': minor
'@k6-contrib/fields-s3-images': minor
'@k6-contrib/fields-weight': minor
'@k6-contrib/list-plugins': minor
---

Upgraded to keystone 27 and all related dependencies.
Cleaned up most of the duplicate/unused dependencies from most packages, this now should not affect upgrades and graphql issues going forward. thanks @andreialecu to point out the peer dependency

**Breaking Changes**

Keystone 27 has renamed `src` to `url` output for file and image field, similarly the image and file field support for azure and s3 are also renamed.

