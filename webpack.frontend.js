const path = require('path')
const toml = require('toml')
const webpack = require('webpack')
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports = {
  // mode: 'development',
  entry: {
    index: './www/index.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    fallback: {
      buffer: require.resolve('buffer/'),
      async_hooks: false,
      fs: false,
      net: false,
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
    }),
    new NodePolyfillPlugin(),
  ]
}