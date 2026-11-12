// Expo auto-detects the pnpm monorepo (watchFolders / nodeModulesPaths). Two additions so
// Metro consumes workspace packages (@wte/shared) from TypeScript source, like Vite and tsx do:
const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const workspacePackagesDir = path.resolve(__dirname, '../../packages') + path.sep;
const defaultConditionNames = config.resolver.unstable_conditionNames ?? ['require', 'import'];
const JS_EXTENSION = '.js';

function isRelativeJsImportFromWorkspacePackage(context, moduleName) {
  const isRelativeJsImport = moduleName.startsWith('.') && moduleName.endsWith(JS_EXTENSION);
  const isImportedFromWorkspacePackage = context.originModulePath.startsWith(workspacePackagesDir);
  return isRelativeJsImport && isImportedFromWorkspacePackage;
}

function resolveWorkspaceRequest(context, moduleName, platform) {
  if (isRelativeJsImportFromWorkspacePackage(context, moduleName)) {
    const moduleNameWithoutExtension = moduleName.slice(0, -JS_EXTENSION.length);
    try {
      return context.resolveRequest(context, moduleNameWithoutExtension, platform);
    } catch {
      // fall through to the default resolution
    }
  }
  return context.resolveRequest(context, moduleName, platform);
}

// 1. Pick the "@wte/source" export condition (points at src/index.ts).
config.resolver.unstable_conditionNames = ['@wte/source', ...defaultConditionNames];

// 2. Workspace sources use NodeNext-style "./file.js" specifiers for .ts files; Metro
//    doesn't remap those, so retry without the extension.
config.resolver.resolveRequest = resolveWorkspaceRequest;

module.exports = config;
