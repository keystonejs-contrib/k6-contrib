/** @jsxRuntime classic */
/** @jsx jsx */

import { useEffect, useRef, useState } from 'react';
import { Box, jsx } from '@keystone-ui/core';
import { FieldContainer, FieldLabel, TextInput } from '@keystone-ui/fields';
import {
  CardValueComponent,
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '@keystone-6/core/types';
import { CellContainer, CellLink } from '@keystone-6/core/admin-ui/components';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';

export const Field = ({ field, value, onChange, autoFocus }: FieldProps<typeof controller>) => {
  const editorRef = useRef<EditorJS | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  useEffect(() => {
    if (editorRef.current) return;
    const editor = new EditorJS({
      data: value ? JSON.parse(value) : undefined,
      holder: field.path,
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
        ...field.tools,
      },
      onChange: () => {
        editor.save().then(data => {
          onChange?.(JSON.stringify(data));
        });
      },
    });
    editorRef.current = editor;
  }, []);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);
  return (
    <FieldContainer>
      <FieldLabel htmlFor={field.path}>
        <Box> {field.label}</Box>
      </FieldLabel>
      {onChange ? (
        <div
          id={field.path}
          onFocus={handleFocus}
          onBlur={handleBlur}
          tabIndex={0} // To make the div focusable
          style={{
            border: `1px solid ${isFocused ? '#3b82f6' : '#e1e5e9'}`,
            borderRadius: '6px',
            padding: '12px',
            minHeight: '150px',
            backgroundColor: `${isFocused ? '#fff' : '#fafbfc'}`,
            boxShadow: `${isFocused ? '0 0 0 2px #bfdbfe' : ''}`,
          }}
        ></div>
      ) : (
        // <TextArea
        //   id={field.path}
        //   autoFocus={autoFocus}
        //   onChange={event => onChange(event.target.value)}
        //   value={value}
        // />
        value
      )}
    </FieldContainer>
  );
};

export const Cell: CellComponent = ({ item, field, linkTo }) => {
  let value = item[field.path] + '';
  return linkTo ? <CellLink {...linkTo}>{value}</CellLink> : <CellContainer>{value}</CellContainer>;
};
Cell.supportsLinkTo = true;

export const CardValue: CardValueComponent = ({ item, field }) => {
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {item[field.path]}
    </FieldContainer>
  );
};

type Config = FieldControllerConfig<{
  displayMode: 'input' | 'textarea';
}>;

export const controller = (
  config: Config
): FieldController<string, string> & { displayMode: 'input' | 'textarea'; tools: any } => {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue: '',
    tools: config.customViews.tools || {},
    displayMode: config.fieldMeta.displayMode,
    deserialize: data => {
      const value = data[config.path];
      return typeof value === 'string' ? value : '';
    },
    serialize: value => ({ [config.path]: value }),
    filter: {
      Filter(props) {
        return (
          <TextInput
            onChange={event => {
              props.onChange(event.target.value);
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
          [config.path]: {
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
