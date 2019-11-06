// const config = require('config')
const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const isDebug = process.argv.includes('--mode=development')
const srcDir = path.resolve(__dirname, 'app')

const outputPath = path.resolve(__dirname, 'dist')

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath)
}

const babelRules = (dir, node) => (
  {
    test: /\.jsx?$/,
    include: dir,
    loader: 'babel-loader',
    query: {
      cacheDirectory: isDebug,

      presets: [
        'flow',
        ['env', {
          targets: node === 'node' ? { node: 'current' } : { browsers: ['last 2 versions'] },
        }],
        'react'
      ],
      plugins: [
        'dynamic-import-node',
        'jsx-control-statements',
        'transform-decorators-legacy',
        'transform-class-properties',
        'transform-object-rest-spread',
      ],
    },
  }
)

module.exports = () => [
  {
    context: srcDir,
    target: 'web',
    node: {
      __dirname: false,
      __filename: false,
    },
    module: {
      rules: [
        babelRules(srcDir, 'node'),
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        // https://github.com/webpack-contrib/css-loader/issues/38
        {
          test: /\.(png|woff|woff2|eot|ttf|svg)$/,
          loader: 'url-loader?limit=100000'
        }
      ]
    },
    resolve: {
      modules: [
        'node_modules',
        srcDir,
      ],
      alias: {
        // config: configPath
      },
      extensions: ['.js', '.jsx'],
    },
    devtool: 'source-map',

    entry: [
      'react-hot-loader/patch',
      `${srcDir}/`
    ],

    plugins: [
      new HtmlWebpackPlugin({
        title: 'enot simon home app',
        favicon: 'assets/favicon.jpeg',
      }),
      new webpack.NamedModulesPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new CopyWebpackPlugin([
        {
          // Note:- No wildcard is specified hence will copy all files and folders
          from: 'assets/', // Will resolve to RepoDir/src/assets
          to: '' // Copies all files from above dest to dist/assets
        },
      ]),
    ],

    output: {
      filename: 'serve.js',
      path: outputPath,
      publicPath: '/'
    },

    devServer: {
      contentBase: outputPath,
      port: 8020,
      hot: true,
      after: () => {
      }
    },
  }
]
