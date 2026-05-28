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
            *, *::before, *::after { box-sizing: border-box; }

            html {
              background: #1a1a1a;
              height: 100%;
            }

            body {
              width: 390px !important;
              max-width: 390px !important;
              min-height: 100dvh;
              margin: 0 auto !important;
              overflow-x: hidden !important;
              overflow-y: auto;
              position: relative;
              background: #ffffff;
              box-shadow:
                -1px 0 0 #333,
                1px 0 0 #333,
                0 0 40px rgba(0,0,0,0.6);
            }

            #root {
              width: 390px !important;
              max-width: 390px !important;
              min-height: 100dvh;
              overflow-x: hidden !important;
              position: relative;
            }

            /* CRITICAL: Stop ALL fixed/absolute elements from escaping */
            body > * {
              max-width: 390px !important;
              overflow-x: hidden !important;
            }

            /* Force modals and overlays to stay inside shell */
            [role="dialog"],
            [aria-modal="true"] {
              max-width: 390px !important;
              left: auto !important;
              right: auto !important;
            }
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
