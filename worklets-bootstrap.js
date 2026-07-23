// Worklets' Android native module can report an initialization error before
// Worklets' JavaScript initializer has registered its normal reporter.
// React Native 0.85 requires the callback to already be present at that point.
// The library replaces this fallback with its full reporter during startup.
if (typeof globalThis.__reportFatalRemoteError !== 'function') {
  globalThis.__reportFatalRemoteError = (error, force) => {
    if (force) {
      throw error;
    }
    console.error(error);
  };
}
