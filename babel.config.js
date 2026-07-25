module.exports = function(api) {
  api.cache(true);
  return {
    // Expo detects Reanimated 4 / Worklets and installs its matching Babel
    // transform. Adding the Worklets transform again with bundle mode creates
    // a different runtime contract from the native application.
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-worklets/plugin',
    ],
  };
};
