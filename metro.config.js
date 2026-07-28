const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
console.log('METRO CONFIG: __dirname =', __dirname);
console.log('METRO CONFIG: projectRoot =', projectRoot);
const mobileRoot = path.resolve(projectRoot, 'apps/mobile');

const config = getDefaultConfig(path.resolve(projectRoot));

// Watch monorepo folders
config.watchFolders = [
  projectRoot,
  mobileRoot,
];

// Resolve node_modules from root + mobile
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(mobileRoot, 'node_modules'),
];

// Force core packages from root
config.resolver.extraNodeModules = {
  react: path.resolve(projectRoot, 'node_modules/react'),
  'react-dom': path.resolve(projectRoot, 'node_modules/react-dom'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
  expo: path.resolve(projectRoot, 'node_modules/expo'),
};

// Asset support
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'ttf',
];

// SVG support
config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => ext !== 'svg'
);

config.resolver.sourceExts.push('svg');

// Resolution order
config.resolver.resolverMainFields = [
  'react-native',
  'browser',
  'main',
];

// Avoid native folders scanning conflicts
config.resolver.blockList = [
  /[/\\]\.cxx[/\\]/,
];

module.exports = config;
