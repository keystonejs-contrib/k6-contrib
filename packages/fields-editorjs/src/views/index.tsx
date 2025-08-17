import React, { useEffect, useRef } from 'react';
import {
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '@keystone-6/core/types';
import { TextField } from '@keystar/ui/text-field';
import { FieldPrimitive } from '@keystar/ui/field';
import { CellContainer } from '@keystone-6/core/admin-ui/components';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import DragDrop from 'editorjs-drag-drop';
import { Box } from '@keystar/ui/layout';

export const Field = ({ field, value, onChange, autoFocus }: FieldProps<typeof controller>) => {
  const editorRef = useRef<EditorJS | null>(null);
  useEffect(() => {
    if (editorRef.current) return;
    const editor = new EditorJS({
      data: value ? JSON.parse(value) : undefined,
      holder: field.fieldKey,
      autofocus: autoFocus,
      readOnly: !onChange,
      tools: {
        header: {
          class: Header,
          inlineToolbar: ['link'],
          config: {
            placeholder: 'Enter a header',
          },
        },
        list: {
          class: List,
          inlineToolbar: true,
        },
        // image: {
        //   class: ImageTool,
        //   config: {
        //     endpoints: {
        //       byFile: 'http://localhost:3000/images',
        //       byUrl: 'http://localhost:3000/images',
        //     },
        //   },
        // },
        ...field.tools,
      },
      onChange: () => {
        editor.save().then(data => {
          onChange?.(JSON.stringify(data));
        });
      },
      onReady() {
        new DragDrop(editor);
      },
    });
    editorRef.current = editor;
  }, []);
  let error = '';
  return (
    <FieldPrimitive label={field.label} description={field.description} errorMessage={error}>
      <Box
        id={field.fieldKey}
        UNSAFE_style={{
          backgroundColor: 'white',
          minHeight: '200px',
          borderRadius: '4px',
          maxHeight: 600,
          overflowY: 'auto',
        }}
      ></Box>
    </FieldPrimitive>
  );
};

export const Cell: CellComponent = ({ item, field }) => {
  let value = item[field.fieldKey] + '';
  return <CellContainer>{value}</CellContainer>;
};

type Config = FieldControllerConfig<{}>;

export const controller = (config: Config): FieldController<string, string> & { tools: any } => {
  return {
    fieldKey: config.fieldKey,
    label: config.label,
    description: config.description,
    graphqlSelection: config.fieldKey,
    defaultValue: '',
    tools: config.customViews.tools || {},
    deserialize: data => {
      const value = data[config.fieldKey];
      return typeof value === 'string' ? value : '';
    },
    serialize: value => ({ [config.fieldKey]: value }),
    filter: {
      parseGraphQL: value => {
        try {
          return JSON.parse(value);
        } catch {
          return {};
        }
      },
      Filter(props) {
        return (
          <TextField
            onChange={text => {
              props.onChange(text);
            }}
            value={props.value}
            autoFocus={props.autoFocus}
          />
        );
      },
      graphql: ({ type, value }) => {
        const isNot = type.startsWith('not_');
        const key =
          type === 'is_i' || type === 'not_i'
            ? 'equals'
            : type
                .replace(/_i$/, '')
                .replace('not_', '')
                .replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());
        const filter = { [key]: value };
        return {
          [config.fieldKey]: {
            ...(isNot ? { not: filter } : filter),
            mode: 'insensitive',
          },
        };
      },
      Label({ label, value }) {
        return `${label.toLowerCase()}: "${value}"`;
      },
      types: {
        contains_i: {
          label: 'Contains',
          initialValue: '',
        },
        not_contains_i: {
          label: 'Does not contain',
          initialValue: '',
        },
        is_i: {
          label: 'Is exactly',
          initialValue: '',
        },
        not_i: {
          label: 'Is not exactly',
          initialValue: '',
        },
        starts_with_i: {
          label: 'Starts with',
          initialValue: '',
        },
        not_starts_with_i: {
          label: 'Does not start with',
          initialValue: '',
        },
        ends_with_i: {
          label: 'Ends with',
          initialValue: '',
        },
        not_ends_with_i: {
          label: 'Does not end with',
          initialValue: '',
        },
      },
    },
  };
};

export const allowedExportsOnCustomViews = ['tools'];
