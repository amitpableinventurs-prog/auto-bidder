const fs = require('fs');
const path = require('path');

const modules = [
  'node_modules/react-native-screens/src/fabric',
  'node_modules/@stripe/stripe-react-native/src/specs',
  'node_modules/@stripe/stripe-react-native/lib/module/specs'
];

function patch(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      patch(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // 1. Fix WithDefault usages (Aggressive - ONLY FOR JS)
      if (file.endsWith('.js') && content.includes('WithDefault')) {
        content = content.replace(/CT\.WithDefault<(.*?),.*?>/g, '$1');
        content = content.replace(/WithDefault<(.*?),.*?>/g, '$1');
        changed = true;
      }

      // 2. Map tricky codegen types to 'number'
      // FOR JS/TSX files, we want 'number' for Web compatibility.
      // FOR TS files in specs directory, we MUST keep Int32/Float/Double for Android/iOS codegen.
      const isSpecFile = (fullPath.includes('specs') || fullPath.includes('fabric')) && fullPath.endsWith('.ts');

      if (!isSpecFile && /Float|Int32|Double/.test(content)) {
        content = content.replace(/CT\.Float/g, 'number');
        content = content.replace(/CT\.Int32/g, 'number');
        content = content.replace(/CT\.Double/g, 'number');
        content = content.replace(/Float/g, 'number');
        content = content.replace(/Int32/g, 'number');
        content = content.replace(/Double/g, 'number');
        changed = true;
      }

      // 2b. RESTORE codegen types for TS specs if they were corrupted
      if (isSpecFile && (content.includes('CodegenTypes') || content.includes('codegenNativeComponent'))) {
        let specChanged = false;
        if (content.includes('number,') || content.includes(', number')) {
          console.log(`Restoring codegen imports in ${file}`);
          content = content.replace(/number,\n/g, 'Int32,\n  Float,\n  Double,\n');
          content = content.replace(/number,/g, 'Int32, Float, Double,');
          content = content.replace(/, number/g, ', Int32, Float, Double');
          specChanged = true;
        }

        // Prop restoration (Heuristics based on Stripe source)
        if (/:\s*number|ReadonlyArray<number>/.test(content)) {
          console.log(`Restoring numeric props in ${file}`);
          content = content.replace(/type\??: number/g, (m) => m.replace('number', 'Int32'));
          content = content.replace(/appearance: number/g, 'appearance: Int32');
          content = content.replace(/borderRadius\??: number/g, (m) => m.replace('number', 'Float'));
          content = content.replace(/buttonStyle: number/g, 'buttonStyle: Int32');
          content = content.replace(/buttonBorderRadius\??: number/g, (m) => m.replace('number', 'Float'));
          content = content.replace(/ReadonlyArray<number>/g, 'ReadonlyArray<Int32>');
          content = content.replace(/preferredNetworks\??: number\[\]/g, 'preferredNetworks?: ReadonlyArray<Int32>');
          specChanged = true;
        }

        // 2c. RESTORE WithDefault for react-native-screens enums
        if (fullPath.includes('react-native-screens')) {
          console.log(`Restoring WithDefault enums in ${file}`);
          content = content.replace(/type\??: HeaderSubviewTypes/g, 'type?: CT.WithDefault<HeaderSubviewTypes, \'left\'>');
          content = content.replace(/direction\??: DirectionType/g, 'direction?: CT.WithDefault<DirectionType, \'ltr\'>');
          content = content.replace(/backButtonDisplayMode\??: BackButtonDisplayMode/g, 'backButtonDisplayMode?: CT.WithDefault<BackButtonDisplayMode, \'default\'>');
          content = content.replace(/blurEffect\??: BlurEffect/g, 'blurEffect?: CT.WithDefault<BlurEffect, \'none\'>');
          content = content.replace(/userInterfaceStyle\??: UserInterfaceStyle/g, 'userInterfaceStyle?: CT.WithDefault<UserInterfaceStyle, \'unspecified\'>');
          content = content.replace(/autoCapitalize\??: AutoCapitalizeType/g, 'autoCapitalize?: CT.WithDefault<AutoCapitalizeType, \'none\'>');
          content = content.replace(/placement\??: SearchBarPlacement/g, 'placement?: CT.WithDefault<SearchBarPlacement, \'stacked\'>');
          content = content.replace(/obscureBackground\??: OptionalBoolean/g, 'obscureBackground?: CT.WithDefault<OptionalBoolean, \'undefined\'>');
          content = content.replace(/hideNavigationBar\??: OptionalBoolean/g, 'hideNavigationBar?: CT.WithDefault<OptionalBoolean, \'undefined\'>');

          specChanged = true;
        }

        if (specChanged) {
            changed = true;
        }
      }

      // 3. Fix Boolean
      if (content.includes('CT.Boolean')) {
        content = content.replace(/CT\.Boolean/g, 'boolean');
        changed = true;
      }

      // 4. Fix Events
      if (content.includes('EventHandler')) {
        content = content.replace(/CT\.DirectEventHandler/g, 'DirectEventHandler');
        content = content.replace(/CT\.BubblingEventHandler/g, 'BubblingEventHandler');
        changed = true;
      }

      // 5. WEB COMPATIBILITY: Remove deep react-native internal imports
      const newMock = '({ get: () => null, dispatchCommand: () => {}, ConditionallyIgnoredEventHandlers: (e) => e, codegenNativeCommands: (o) => ({}), codegenNativeComponent: (n) => ((props) => null), NativeComponentRegistry: { get: () => null } })';
      const oldMock = '({ dispatchCommand: () => {}, ConditionallyIgnoredEventHandlers: (e) => e, codegenNativeCommands: (o) => ({}), codegenNativeComponent: (n) => ((props) => null), NativeComponentRegistry: { get: () => null } })';

      if (content.includes('react-native/Libraries/') || content.includes(oldMock)) {
        console.log(`Patching deep internal imports in ${file}`);
        // Replace deep requires with a dummy mock
        content = content.replace(/require\(['"]react-native\/Libraries\/.*?['"]\)/g, newMock);
        // Also replace old mock if it exists
        content = content.split(oldMock).join(newMock);

        // Handle ES6 imports if present (unlikely in lib/module but good to have)
        content = content.replace(/import .*? from ['"]react-native\/Libraries\/.*?['"];/g, '/* Removed native-only import */');
        changed = true;
      }

      // 6. Stripe specific fixes (TS)
      if (fullPath.includes('NativeCardForm.ts') && content.includes('focusedField')) {
         content = content.replace(/focusedField: 'CardNumber' \| 'Cvc' \| 'ExpiryDate' \| 'PostalCode' \| null;/g, 'focusedField: string | null;');
         changed = true;
      }

      // 7. WEB COMPATIBILITY: Mock TurboModuleRegistry in compiled JS
      const proxyMock = 'new Proxy({ getConstants: () => ({ API_VERSIONS: { CORE: "1", ISSUING: "1" }, SYSTEM_INFO: { sdkVersion: "1", osVersion: "1", deviceType: "1", appName: "1", appVersion: "1", isNewArchitecture: false, reactNativeVersion: "1" } }) }, { get: (t, p) => { if (p in t) return t[p]; return () => Promise.resolve({}); } })';

      if (file.endsWith('.js')) {
        if (content.includes('TurboModuleRegistry')) {
             console.log(`Patching TurboModuleRegistry in ${file}`);
             content = content.replace(/[\w_]+\.TurboModuleRegistry\.(get|getEnforcing)\(.*?\)/g, proxyMock);
             changed = true;
        } else if (content.includes('exports.default=({});') || (file.includes('NativeStripeSdkModule') && content.includes('new Proxy'))) {
             // Only patch if it's the old corrupted/minimal mock
             if (content.includes('exports.default=({});') || (content.includes('new Proxy({},') && !content.includes('getConstants'))) {
                 console.log(`Updating/Fixing mock in ${file}`);
                 content = content.replace(/exports\.default=new Proxy\(.*?\);/g, `exports.default=${proxyMock};`);
                 content = content.replace(/exports\.default=\(\{\}\)/g, `exports.default=${proxyMock}`);
                 changed = true;
             }
        }
      }

      if (changed) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

modules.forEach(patch);
console.log('All modules patched for codegen and web compatibility');
