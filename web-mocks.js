/**
 * Web mocks for native-only React Native internals.
 */
const React = require('react');

const dummy = () => null;

const stripeConstants = {
  getConstants: () => ({
    API_VERSIONS: { CORE: "1", ISSUING: "1" },
    SYSTEM_INFO: {
      sdkVersion: "1",
      osVersion: "1",
      deviceType: "1",
      appName: "1",
      appVersion: "1",
      isNewArchitecture: false,
      reactNativeVersion: "1"
    }
  })
};

// Proxy to handle any method calls by returning a resolving Promise
const stripeProxy = new Proxy(stripeConstants, {
  get: (target, prop) => {
    if (prop in target) return target[prop];
    return () => Promise.resolve({});
  }
});

module.exports = {
  // Top level get for cases where the module is treated as a registry
  get: () => dummy,

  // codegenNativeCommands
  codegenNativeCommands: () => ({}),

  // codegenNativeComponent
  codegenNativeComponent: () => dummy,

  // NativeComponentRegistry
  NativeComponentRegistry: {
    get: () => dummy,
  },

  // ViewConfigIgnore
  ConditionallyIgnoredEventHandlers: () => ({}),

  // RendererProxy
  dispatchCommand: () => {},

  // General fallback for other deep imports
  default: stripeProxy,

  // Direct access for getConstants
  ...stripeConstants,

  __esModule: true,
};
