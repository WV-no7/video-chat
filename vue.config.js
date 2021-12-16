// vue.config.js file to be place in the root of your repository

module.exports = {
    publicPath: process.env.NODE_ENV === 'production'
      ? '/video-chat/'
      : '/'
    ,chainWebpack: config => config.plugins.delete('named-chunks')
  }