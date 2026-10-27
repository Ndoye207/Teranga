module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    '@babel/plugin-transform-export-namespace-from',
    // Doit rester en dernier (Reanimated 4)
    'react-native-worklets/plugin',
  ],
};
