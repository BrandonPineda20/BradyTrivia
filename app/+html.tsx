import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

// Global font stack for the web build.
// Impact is a system font on every browser — no download needed.
// Bebas Neue is loaded via expo-font in _layout.tsx.
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
  * { box-sizing: border-box; }
  body, [data-testid], div, span, p, h1, h2, h3, h4, h5, h6, button, input, textarea {
    font-family: 'Impact', 'Arial Narrow', sans-serif;
  }
`;

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
