import { CellComponent, FieldController, FieldControllerConfig } from '@keystone-6/core/types';

export { Field } from './Field';

import { validateImage } from './Field';

export const Cell: CellComponent<typeof controller> = ({ value }) => {
  if (!value) return null;
  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        height: 24,
        lineHeight: 0,
        width: 24,
      }}
    >
      <img style={{ maxHeight: '100%', maxWidth: '100%' }} src={value.url} alt={value.filename} />
    </div>
  );
};

export type ImageValue =
  | { kind: 'empty' }
  | {
      kind: 'from-server';
      data: {
        id: string;
        url: string;
        extension: string;
        filesize: number;
        width: number;
        height: number;
      };
    }
  | {
      kind: 'upload';
      data: {
        file: File;
        validity: ValidityState;
      };
      previous: ImageValue;
    }
  | { kind: 'remove'; previous?: Exclude<ImageValue, { kind: 'remove' }> };

type ImageController = FieldController<ImageValue>;

export const controller = (config: FieldControllerConfig): ImageController => {
  return {
    ...config,
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: `${config.path} {
      id
      url
      extension
      filesize
      width
      height
      #sizesMeta
    }`,
    defaultValue: { kind: 'empty' },
    deserialize(item): ImageValue {
      const value = item[config.path];
      if (!value) return { kind: 'empty' };
      console.log('Deserializing image value', value);
      return {
        kind: 'from-server',
        data: {
          id: value.id,
          url: value.url,
          extension: value.extension,
          filesize: value.filesize,
          width: value.width,
          height: value.height,
        },
      };
    },
    validate(value: ImageValue): boolean {
      return value.kind !== 'upload' || validateImage(value.data) === undefined;
    },
    serialize(value: ImageValue) {
      if (value.kind === 'upload') {
        return { [config.path]: { upload: value.data.file } };
      }
      if (value.kind === 'remove') {
        return { [config.path]: null };
      }
      return {};
    },
  };
};
