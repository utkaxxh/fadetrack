import type { ChatKitOptions } from "@openai/chatkit";

// Note: The API urls below point to our Next.js API routes. The session endpoint
// will mint a client secret server-side and ensure the Workflow ID is used.
export const chatkitOptions: ChatKitOptions = {
  api: {
    // Your Next.js API integration
    url: "/api/chatkit", // base path; widget will call subpaths
    // The widget will POST to `${url}/session` to obtain a client secret
    // and include auth headers for subsequent calls.
  },
  theme: {
    colorScheme: 'light',
    radius: 'pill',
    density: 'normal',
    typography: {
      baseSize: 16,
      fontFamily: '"OpenAI Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
      fontFamilyMono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace',
      fontSources: [
        {
          family: 'OpenAI Sans',
          src: 'https://cdn.openai.com/common/fonts/openai-sans/v2/OpenAISans-Regular.woff2',
          weight: 400,
          style: 'normal',
          display: 'swap'
        }
        // ...other font sources omitted for brevity
      ]
    }
  },
  composer: {
    placeholder: 'Name a city',
    attachments: {
      enabled: false
    },
    tools: [
      {
        id: 'search_docs',
        label: 'Search docs',
        shortLabel: 'Docs',
        placeholderOverride: 'Search documentation',
        icon: 'book-open',
        pinned: false
      }
      // ...and 1 more tool
    ],
  },
  startScreen: {
    greeting: 'What city are you looking for a MUA?',
    prompts: [
      {
        icon: 'circle-question',
        label: 'What is ChatKit?',
        prompt: 'What is ChatKit?'
      }
      // ...and 4 more prompts
    ],
  },
};

export default chatkitOptions;
