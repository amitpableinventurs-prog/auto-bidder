// Metro config for monorepo: anchors the project root to apps/mobile so the
// entry (./index.js) and babel.config.js resolve here, while still resolving
// hoisted dependencies from the monorepo root node_modules.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the monorepo root so shared files/packages are picked up.
config.watchFolders = [monorepoRoot];

// Resolve modules from the app first, then the hoisted root node_modules.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

module.exports = config;
