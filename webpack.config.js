const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const StatsPlugin = require('stats-webpack-plugin')
const { exec } = require('child_process')
const dev = process.env.NODE_ENV === 'development'
console.log(`webpack running in ${dev ? 'development' : 'production'} mode`)
exec('rd dist /s /q')
const commonConfig = {
  mode: dev ? 'development' : 'production',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    useBuiltIns: 'usage',
                    corejs: 3
                  }
                ],
                '@babel/preset-typescript'
              ],
              plugins: [
                [
                  '@babel/plugin-transform-runtime',
                  {
                    corejs: 3
                  }
                ],
                'babel-plugin-transform-class-properties'
              ]
            }
          }
        ]
      },
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: ['postcss-preset-env']
              }
            }
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.css']
  },
  devtool: dev ? 'source-map' : false
}

const solitaireConfig = {
  ...commonConfig,
  entry: {
    solitaire: path.resolve(__dirname, 'src', 'Solitaire.ts')
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'var',
    library: 'Solitaire',
    libraryExport: 'default'
  },
  plugins: [new MiniCssExtractPlugin({})]
}

const demoConfig = {
  ...commonConfig,
  entry: {
    index: path.resolve(__dirname, 'src', dev ? 'index.dev.ts' : 'index.ts')
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'var'
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src', 'static'),
          to: path.resolve(__dirname, 'dist')
        }
      ]
    }),
    new MiniCssExtractPlugin({}),
    new StatsPlugin('stats.json', {
      chunkModules: true
    })
  ],
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
    open: true
  }
}
module.exports = [demoConfig, solitaireConfig]
