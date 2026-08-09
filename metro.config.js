const { getDefaultConfig } = require('expo/metro-config');
const { getBundleModeMetroConfig } = require('react-native-worklets/bundleMode');
const path = require('path');

const projectRoot = __dirname;
const mobileRoot = path.resolve(projectRoot, 'apps/mobile');

/** @type {import('expo/metro-config').MetroConfig} */
let config = getDefaultConfig(projectRoot);

// 1. Monorepo folder watching
config.watchFolders = [projectRoot, mobileRoot];

// 2. Resolve dependencies from the workspace root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(mobileRoot, 'node_modules'),
];

// 3. Explicit mapping for core packages to ensure singleton instances
config.resolver.extraNodeModules = {
  'expo-camera': path.resolve(projectRoot, 'node_modules/expo-camera'),
  'react': path.resolve(projectRoot, 'node_modules/react'),
  'react-dom': path.resolve(projectRoot, 'node_modules/react-dom'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
  'expo-font': path.resolve(projectRoot, 'node_modules/expo-font'),
  'expo-asset': path.resolve(projectRoot, 'node_modules/expo-asset'),
};

// 4. SVG handling
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts.push('svg');

// 5. Native internals mocking and core package resolution
const corePackages = ['react', 'react-dom', 'react-native', 'react-native-web', 'expo', '@expo/metro-runtime'];
const webMockPath = path.resolve(projectRoot, 'web-mocks.js');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Mock native-only modules for Web
  if (platform === 'web') {
    const isStripeInternal = context.originModulePath && context.originModulePath.includes('@stripe/stripe-react-native');
    const isSpecImport = moduleName.includes('/specs/') || (isStripeInternal && moduleName.includes('./specs/'));

    if (
      moduleName.startsWith('react-native/Libraries/') ||
      isSpecImport
    ) {
      return {
        filePath: webMockPath,
        type: 'sourceFile',
      };
    }
  }

  // Force resolution of core packages to the root node_modules
  const pkgName = corePackages.find(pkg => moduleName === pkg || moduleName.startsWith(`${pkg}/`));
  if (pkgName) {
    try {
      return context.resolveRequest(
        context,
        path.resolve(projectRoot, 'node_modules', moduleName),
        platform
      );
    } catch (e) {
      // Fallback to default resolution if root resolution fails
    }
  }

  return context.resolveRequest(context, moduleName, platform);
};

// 6. Block native build artifacts from scanning
config.resolver.blockList = [
  /[/\\]android[/\\]/,
  /[/\\]ios[/\\]/,
  /[/\\]\.cxx[/\\]/,
];

// 7. Ensure font support
if (!config.resolver.assetExts.includes('ttf')) {
  config.resolver.assetExts.push('ttf');
}

// 8. Platform-aware resolution fields
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// 9. Integration with React Native Worklets (Native only)
const isWeb = process.argv.includes('--web') || process.env.EXPO_BUNDLER_PLATFORM === 'web';

module.exports = isWeb ? config : getBundleModeMetroConfig(config);
