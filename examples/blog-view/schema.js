const {
  File,
  Text,
  Relationship,
  Select,
  Password,
  Checkbox,
  CalendarDay,
  DateTime,
} = require('@keystonejs/fields');
const { Wysiwyg } = require('@keystonejs/fields-wysiwyg-tinymce');
const { LocalFileAdapter } = require('@keystonejs/file-adapters');
const { getYear } = require('date-fns');

const { staticSrc, staticPath } = require('./config');

const fileAdapter = new LocalFileAdapter({
  src: `${staticSrc}/uploads`,
  path: `${staticPath}/uploads`,
});

const avatarFileAdapter = new LocalFileAdapter({
  src: `${staticSrc}/avatars`,
  path: `${staticPath}/avatars`,
});

exports.User = {
  fields: {
    name: { type: Text },
    email: { type: Text, isUnique: true },
    dob: {
      type: CalendarDay,
      format: 'Do MMMM YYYY',
      yearRangeFrom: 1901,
      yearRangeTo: getYear(new Date()),
    },
    password: { type: Password },
    isAdmin: { type: Checkbox },
    avatar: { type: File, adapter: avatarFileAdapter },
  },
  labelResolver: item => `${item.name} <${item.email}>`,
};

exports.Post = {
  fields: {
    title: { type: Text },
    author: {
      type: Relationship,
      ref: 'User',
    },
    categories: {
      type: Relationship,
      ref: 'PostCategory',
      many: true,
    },
    status: {
      type: Select,
      defaultValue: 'draft',
      options: [{ label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }],
    },
    body: { type: Wysiwyg },
    posted: { type: DateTime, format: 'DD/MM/YYYY' },
    image: { type: File, adapter: fileAdapter },
  },
  adminConfig: {
    defaultPageSize: 20,
    defaultColumns: 'title, status',
    defaultSort: 'title',
  },
  labelResolver: item => item.title,
};

exports.PostCategory = {
  fields: {
    name: { type: Text },
    slug: { type: Text },
  },
};

exports.Comment = {
  fields: {
    body: { type: Text, isMultiline: true },
    originalPost: {
      type: Relationship,
      ref: 'Post',
    },
    author: {
      type: Relationship,
      ref: 'User',
    },
    posted: { type: DateTime },
  },
  labelResolver: item => item.body,
};
