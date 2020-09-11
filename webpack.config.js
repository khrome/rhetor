var webpack = require('webpack')
module.exports = {
    entry: {
        main: './story-time.js'
    },
    externals : {
        request: 'undefined'
    },
    node: {
      fs: 'empty',
      tls: 'empty',
      net: 'empty'
  }
};
