const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const mobileRoot = path.resolve(projectRoot, 'apps/mobile');

const config = getDefaultConfig(projectRoot);

// Monorepo folders
config.watchFolders = [projectRoot, mobileRoot];

// Use root node_modules only.
// Expo/Metro should resolve dependencies consistently from the workspace root.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

// SVG
config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => ext !== 'svg'
);

config.resolver.sourceExts.push('svg');

// Fonts/assets
if (!config.resolver.assetExts.includes('ttf')) {
  config.resolver.assetExts.push('ttf');
}

// Native-first resolution
config.resolver.resolverMainFields = [
  'react-native',
  'browser',
  'main',
];

// Prevent native build folders from being scanned
config.resolver.blockList = [
  /[/\\]\.cxx[/\\]/,
];

module.exports = config;