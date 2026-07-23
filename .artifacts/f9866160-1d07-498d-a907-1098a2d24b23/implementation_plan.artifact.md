# Solve @babel/runtime resolution error

The project is a monorepo using Expo. The mobile app (`apps/mobile`) is failing to resolve `@babel/runtime/helpers/interopRequireDefault`, which is required by Babel-transformed files (like `expo-status-bar`).

Although `@babel/runtime` is present in the root `node_modules`, Metro is unable to find it when bundling from `apps/mobile`, likely due to how hoisting and the custom `metro.config.js` are interacting.

## Proposed Changes

### [Component Name] Metro Configuration

#### [MODIFY] [metro.config.js](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/metro.config.js)
Update `corePackages` to include `@babel/runtime`. This will force Metro to resolve this package from the root `node_modules`, bypassing any search path issues in the monorepo structure.

## Verification Plan

### Automated Tests
- I cannot easily run the full Expo bundler, but I can check if the configuration is valid.
- The user should restart their Expo server with `--clear` to verify the fix.

### Manual Verification
- Ask the user to run `npm run start:clear` from the root.
