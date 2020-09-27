const simpleListConfig = () => ({ fields = {}, ...rest }) => {
  for (const key in fields) {
    if (fields.hasOwnProperty(key)) {
      const field = fields[key];
      if (typeof field.required === 'boolean') {
        field.isRequired = field.required;
        delete field.required;
      }
      if (typeof field.indexed === 'boolean') {
        field.isIndexed = field.indexed;
        delete field.indexed;
      }
      if (typeof field.readonly === 'boolean') {
        field.adminConfig = { ...field.adminConfig, isReadOnly: field.readonly };
        delete field.readonly;
      }
      if (typeof field.unique === 'boolean') {
        field.isUnique = field.unique;
        delete field.unique;
      }
      if (typeof field.multiline === 'boolean') {
        field.isMultiline = field.multiline;
        delete field.multiline;
      }
      if (typeof field.default !== 'undefined') {
        field.defaultValue = field.default;
        delete field.default;
      }
    }
  }

  return {
    fields,
    ...rest,
  };
};

module.exports = { simpleListConfig };
