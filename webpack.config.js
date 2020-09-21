const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const dev = process.env.NODE_ENV === 'development'
console.log(`webpack running in ${dev ? 'development' : 'production'} mode`)

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
                ]
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
    Solitaire: path.resolve(__dirname, 'src', 'Solitaire.ts')
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'var',
    library: 'Solitaire',
    libraryExport: 'default'
  },
  plugins: [new CleanWebpackPlugin(), new MiniCssExtractPlugin({})]
}

const demoConfig = {
  ...commonConfig,
  entry: {
    index: path.resolve(__dirname, 'src', dev ? 'index.dev.ts' : 'index.ts')
  },
  output: {
    path: path.resolve(__dirname, 'dist', 'example'),
    libraryTarget: 'var'
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src', 'static'),
          to: path.resolve(__dirname, 'dist', 'example')
        }
      ]
    }),
    new MiniCssExtractPlugin({})
  ],
  devServer: {
    contentBase: path.join(__dirname, 'dist', 'example'),
    compress: true,
    port: 9000,
    open: true,
    openPage: '/example/index.html'
  }
}
module.exports = [demoConfig, solitaireConfig]
