# @k6-contrib/fields-azure

## 2.0.0

### Major Changes

- 3219ffa: Upgraded to support latest keystone version (`@keystone-6/core@2.1.0`). This brings react@18 support

## 1.1.0

### Minor Changes

- 58b5989: Update keystone version to ^1.1.0. Update packages to match keystone repo

## 1.0.1

### Patch Changes

- 262afbf: An issue with an invalid peer dependency specifier on `@keystone-6/core`, in the package.json files for each package, has been fixed. This addresses an npm install failure when installing the packages. In addition, `graphql-upload` has been added as a peer dependency on a number of field packages to indicate it needs to be installed with the packages.

## 1.0.0

### Major Changes

- d1a0af8: Upgrade to Keystone 6 GA

## 0.5.0

### Minor Changes

- d48da70: Upgraded to keystone 27 and all related dependencies.
  Cleaned up most of the duplicate/unused dependencies from most packages, this now should not affect upgrades and graphql issues going forward. thanks @andreialecu to point out the peer dependency

  **Breaking Changes**

  Keystone 27 has renamed `src` to `url` output for file and image field, similarly the image and file field support for azure and s3 are also renamed.

## 0.4.1

### Patch Changes

- a23e0ed: upgrade to latest release keystone@26.1.0

## 0.4.0

### Minor Changes

- a8a9f61: Upgraded to keystone@26
  ** Breaking Changes **
  There are some breaking changes in line with the Keystone breaking changes

  ### notable changes

  - No longer have `isRequired` field on file and image type (azure, s3).
  - `defaultValue` is now static value for each field type, need to use resolveInput and other hooks to generate default value.
  - `isRequired` is moved to `validation.isRequired` in line with keystone.
  - `atTracking` now internally uses the default value `{kind: 'now'}` and `db.updatedAt` option on `timestamp` field instead of hooks.

## 0.3.0

### Minor Changes

- 3f8129d: Fixed issues with jsx and view path in all packages

## 0.2.0

### Minor Changes

- 4b9e318: Upgraded to Keystone@25.0.3

## 0.1.0

### Minor Changes

- b42a86c: Added package for Azure File Storage which allows use with File and Image type
