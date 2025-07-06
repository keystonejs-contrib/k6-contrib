import React from 'react';
import Quote from '@editorjs/quote';
import Table from '@editorjs/table'
import DragDrop from "editorjs-drag-drop";

export const tools = {
  quote: {
    class: Quote,
    inlineToolbar: true,
    shortcut: 'CMD+SHIFT+O',
    config: {
      quotePlaceholder: 'Enter a quote',
      captionPlaceholder: "Quote's author",
    },
  },
  table: {
    class: Table,
    inlineToolbar: true,
    config: {
      rows: 2,
      cols: 2,
    },
  },
};
