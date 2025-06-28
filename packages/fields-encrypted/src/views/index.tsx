import copy from 'copy-to-clipboard';
import { useState } from 'react';
import { TextField, TextArea } from '@keystar/ui/text-field';
import { ActionButton } from '@keystar/ui/button';
import { VStack, HStack, Box } from '@keystar/ui/layout';
import { Icon } from '@keystar/ui/icon';
import { eyeIcon } from '@keystar/ui/icon/icons/eyeIcon';
import { eyeOffIcon } from '@keystar/ui/icon/icons/eyeOffIcon';
import { clipboardIcon } from '@keystar/ui/icon/icons/clipboardIcon';
import { plusIcon } from '@keystar/ui/icon/icons/plusIcon';
import { minusIcon } from '@keystar/ui/icon/icons/minusIcon';
import {
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '@keystone-6/core/types';

export const Field = ({ field, value, onChange, autoFocus }: FieldProps<typeof controller>) => {
  const [reveal, setReveal] = useState(false);
  const [expand, setExpand] = useState(field.displayMode === 'textarea');
  return (
    <VStack gap="small">
      <HStack alignItems="center" gap="small">
        <Box>{field.label}</Box>
        <ActionButton
          aria-label={expand ? 'Collapse' : 'Expand'}
          onPress={() => setExpand(!expand)}
          prominence="low"
        >
          <Icon src={expand ? minusIcon : plusIcon} />
        </ActionButton>
      </HStack>
      <HStack gap="small" alignItems="center">
        {onChange ? (
          expand ? (
            <TextArea
              id={field.path}
              autoFocus={autoFocus}
              onChange={onChange}
              value={value}
              width={'100%'}
            />
          ) : (
            <TextField
              id={field.path}
              type={reveal ? 'text' : 'password'}
              autoFocus={autoFocus}
              onChange={onChange}
              value={value}
              width={'100%'}
            />
          )
        ) : (
          value
        )}
        {!expand && (
          <HStack gap="small">
            <ActionButton
              aria-label={reveal ? 'Hide' : 'Show'}
              onPress={() => setReveal(!reveal)}
            >
              <Icon src={reveal ? eyeOffIcon : eyeIcon} />
            </ActionButton>
            <ActionButton
              aria-label="Copy"
              onPress={() => copy(value)}
            >
              <Icon src={clipboardIcon} />
            </ActionButton>
          </HStack>
        )}
      </HStack>
    </VStack>
  );
};

export const Cell: CellComponent = ({ item, field }) => {
  let value = item[field.path] + '';
  return <Box>{value}</Box>;
};

type Config = FieldControllerConfig<{
  displayMode: 'input' | 'textarea';
  shouldUseModeInsensitive: boolean;
  reverse: boolean;
}>;

export const controller = (
  config: Config
): FieldController<string, string> & { displayMode: 'input' | 'textarea'; reverse: boolean } => {
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: config.path,
    defaultValue: '',
    displayMode: config.fieldMeta.displayMode,
    reverse: config.fieldMeta.reverse,
    deserialize: data => {
      const value = data[config.path];
      return typeof value === 'string' ? value : '';
    },
    serialize: value => ({ [config.path]: value }),
    filter: {
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
          [config.path]: {
            ...(isNot ? { not: filter } : filter),
            mode: config.fieldMeta.shouldUseModeInsensitive ? 'insensitive' : undefined,
          },
        };
      },
      Label({ label, value }) {
        return `${label.toLowerCase()}: "${value}"`;
      },
      types: {
        contains_i: { label: 'Contains', initialValue: '' },
        not_contains_i: { label: 'Does not contain', initialValue: '' },
        is_i: { label: 'Is exactly', initialValue: '' },
        not_i: { label: 'Is not exactly', initialValue: '' },
        starts_with_i: { label: 'Starts with', initialValue: '' },
        not_starts_with_i: { label: 'Does not start with', initialValue: '' },
        ends_with_i: { label: 'Ends with', initialValue: '' },
        not_ends_with_i: { label: 'Does not end with', initialValue: '' },
      },
    },
  };
};
