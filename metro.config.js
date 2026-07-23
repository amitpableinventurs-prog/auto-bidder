const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
<<<<<<< HEAD
const mobileRoot = path.resolve(projectRoot, 'apps/mobile');

// Get the base config from the mobile app root to ensure it picks up correct app.json/package.json
const config = getDefaultConfig(mobileRoot);

// 1. Watch all files within the monorepo.
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
const corePackages = [
  'react',
  'react-dom',
  'react-native',
  'react-native-web',
  'expo',
  '@expo/metro-runtime',
  'react-native-worklets',
  'react-native-reanimated'
];

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Fix for react-native-gesture-handler trying to resolve missing shims in newer RN versions
  if (moduleName === 'react-native/Libraries/Renderer/shims/ReactNative') {
    return context.resolveRequest(
      context,
      path.resolve(projectRoot, 'node_modules/react-native/Libraries/Renderer/shims/ReactFabric'),
      platform
    );
  }

  // For web, let Expo handle react-native -> react-native-web aliasing
  if (platform === 'web' && (moduleName === 'react-native' || moduleName.startsWith('react-native/'))) {
    if (originalResolveRequest && originalResolveRequest !== config.resolver.resolveRequest) {
      return originalResolveRequest(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
  }

  const pkgName = corePackages.find(pkg => moduleName === pkg || moduleName.startsWith(`${pkg}/`));
  if (pkgName) {
    try {
      return context.resolveRequest(
        context,
        path.resolve(projectRoot, 'node_modules', moduleName),
        platform
      );
    } catch (e) {
      // If resolution from root fails, fall back to default
    }
  }

  if (originalResolveRequest && originalResolveRequest !== config.resolver.resolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

// 5. Transformer configuration
config.transformer.babelTransformerPath = require.resolve('./transformer.js');

config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts.push('svg');

config.resolver.blockList = [
  /[/\\]android[/\\]/,
  /[/\\]ios[/\\]/,
  /[/\\]\.cxx[/\\]/,
];

// 6. Ensure ttf and other assets are correctly handled
config.resolver.assetExts.push('ttf');

// 7. Resolution fields for Web and Native
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// 8. Fix for "__reportFatalRemoteError" undefined runtime error
// Disable inlineRequires for the entry files to ensure polyfills run immediately
const originalGetTransformOptions = config.transformer.getTransformOptions;
config.transformer.getTransformOptions = async (...args) => {
  const baseOptions = originalGetTransformOptions ? await originalGetTransformOptions(...args) : {};
  return {
    ...baseOptions,
    transform: {
      ...baseOptions.transform,
      experimentalImportSupport: false,
      inlineRequires: {
        blockList: {
          [path.resolve(projectRoot, 'App.js')]: true,
          [path.resolve(projectRoot, 'polyfill.js')]: true,
          [path.resolve(projectRoot, 'worklets-bootstrap.js')]: true,
          [path.resolve(mobileRoot, 'App.js')]: true,
          [path.resolve(mobileRoot, 'index.js')]: true,
        },
      },
    },
  };
};

=======
const workspaceRoot = __dirname;

const config = getDefaultConfig(projectRoot);

// Exclude native build folders from the watcher to prevent ENOENT errors
config.resolver.blacklistRE = /android\/.*/;
config.resolver.blockList = [
  /.*\/android\/.*/,
  /.*\/ios\/.*/,
  /.*\/\.gradle\/.*/,
  /.*\/node_modules\/.*\/android\/.*/,
];

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Handle web-specific resolution issues
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    // Specifically target the modules that cause failures on web when imported as internals
    // Stripe incorrectly imports these from 'react-native/Libraries/...'
    if (
      moduleName.includes('codegenNativeComponent') ||
      moduleName.includes('codegenNativeCommands') ||
      moduleName.includes('Libraries/Components/TextInput/TextInputState')
    ) {
      return {
        type: 'sourceFile',
        filePath: path.resolve(__dirname, 'scripts/mock.js'),
      };
    }

    // Only mock Platform if it's explicitly looking for the internal native version
    if (moduleName.endsWith('Libraries/Utilities/Platform')) {
       return {
        type: 'sourceFile',
        filePath: path.resolve(__dirname, 'scripts/platform-mock.js'),
      };
    }

    // Ensure 'react-native' maps to 'react-native-web'
    if (moduleName === 'react-native') {
      return context.resolveRequest(context, 'react-native-web', platform);
    }
  }

  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

>>>>>>> 2ce57fb (Update project)
module.exports = config;
