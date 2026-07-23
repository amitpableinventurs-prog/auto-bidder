# Fix Worklets, Gesture Handler, and Update App Icon

This plan addresses four issues:
1. **Worklets Version Mismatch**: A runtime error caused by the JavaScript part of `react-native-worklets` (0.8.3) not matching the native part (0.10.0).
2. **Gesture Handler Resolution Error**: `Unable to resolve "react-native/Libraries/Renderer/shims/ReactNative"` caused by `react-native-gesture-handler` 2.31.1 being incompatible with `react-native` 0.85.3.
3. **Invalid Project Root Error**: A startup failure where port arguments are incorrectly interpreted as paths due to improper script configuration in a monorepo setup.
4. **App Icon Update**: Update the mobile app icon with the new design provided.

## Proposed Changes

### Root Dependencies

Update Reanimated and Worklets to matching versions that align with the native build.

#### [package.json](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/package.json)

- Update `react-native-reanimated` to `4.5.1`.
- Update `react-native-worklets` to `0.10.0`.
- Fix `dev:mobile` script to properly pass extra arguments (like `--port`) to the workspace.

```diff
   "dependencies": {
     "cross-env": "^7.0.3",
     "react": "19.2.3",
     "react-native": "0.85.3",
-    "react-native-reanimated": "4.3.1",
-    "react-native-worklets": "0.8.3",
+    "react-native-reanimated": "4.5.1",
+    "react-native-worklets": "0.10.0",
     "expo": "~57.0.0"
   },
```

```diff
   "scripts": {
     "dev": "concurrently \"npm run dev:api\" \"npm run dev:mobile\"",
     "dev:api": "npm run dev -w @autobidder/api",
-    "dev:mobile": "cross-env NODE_OPTIONS=--openssl-legacy-provider npm run start -w @autobidder/mobile",
+    "dev:mobile": "cross-env NODE_OPTIONS=--openssl-legacy-provider npm start -w @autobidder/mobile --",
```

---

### Mobile App Dependencies and Assets

#### [package.json](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/package.json)

- Update `react-native-gesture-handler` to `~2.32.0` to fix the resolution error with `react-native` 0.85.3.

```diff
     "react-native-chart-kit": "^6.12.0",
     "react-native-drawer-layout": "^4.2.5",
-    "react-native-gesture-handler": "~2.31.1",
+    "react-native-gesture-handler": "~2.32.0",
     "react-native-maps": "1.27.2",
```

#### [icon.png](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/assets/icon.png)

- Replace the existing app icon with the new image provided by the user.

---

## Verification Plan

### Automated Tests
- Run `npm install` to update dependencies.
- Run `npm run dev:mobile -- --clear --port 8092` to verify the startup command works.

### Manual Verification
- Verify that the app starts without the "Mismatch between JavaScript part and native part of Worklets" error.
- Verify that the Metro bundler starts without the "Unable to resolve ReactNative shim" error.
- Verify that the app icon is updated on the device home screen.
- Verify that the app opens on the device/emulator successfully.
