---
'@k6-contrib/fields-azure': major
---

- Add support for `preserve` in storage config. This defines whether the items should be deleted at the source when they are removed from Keystone's database. The default is `true` to keep the compatibility with the previous versions.
- Removed originalFilename from blob metadata which is causing issues for some non-English and special characters. If you need support for this open a new issue and preferably a PR with configuration option to enable disable this meta header.
