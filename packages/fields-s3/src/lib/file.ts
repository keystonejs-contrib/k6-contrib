import path from 'path';
import { Path } from 'graphql/jsutils/Path';

import {
  BaseGeneratedListTypes,
  fieldType,
  FieldTypeFunc,
  KeystoneContext,
} from '@keystone-6/core/types';
import { graphql } from '@keystone-6/core';
import { getFileRef } from './utils';
import { S3FieldConfig, S3FieldInputType, S3Config, S3DataType, FileData } from './types';
import { getDataFromRef, getDataFromStream, getUrl } from './s3';

const views = path.join(path.dirname(__dirname), 'views/file');

const _fieldConfigs: { [key: string]: S3Config } = {};

const S3FileFieldInput = graphql.inputObject({
  name: 'S3FileFieldInput',
  fields: {
    upload: graphql.arg({ type: graphql.Upload }),
    ref: graphql.arg({ type: graphql.String }),
  },
});

const fileOutputFields = graphql.fields<Omit<FileData, 'type'>>()({
  filename: graphql.field({ type: graphql.nonNull(graphql.String) }),
  filesize: graphql.field({ type: graphql.nonNull(graphql.Int) }),
  ref: graphql.field({
    type: graphql.nonNull(graphql.String),
    resolve(data) {
      return getFileRef(data.filename);
    },
  }),
  url: graphql.field({
    type: graphql.nonNull(graphql.String),
    resolve(data, args, context, info) {
      const { key, typename } = info.path.prev as Path;
      const config = _fieldConfigs[`${typename}-${key}`];
      return getUrl(config, { type: 'file', ...data } as S3DataType);
    },
  }),
});

const S3FileFieldOutput = graphql.interface<Omit<FileData, 'type'>>()({
  name: 'S3FileFieldOutput',
  fields: fileOutputFields,
  resolveType: () => 'S3FileFieldOutputType',
});

const S3FileFieldOutputType = graphql.object<Omit<FileData, 'type'>>()({
  name: 'S3FileFieldOutputType',
  interfaces: [S3FileFieldOutput],
  fields: fileOutputFields,
});

function createInputResolver(config: S3Config) {
  return async function inputResolver(data: S3FieldInputType, context: KeystoneContext) {
    if (data === null || data === undefined) {
      return { filename: data, filesize: data };
    }

    if (data.ref) {
      if (data.upload) {
        throw new Error('Only one of ref and upload can be passed to S3FileFieldInput');
      }
      return getDataFromRef(config, 'file', data.ref) as any;
    }
    if (!data.upload) {
      throw new Error('Either ref or upload must be passed to FileFieldInput');
    }
    return getDataFromStream(config, 'file', await data.upload);
  };
}

export const s3File =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    s3Config,
    ...config
  }: S3FieldConfig<TGeneratedListTypes>): FieldTypeFunc =>
  meta => {
    if ((config as any).isUnique) {
      throw Error('isUnique is not a supported option for field type file');
    }

    if (typeof s3Config === 'undefined') {
      throw new Error(
        `Must provide s3Config option in S3Image field for List: ${meta.listKey}, field: ${meta.fieldKey}`
      );
    }
    _fieldConfigs[`${meta.listKey}-${meta.fieldKey}`] = s3Config;

    return fieldType({
      kind: 'multi',
      fields: {
        filename: { kind: 'scalar', scalar: 'String', mode: 'optional' },
        filesize: { kind: 'scalar', scalar: 'Int', mode: 'optional' },
      },
    })({
      ...config,
      input: {
        create: {
          arg: graphql.arg({ type: S3FileFieldInput }),
          resolve: createInputResolver(s3Config as S3Config),
        },
        update: {
          arg: graphql.arg({ type: S3FileFieldInput }),
          resolve: createInputResolver(s3Config as S3Config),
        },
      },
      output: graphql.field({
        type: S3FileFieldOutput,
        resolve({ value: { filename, filesize } }) {
          if (filename === null || filesize === null) {
            return null;
          }
          return { filename, filesize };
        },
      }),
      unreferencedConcreteInterfaceImplementations: [S3FileFieldOutputType],
      views,
    });
  };
