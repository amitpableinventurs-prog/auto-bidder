module.exports = function(api) {
  api.cache(true);
  return {
    // Keep this in sync with the workspace root. Expo adds the compatible
    // Worklets transform automatically when Reanimated 4 is installed.
    presets: ['babel-preset-expo'],
<<<<<<< HEAD
    plugins: [
      'react-native-worklets/plugin',
    ],
=======
    plugins: ['react-native-reanimated/plugin'],
>>>>>>> c89a25ad7a2d764f99f5102b91ee091f0c85127b
  };
};
