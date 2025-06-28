import { useMemo, useState } from 'react';
import { TextField } from '@keystar/ui/text-field';
import { type FieldProps as FT1, FieldPrimitive } from '@keystar/ui/field';
import { HStack, VStack } from '@keystar/ui/layout';
import { css, tokenSchema } from '@keystar/ui/style';
import { ActionGroup, Item } from '@keystar/ui/action-group';
import { Picker } from '@keystar/ui/picker';
import { FieldProps } from '@keystone-6/core/types';
import { NullableFieldWrapper } from '@keystone-6/core/admin-ui/components';

import { WeightValue } from './index';

export function Field({
  autoFocus,
  field,
  value,
  forceValidation,
  isRequired,
  onChange,
}: FieldProps<typeof import('./index').controller>) {
  const [preNullValue, setPreNullValue] = useState(value);
  const errorMessage = createErrorMessage(value);
  const error = forceValidation && errorMessage ? errorMessage : undefined;
  const handleChange = (path: string, data: string | undefined) => {
    let updatedValue = { ...value, [path]: data } as WeightValue;
    //return null if all values are cleared
    if (!updatedValue?.unit && isNaN(parseFloat(updatedValue?.value as string))) {
      updatedValue = null;
    }
    onChange?.(updatedValue);
  };
  const longestLabelLength = useMemo(() => {
    return field.units.reduce((a, item) => Math.max(a, item.label.length), 0);
  }, [field.units]);
  const isNullable = !isRequired;
  const isNull = isNullable && value === null;
  const isReadOnly = onChange == null;
  const onNullChange = (isChecked: boolean) => {
    if (!onChange) return;
    if (isChecked) {
      setPreNullValue(value);
      onChange(null);
    } else {
      onChange(preNullValue ?? { unit: field.defaultUnit ?? '', value: '' });
    }
  };
  return (
    <NullableFieldWrapper
      isAllowed={onchange !== undefined}
      autoFocus={isNull && autoFocus}
      label={field.label}
      isReadOnly={isReadOnly}
      isNull={isNull}
      onChange={onNullChange}
    >
      <FieldPrimitive label={field.label} description={field.description} errorMessage={error}>
        <VStack gap="xsmall">
          {field.displayMode === 'segmented-control' && (
            <ActionGroup
              density="compact"
              disallowEmptySelection
              isDisabled={isNull}
              overflowMode="collapse"
              selectionMode="single"
              items={field.units}
              onSelectionChange={selection => {
                if (selection === 'all') return;
                const next = selection.values().next().value;
                if (!next) return;
                handleChange('unit', next as string);
              }}
              selectedKeys={value?.unit ? [value.unit] : []}
            >
              {item => <Item key={item.value}>{item.label}</Item>}
            </ActionGroup>
          )}
          <HStack
            gap="small"
            className={css({ width: '100%', justifyContent: 'stretch', '&>div': { flex: '1' } })}
          >
            {field.displayMode === 'select' && (
              <Picker
                isDisabled={isNull}
                isReadOnly={isReadOnly}
                isRequired={isRequired}
                items={field.units}
                onSelectionChange={value => handleChange('unit', value as string)}
                selectedKey={value?.unit}
                flex={{ mobile: true, desktop: 'initial' }}
                UNSAFE_style={{
                  fontSize: tokenSchema.typography.text.regular.size,
                  width: `clamp(${tokenSchema.size.alias.singleLineWidth}, calc(${longestLabelLength}ex + ${tokenSchema.size.icon.regular}), 100%)`,
                }}
              >
                {item => <Item key={item.value}>{item.label}</Item>}
              </Picker>
            )}
            <TextField
              id={`${field.path}--value`}
              autoFocus={autoFocus}
              isDisabled={isNull}
              isReadOnly={isReadOnly}
              isRequired={isRequired}
              placeholder="Weight Value"
              onChange={value => handleChange('value', value.replace(/[^\d\.,\s-]/g, ''))}
              value={value?.value || ''}
              UNSAFE_style={{ width: '100%' }}
            />
          </HStack>
        </VStack>
      </FieldPrimitive>
    </NullableFieldWrapper>
  );
}

function createErrorMessage(value: WeightValue) {
  return validateWeight(value);
}

export function validateWeight(data: WeightValue): string | undefined {
  if (data) {
    const { unit, value } = data;
    if (!unit && isNaN(parseFloat(value))) return undefined;
    if (!unit || !value || parseFloat(value) < 0) return 'Invalid weight or unit';
  }
}
