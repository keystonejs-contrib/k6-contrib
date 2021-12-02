/** @jsxRuntime classic */
/** @jsx jsx */
import copy from 'copy-to-clipboard';
import { Tooltip } from '@keystone-ui/tooltip';
import { useState } from 'react';
import { ClipboardIcon } from '@keystone-ui/icons/icons/ClipboardIcon';
import { EyeIcon } from '@keystone-ui/icons/icons/EyeIcon';
import { PlusIcon } from '@keystone-ui/icons/icons/PlusIcon';
import { MinusIcon } from '@keystone-ui/icons/icons/MinusIcon';
import { EyeOffIcon } from '@keystone-ui/icons/icons/EyeOffIcon';
import { Button } from '@keystone-ui/button';

import { Box, jsx, Stack } from '@keystone-ui/core';
import { FieldContainer, FieldLabel, TextArea, TextInput } from '@keystone-ui/fields';
import {
  CardValueComponent,
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '@keystone-6/core/types';
import { CellContainer, CellLink } from '@keystone-6/core/admin-ui/components';

export const Field = ({ field, value, onChange, autoFocus }: FieldProps<typeof controller>) => {
  const [reveal, setReveal] = useState(false);
  const [expand, setExpand] = useState(field.displayMode === 'textarea');
  return (
    <FieldContainer>
      <FieldLabel htmlFor={field.path}>
        <Stack
          css={{
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <Box> {field.label}</Box>
          <Tooltip content="Copy ID">
            {props => (
              <Box css={{ cursor: 'pointer' }} onClick={() => setExpand(!expand)}>
                {expand ? <MinusIcon size="small" /> : <PlusIcon size="small" />}
              </Box>
            )}
          </Tooltip>
        </Stack>
      </FieldLabel>
      <Stack
        css={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          '& :first-child': { flex: '1 1 auto' },
        }}
      >
        {onChange ? (
          expand ? (
            <TextArea
              id={field.path}
              autoFocus={autoFocus}
              onChange={event => onChange(event.target.value)}
              value={value}
            />
          ) : (
            <TextInput
              id={field.path}
              type={reveal ? 'text' : 'password'}
              autoFocus={autoFocus}
              onChange={event => onChange(event.target.value)}
              value={value}
            />
          )
        ) : (
          value
        )}
        {!expand ? (
          <Tooltip content="Copy ID">
            {props => (
              <Stack css={{ display: 'flex', flexDirection: 'row' }}>
                <Button
                  {...props}
                  aria-label="Copy ID"
                  onClick={() => {
                    setReveal(!reveal);
                  }}
                >
                  {reveal ? <EyeOffIcon size="small" /> : <EyeIcon size="small" />}
                </Button>
                <Button
                  {...props}
                  aria-label="Copy ID"
                  onClick={() => {
                    copy(value);
                  }}
                >
                  <ClipboardIcon size="small" />
                </Button>
              </Stack>
            )}
          </Tooltip>
        ) : null}
      </Stack>
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
            mode: config.fieldMeta.shouldUseModeInsensitive ? 'insensitive' : undefined,
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
