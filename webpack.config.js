'use strict';

var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var Clean = require('clean-webpack-plugin');

var ALWAYS = true;
var IS_DEV_SERVER  = process.argv[1].indexOf('webpack-dev-server') >= 0;
var IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';

var PROTOCOL = 'https';
var DOMAIN = '127.0.0.1';
var PORT = '8080';

function PUSH_IF(arr, condition, element){
  if(condition) {
    arr.push(element);
  }
};

module.exports = {
  entry: (function(){
    var serviceArray = IS_DEV_SERVER 
      ? ['webpack-dev-server/client?' + PROTOCOL + '://' + DOMAIN +':' + PORT] 
      : [];

    return {
      'app': serviceArray.concat(['./index'])
    };
  })(),
  output : {
    path          : path.resolve(__dirname + '/dist'),
    publicPath    : IS_DEV_SERVER ? 'https://127.0.0.1:8080/dist/' : '/dist',
    filename      : '[name].js',
    chunkFilename : '[name].[chunkhash].js'
  },
  resolve : {
    extensions : ['.jsx', '.js', '.min.js'],
    modules: [
      'styles',
      './',
      'node_modules'
    ]
  },
  devtool : 'source-map',
  module : {
    rules : [
      {
        test   : /\.(sass|scss)$/,
        use: (function(){
          var loaders = [
            {
              loader: 'css-loader',
              options: {
                minimize: false
              }
            },
            { loader: 'postcss-loader' },
            { loader: 'sass-loader' }
          ];

          return IS_DEV_SERVER 
                  ? [{
                    loader: 'style-loader'
                  }].concat(loaders)
                  : ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: loaders
                  });
        })()
      },
      {
        test: /\.(svg|png|jpg|jpeg|eot|ttf|woff|woff2)$/i,
        exclude: /svg[\/\\]/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 20000
            }
          }
        ]
      }
    ]
  },
  plugins : (function(){
    let plugins = new Array();
        
    PUSH_IF(plugins, IS_DEV_SERVER ,  new webpack.HotModuleReplacementPlugin());
    PUSH_IF(plugins, !IS_DEV_SERVER,  new Clean(['dist']));
    PUSH_IF(plugins, ALWAYS,          new webpack.DefinePlugin({
      NODE_ENV: IS_DEVELOPMENT ? '\'development\'' : '\'production\''
    }));
    PUSH_IF(plugins, ALWAYS,          new webpack.optimize.CommonsChunkPlugin({name: 'app'}));
    PUSH_IF(plugins, !IS_DEV_SERVER,  new ExtractTextPlugin({
      filename: '[name].css',
      allChunks: true
    }));
    PUSH_IF(plugins, !IS_DEV_SERVER,  new webpack.optimize.UglifyJsPlugin({
      sourceMap: true, 
      compress : {
        warnings     : false,
        drop_console : false,
        unsafe       : false
      }
    }));
    PUSH_IF(plugins, !IS_DEV_SERVER,  new webpack.LoaderOptionsPlugin({
      minimize: true
    }));
    
    return plugins;
  })(),

  devServer: {
    publicPath: PROTOCOL + '://' + DOMAIN +':' + PORT +  '/dist/',
    headers: {
      'Access-Control-Allow-Origin'      : '*',
      'Access-Control-Allow-Credentials' : 'true'
    },
    inline: true,
    hot : true,
    host: DOMAIN,
    https: PROTOCOL === 'https'
  }
};
