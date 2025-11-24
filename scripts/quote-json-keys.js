// Utility script: Wrap all unquoted parameter names (object keys) with double quotes
// Usage: node scripts/quote-json-keys.js

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'wormhole-config.json');

let text = fs.readFileSync(filePath, 'utf8');

// Replace unquoted keys at start of line up to colon with quoted keys.
// It intentionally ignores keys already quoted.
text = text.replace(/^(\s*)(?!\")(\w[\w-]*)(\s*):/gm, '$1"$2"$3:');

fs.writeFileSync(filePath, text, 'utf8');
console.log(
  'Wrapped all unquoted parameter names with double quotes in wormhole-config.json',
);
