const fs = require('fs');
const path = require('path');

const modules = [
  'node_modules/react-native-screens/src/fabric',
  'node_modules/@stripe/stripe-react-native/src/specs'
];

function patch(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      patch(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');

      // 1. Fix WithDefault usages (Aggressive)
      content = content.replace(/CT\.WithDefault<(.*?),.*?>/g, '$1');
      content = content.replace(/WithDefault<(.*?),.*?>/g, '$1');

      // 2. Map tricky codegen types to 'number' (we patched codegen to allow this)
      content = content.replace(/CT\.Float/g, 'number');
      content = content.replace(/CT\.Int32/g, 'number');
      content = content.replace(/CT\.Double/g, 'number');
      content = content.replace(/Float/g, 'number');
      content = content.replace(/Int32/g, 'number');
      content = content.replace(/Double/g, 'number');

      // 3. Fix Boolean
      content = content.replace(/CT\.Boolean/g, 'boolean');

      // 4. Fix Events
      content = content.replace(/CT\.DirectEventHandler/g, 'DirectEventHandler');
      content = content.replace(/CT\.BubblingEventHandler/g, 'BubblingEventHandler');

      // 5. Stripe specific fixes
      if (fullPath.includes('NativeCardForm.ts')) {
         content = content.replace(/focusedField: 'CardNumber' \| 'Cvc' \| 'ExpiryDate' \| 'PostalCode' \| null;/g, 'focusedField: string | null;');
      }

      fs.writeFileSync(fullPath, content);
    }
  }
}

modules.forEach(patch);
console.log('All modules patched for codegen compatibility with number type');
