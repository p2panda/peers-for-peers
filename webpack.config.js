const HtmlWebpackPlugin = require('html-webpack-plugin');
const { DefinePlugin } = require('webpack');

module.exports = () => {
  return {
    entry: './src/index.tsx',
    output: {
      filename: './dist/index.js',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.css'],
    },
    module: {
      rules: [
        { test: /\.tsx?$/, loader: 'ts-loader' },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    devServer: {
      historyApiFallback: true,
      hot: false,
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: "It's unconference time!",
        favicon: 'favicon.ico',
      }),
      new DefinePlugin({
        'process.env.ENDPOINT': JSON.stringify(process.env.ENDPOINT),
      }),
    ],
  };
};
