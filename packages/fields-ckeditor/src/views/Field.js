import React from 'react';

import { FieldContainer, FieldLabel } from '@arch-ui/fields';

import CKEditor from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const CKEditorField = ({ onChange, autoFocus, field, errors, value = '', isDisabled }) => {
  const htmlID = `ks-input-${field.path}`;
  const accessError = errors.find(
    error => error instanceof Error && error.name === 'AccessDeniedError'
  );

  if (accessError) return null;

  return (
    <FieldContainer>
      <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
      <div css={{ display: 'flex', flex: 1 }}>
        <CKEditor
          editor={ClassicEditor}
          onChange={(_, editor) => onChange(editor.getData())}
          data={value}
          disabled={isDisabled}
          {...field.config.editorConfig}
          onInit={editor => {
            if (autoFocus) editor.editing.view.focus();
            if (field.config.editorConfig && field.config.editorConfig.onInit)
              field.config.editorConfig.onInit(editor);
          }}
        />
      </div>
    </FieldContainer>
  );
};

export default CKEditorField;
