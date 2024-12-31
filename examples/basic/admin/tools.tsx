/** @jsxRuntime classic */
/** @jsx jsx */

import Quote from '@editorjs/quote';
import Table from '@editorjs/table';
import CodeTool from '@editorjs/code';
import ImageTool from '@editorjs/image';
import Warning from '@editorjs/warning';
import Delimiter from '@editorjs/delimiter';
import AttachesTool from '@editorjs/attaches';
import Alert from 'editorjs-alert';
import ToggleBlock from 'editorjs-toggle-block';
import Title from 'title-editorjs';

export const tools = {
  warning: Warning,
  delimiter: Delimiter,
  table: {
    class: Table,
    inlineToolbar: true,
  },
  code: {
    class: CodeTool,
  },
  image: {
    class: ImageTool,
    config: {
      endpoints: {
        byFile: '/api/uploadImage',
      },
    },
  },
  quote: {
    class: Quote,
    inlineToolbar: true,
    config: {
      quotePlaceholder: 'Enter a quote',
      captionPlaceholder: "Quote's author",
    },
  },
  attaches: {
    class: AttachesTool,
    config: {
      endpoint: '/api/uploadFile',
    },
  },
  alert: {
    class: Alert,
    config: {
      defaultType: 'info',
      messagePlaceholder: 'Enter your message',
    },
  },
  toggleBlock: {
    class: ToggleBlock,
    inlineToolbar: true,
  },
  title: {
    class: Title,
    config: {
      placeholder: 'Enter a title',
      levels: [1, 2, 3],
      defaultLevel: 2,
    },
  },
};
