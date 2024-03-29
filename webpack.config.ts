import path from "path";
import webpack, {PathData, RuleSetRule} from "webpack";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import TerserWebpackPlugin from "terser-webpack-plugin";
import MiniExtractPlugin from "mini-css-extract-plugin";
import HTMLWebpackPlugin from "html-webpack-plugin";
import autoprefixer from "autoprefixer";

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

const filename = (ext: string, name?: string) => isDev ? `${name || "[name]"}.[contenthash].${ext}` : `[hash].${ext}`

export const cssLoaders = (param?: (string | string[] | RuleSetRule | RuleSetRule[])) => {
  const loader: (string | RuleSetRule)[] = [
    MiniExtractPlugin.loader, 
    'css-loader',
  ];

  if (param && Array.isArray(param))
    param.forEach(p => loader.push(p))
  else param && loader.push(param);

  return loader;
}

const config: webpack.Configuration = {
  context: path.resolve(__dirname, "src"),
  output: {
    filename: filename("js", "index"),
    path: path.resolve(__dirname, "public"),
    assetModuleFilename: (path: PathData) => path.filename!,
    clean: true,
  },
  resolve: {
    alias: {
      "@styles": path.resolve(__dirname, "src/style/"),
      "@scripts": path.resolve(__dirname, "src/scripts/"),
    },
    extensions: [".ts", ".js"]
  },
  optimization: {
    minimizer: [
      new CssMinimizerPlugin(), 
      new TerserWebpackPlugin(
        {
          parallel: true,
          extractComments: false, 
          terserOptions: {
            compress: {passes: 2},
          },
        },
      ),
    ],
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          MiniExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: () => autoprefixer,
              },
            }
          }, 
          "sass-loader",
        ],
      },
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.html$/,
        use: "html-loader",
      }
    ],
  }, 
  plugins: [
    new HTMLWebpackPlugin({
      template: path.resolve(__dirname, "src/index.html"),
      minify: {
        collapseWhitespace: isProd,
      }
    }),
    new MiniExtractPlugin({
      filename: filename("css"),
    }),
  ],
}

export default config;