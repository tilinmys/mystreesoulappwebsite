// scripts/postprocess.js
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../dist/index.html');

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace standard script tag with type="module" script tag
  content = content.replace(/<script src=/g, '<script type="module" src=');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('[POST-PROCESS] Successfully injected type="module" into dist/index.html');
} else {
  console.error('[POST-PROCESS] dist/index.html not found!');
}
