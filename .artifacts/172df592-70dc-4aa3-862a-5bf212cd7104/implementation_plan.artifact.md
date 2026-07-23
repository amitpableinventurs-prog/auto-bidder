# Fix Duplicate Babel Plugins (Part 2)

The previous fix removed the explicit `react-native-reanimated/plugin` from `babel.config.js`, but the error persists. My research shows that `babel-preset-expo` automatically detects and adds both `react-native-worklets/plugin` and `react-native-reanimated/plugin` if the packages are installed.

Since both packages now use the same plugin file, and we are also adding it manually to enable `bundleMode: true`, Babel sees multiple instances of the same plugin.

## Proposed Changes

### Babel Configuration

I will update the `babel-preset-expo` configuration to disable its automatic inclusion of Worklets and Reanimated plugins. This allows our manual declaration (with the required options) to be the only instance.

#### [MODIFY] [babel.config.js](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/babel.config.js)
#### [MODIFY] [babel.config.js](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/babel.config.js)

```javascript
// Change
presets: ['babel-preset-expo'],

// To
presets: [
  ['babel-preset-expo', { worklets: false, reanimated: false }]
],
```

## Verification Plan

### Manual Verification
1. Ask the user to run `npx expo start --clear`.
2. Confirm that the "Duplicate plugin/preset detected" error is resolved.
3. Confirm that the subsequent `TypeError` (resulting from failed transformer initialization) is also resolved.
