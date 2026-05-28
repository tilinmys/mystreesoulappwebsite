// scripts/postprocess.js
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../dist/index.html');

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace standard script tag with type="module" script tag
  content = content.replace(/<script src=/g, '<script type="module" src=');

  const shellCss = `
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

            body > * {
              max-width: 390px !important;
              overflow-x: hidden !important;
            }

            [role="dialog"],
            [aria-modal="true"] {
              max-width: 390px !important;
              left: auto !important;
              right: auto !important;
            }
  `;

  content = content.replace(
    /<meta name="viewport" content="[^"]*" \/>/,
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />'
  );

  if (!content.includes('id="mystree-mobile-shell"')) {
    content = content.replace(
      '</head>',
      `    <style id="mystree-mobile-shell">${shellCss}</style>\n  </head>`
    );
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('[POST-PROCESS] Successfully injected mobile shell and type="module" into dist/index.html');
} else {
  console.error('[POST-PROCESS] dist/index.html not found!');
}
