<!--[meta]
section: api
subSection: field-types
title: CKEditor
[meta]-->

# KeystoneJS CKEditor field

This field inserts a string path into your schema based on the `Text` field type implementation, and renders a [CKEditor5](https://ckeditor.com/ckeditor-5/) editor in the Admin UI.

## Usage

This package isn't included with the keystone fields package and needs to be installed with `yarn add @keystonejs-contrib/fields-ckeditor` or `npm install @keystonejs-contrib/fields-ckeditor`

Then import it, and use it like any other field:

```js
const { CKEditor } = require('@keystonejs/fields-ckeditor');
```
