module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    '@babel/plugin-transform-export-namespace-from',
    // Doit rester en dernier (Reanimated 4)
    'react-native-worklets/plugin',
  ],
};
