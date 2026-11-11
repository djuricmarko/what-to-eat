// Expo auto-detects the pnpm monorepo (watchFolders / nodeModulesPaths). Two additions so
// Metro consumes workspace packages (@wte/shared) from TypeScript source, like Vite and tsx do:
const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const packagesDir = path.resolve(__dirname, '../../packages') + path.sep;

// 1. Pick the "@wte/source" export condition (points at src/index.ts).
config.resolver.unstable_conditionNames = [
  '@wte/source',
  ...(config.resolver.unstable_conditionNames ?? ['require', 'import']),
];

// 2. Workspace sources use NodeNext-style "./file.js" specifiers for .ts files; Metro
//    doesn't remap those, so retry without the extension.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('.') && moduleName.endsWith('.js') && context.originModulePath.startsWith(packagesDir)) {
    try {
      return context.resolveRequest(context, moduleName.slice(0, -3), platform);
    } catch {
      // fall through to the default resolution
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
