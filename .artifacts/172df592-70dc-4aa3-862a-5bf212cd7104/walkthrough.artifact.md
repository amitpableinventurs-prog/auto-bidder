# Fixed Duplicate Babel Plugins

I have removed the redundant `react-native-reanimated/plugin` from the project's Babel configurations.

## Changes Made

### Babel Configuration

I updated the Babel configurations to disable automatic plugin detection in `babel-preset-expo`. This ensures our manual configuration (with `bundleMode: true`) is the only instance used.

Modified files:
- [babel.config.js](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/babel.config.js)
- [apps/mobile/babel.config.js](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/babel.config.js)

```diff
-    presets: ['babel-preset-expo'],
+    presets: [
+      ['babel-preset-expo', { worklets: false, reanimated: false }],
+    ],
     plugins: [
       ['react-native-worklets/plugin', { bundleMode: true }],
     ],
```

## Next Steps

> [!IMPORTANT]
> To apply these changes and fix the Metro Bundler error, you must clear the Babel cache.

Please run the following command in your terminal:

```powershell
npx expo start --clear
```

This will force Metro to rebuild the bundle with the updated configuration.
