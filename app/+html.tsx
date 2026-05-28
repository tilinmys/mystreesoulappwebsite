import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta 
          name="viewport" 
          content="width=390, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" 
        />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{
          __html: `
            html, body, #root {
              max-width: 390px !important;
              min-height: 100dvh;
              margin: 0 auto;
              overflow-x: hidden;
              background: #000;
            }
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
