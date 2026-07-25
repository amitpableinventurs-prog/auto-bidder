// Critical Worklets Polyfill
// This script MUST run as the first thing in the bundle to prevent initialization crashes.

(function(global) {
  // 1. Ensure custom serializables registry is always present
  if (!global.__customSerializationRegistry) {
    global.__customSerializationRegistry = [];
  }

  // 2. Fatal error reporting
  global.__reportFatalRemoteError = global.__reportFatalRemoteError || (function(error) {
    if (global.console && global.console.error) {
      global.console.error('[Worklets Fatal Error]', error);
    }
  });

  // 3. Shim TurboModules globally ONLY if they don't exist
  // In New Architecture, overriding global.TurboModules can break native registration.
  if (typeof global.TurboModules === 'undefined' || global.TurboModules === null) {
    const mock = {};
    const registry = new Map([
      ['Networking', mock],
      ['WebSocketModule', mock],
      ['SettingsManager', mock],
      ['DevSettings', mock],
      ['PlatformConstants', { isTesting: false, reactNativeVersion: { major: 0, minor: 85, patch: 3 } }],
    ]);

    global.TurboModules = {
      has: function(name) { return registry.has(name); },
      get: function(name) { return registry.get(name) || null; },
      getEnforcing: function(name) { return registry.get(name) || mock; }
    };
  }

  if (!global.nativeModuleProxy) {
    global.nativeModuleProxy = new Proxy({}, { get: () => ({}) });
  }

})(typeof globalThis !== 'undefined' ? globalThis : (typeof global !== 'undefined' ? global : this));
