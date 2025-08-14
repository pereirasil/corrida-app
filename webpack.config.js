const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Configurações específicas para PWA
  config.output = {
    ...config.output,
    publicPath: '/',
  };

  // Otimizações para PWA
  config.optimization = {
    ...config.optimization,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          enforce: true,
        },
      },
    },
  };

  // Resolver para assets
  config.resolve.alias = {
    ...config.resolve.alias,
    '@assets': path.resolve(__dirname, 'assets'),
    '@components': path.resolve(__dirname, 'components'),
    '@constants': path.resolve(__dirname, 'constants'),
    '@hooks': path.resolve(__dirname, 'hooks'),
    '@utils': path.resolve(__dirname, 'utils'),
  };

  return config;
};
