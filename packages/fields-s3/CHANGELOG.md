# @k6-contrib/fields-s3

## 0.6.1

### Patch Changes

- a23e0ed: upgrade to latest release keystone@26.1.0

## 0.6.0

### Minor Changes

- a8a9f61: Upgraded to keystone@26
  ** Breaking Changes **
  There are some breaking changes in line with the Keystone breaking changes

  ### notable changes

  - No longer have `isRequired` field on file and image type (azure, s3).
  - `defaultValue` is now static value for each field type, need to use resolveInput and other hooks to generate default value.
  - `isRequired` is moved to `validation.isRequired` in line with keystone.
  - `atTracking` now internally uses the default value `{kind: 'now'}` and `db.updatedAt` option on `timestamp` field instead of hooks.

## 0.5.0

### Minor Changes

- 3f8129d: Fixed issues with jsx and view path in all packages

## 0.4.0

### Minor Changes

- 4b9e318: Upgraded to Keystone@25.0.3

## 0.3.0

### Minor Changes

- 1ec1ec9: Updated keystone dependencies to match @keystone-next/keystone@24.0.0

## 0.2.0

### Minor Changes

- 3cf58b3: Fiex fields to support multiple use, Prevent duplicate GraphQL type generation

## 0.1.1

### Patch Changes

- 94d090e: update packages to latest

## 0.1.0

### Minor Changes

- 7c6248b: Rename packages. waiting for major release of Keystone-6 before releasing first major version
  Remove legacy and unmaintained packages
