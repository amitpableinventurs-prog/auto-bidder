module.exports = function(api) {
  api.cache(true);
  return {
    // Keep this in sync with the workspace root. Expo adds the compatible
    // Worklets transform automatically when Reanimated 4 is installed.
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-worklets/plugin',
    ],
  };
};
