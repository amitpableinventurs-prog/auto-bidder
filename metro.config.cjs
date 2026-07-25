const { getDefaultConfig } = require('expo/metro-config');
const { getBundleModeMetroConfig } = require('react-native-worklets/bundleMode');
const path = require('path');

const projectRoot = __dirname;
const mobileRoot = path.resolve(projectRoot, 'apps/mobile');

let config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [projectRoot, mobileRoot];

// 2. Let Metro know where to resolve packages
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(mobileRoot, 'node_modules'),
];

// 3. Explicitly map packages that might fail to resolve in a monorepo
config.resolver.extraNodeModules = {
  'expo-camera': path.resolve(projectRoot, 'node_modules/expo-camera'),
  'react': path.resolve(projectRoot, 'node_modules/react'),
  'react-dom': path.resolve(projectRoot, 'node_modules/react-dom'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
  'expo-font': path.resolve(projectRoot, 'node_modules/expo-font'),
  'expo-asset': path.resolve(projectRoot, 'node_modules/expo-asset'),
};

// 4. Force Metro to resolve React and other core packages from the root node_modules
// to avoid "Invalid hook call" errors caused by multiple instances of React.
const corePackages = ['react', 'react-dom', 'react-native', 'react-native-web', 'expo', '@expo/metro-runtime'];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // For web, let Expo handle react-native -> react-native-web aliasing
  if (platform === 'web' && (moduleName === 'react-native' || moduleName.startsWith('react-native/'))) {
    return context.resolveRequest(context, moduleName, platform);
  }

  const pkgName = corePackages.find(pkg => moduleName === pkg || moduleName.startsWith(`${pkg}/`));
  if (pkgName) {
    return context.resolveRequest(
      context,
      path.resolve(projectRoot, 'node_modules', moduleName),
      platform
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

config.resolver.blockList = [
  /[/\\]android[/\\]/,
  /[/\\]ios[/\\]/,
  /[/\\]\.cxx[/\\]/,
];

// 5. Ensure ttf and other assets are correctly handled
config.resolver.assetExts.push('ttf');

// 6. Resolution fields for Web and Native
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Only apply bundleMode for native platforms, as it might break web bundling
const isWeb = process.argv.includes('--web') || process.env.EXPO_BUNDLER_PLATFORM === 'web';
module.exports = isWeb ? config : getBundleModeMetroConfig(config);
