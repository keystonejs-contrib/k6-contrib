# @k6-contrib/example-dimension

## 2.2.3

### Patch Changes

- Updated dependencies
  - @k6-contrib/fields-dimension@7.0.0
  - @k6-contrib/fields-weight@7.0.0

## 2.2.2

### Patch Changes

- Update packages
- Updated dependencies
  - @k6-contrib/fields-dimension@6.2.0
  - @k6-contrib/fields-weight@6.2.0

## 2.2.1

### Patch Changes

- Updated dependencies [821bd33]
  - @k6-contrib/fields-dimension@6.0.0
  - @k6-contrib/fields-weight@6.0.0

## 2.2.0

### Minor Changes

- Upgraded to support latest keystone version (`@keystone-6/core@5.1.0`)

### Patch Changes

- Updated dependencies [0a35c51]
  - @k6-contrib/fields-dimension@5.0.0
  - @k6-contrib/fields-weight@5.0.0

## 2.1.0

### Minor Changes

- Upgraded to support latest keystone version (`@keystone-6/core@4.0.0`)

### Patch Changes

- Updated dependencies
  - @k6-contrib/fields-dimension@4.0.0
  - @k6-contrib/fields-weight@4.0.0

## 2.0.0

### Major Changes

- a2af848: upgraded keystone version to 3.0.0

### Patch Changes

- Updated dependencies [a2af848]
  - @k6-contrib/fields-dimension@3.0.0
  - @k6-contrib/fields-weight@3.0.0

## 1.0.0

### Major Changes

- 3219ffa: Upgraded to support latest keystone version (`@keystone-6/core@2.1.0`). This brings react@18 support

### Patch Changes

- Updated dependencies [3219ffa]
  - @k6-contrib/fields-dimension@2.0.0
  - @k6-contrib/fields-weight@2.0.0

## 0.6.1

### Patch Changes

- 262afbf: An issue with an invalid peer dependency specifier on `@keystone-6/core`, in the package.json files for each package, has been fixed. This addresses an npm install failure when installing the packages. In addition, `graphql-upload` has been added as a peer dependency on a number of field packages to indicate it needs to be installed with the packages.
- Updated dependencies [262afbf]
  - @k6-contrib/fields-dimension@1.0.1
  - @k6-contrib/fields-weight@1.0.1

## 0.6.0

### Minor Changes

- d1a0af8: Upgrade to Keystone 6 GA

### Patch Changes

- Updated dependencies [d1a0af8]
  - @k6-contrib/fields-dimension@1.0.0
  - @k6-contrib/fields-weight@1.0.0

## 0.5.0

### Minor Changes

- d48da70: Upgraded to keystone 27 and all related dependencies.
  Cleaned up most of the duplicate/unused dependencies from most packages, this now should not affect upgrades and graphql issues going forward. thanks @andreialecu to point out the peer dependency

  **Breaking Changes**

  Keystone 27 has renamed `src` to `url` output for file and image field, similarly the image and file field support for azure and s3 are also renamed.

### Patch Changes

- Updated dependencies [d48da70]
  - @k6-contrib/fields-dimension@0.5.0
  - @k6-contrib/fields-weight@0.5.0

## 0.4.1

### Patch Changes

- a23e0ed: upgrade to latest release keystone@26.1.0
- Updated dependencies [a23e0ed]
  - @k6-contrib/fields-dimension@0.4.1
  - @k6-contrib/fields-weight@0.4.1

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

### Patch Changes

- Updated dependencies [a8a9f61]
  - @k6-contrib/fields-dimension@0.4.0
  - @k6-contrib/fields-weight@0.4.0

## 0.3.0

### Minor Changes

- 3f8129d: Fixed issues with jsx and view path in all packages

### Patch Changes

- Updated dependencies [3f8129d]
  - @k6-contrib/fields-dimension@0.3.0
  - @k6-contrib/fields-weight@0.3.0

## 0.2.0

### Minor Changes

- 4b9e318: Upgraded to Keystone@25.0.3, Also fixed type of `withTracking(listConfig)` generated by `configureTracking`

### Patch Changes

- Updated dependencies [4b9e318]
  - @k6-contrib/fields-dimension@0.2.0
  - @k6-contrib/fields-weight@0.2.0

## 0.1.0

### Minor Changes

- f41b4bf: Created Dimension and Weight field

### Patch Changes

- Updated dependencies [f41b4bf]
  - @k6-contrib/fields-dimension@0.1.0
  - @k6-contrib/fields-weight@0.1.0
