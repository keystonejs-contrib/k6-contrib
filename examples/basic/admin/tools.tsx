/** @jsxRuntime classic */
/** @jsx jsx */

import Quote from '@editorjs/quote';

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
};
