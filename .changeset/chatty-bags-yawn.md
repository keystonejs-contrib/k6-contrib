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

Upgraded to keystone@26
** Breaking Changes **
There are some breaking changes in line with the Keystone breaking changes

### notable changes
* No longer have `isRequired` field on file and image type (azure, s3).
* `defaultValue` is now static value for each field type, need to use resolveInput and other hooks to generate default value.
* `isRequired` is moved to `validation.isRequired` in line with keystone.
* `atTracking` now internally uses the default value `{kind: 'now'}` and `db.updatedAt` option on `timestamp` field instead of hooks.

