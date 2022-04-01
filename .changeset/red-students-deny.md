---
'@k6-contrib/example-azure': patch
'@k6-contrib/example-basic': patch
'@k6-contrib/example-dimension': patch
'@k6-contrib/example-s3': patch
'@k6-contrib/example-s3-images': patch
'@k6-contrib/example-with-tracking': patch
'@k6-contrib/fields-azure': patch
'@k6-contrib/fields-bigint': patch
'@k6-contrib/fields-dimension': patch
'@k6-contrib/fields-encrypted': patch
'@k6-contrib/fields-s3': patch
'@k6-contrib/fields-s3-images': patch
'@k6-contrib/fields-weight': patch
'@k6-contrib/list-plugins': patch
---

An issue with an invalid peer dependency specifier on `@keystone-6/core`, in the package.json files for each package, has been fixed. This addresses an npm install failure when installing the packages. In addition, `graphql-upload` has been added as a peer dependency on a number of field packages to indicate it needs to be installed with the packages.
