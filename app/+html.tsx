import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{
          __html: `
            * { box-sizing: border-box; }
            html { background: #000; }
            body {
              max-width: 390px !important;
              min-height: 100dvh;
              margin: 0 auto !important;
              overflow-x: hidden;
              background: #fff;
            }
            #root {
              max-width: 390px !important;
              overflow-x: hidden;
            }
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
