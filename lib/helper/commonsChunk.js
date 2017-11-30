const _ = require('lodash');

module.exports = function(config) {
  if ( config.commonsChunk && (config.commonsChunk.minChunks === null ||
    config.commonsChunk.minChunks === 0 ||
    parseInt(config.commonsChunk.minChunks))
  ) {
    let comName = config.commonsChunk.name || 'common';
    let chunkObj = {
      name: comName,
      filename: `./js/${comName}.js`
    };

    if (config.commonsChunk.minChunks) {
      chunkObj.minChunks = config.commonsChunk.minChunks;
    }

    if (Array.isArray(config.commonsChunk.exclude) &&
        config.commonsChunk.exclude.length > 0) {
      chunkObj.chunks = config.entry.slice();
      chunkObj.chunks = _.pullAll(chunkObj.chunks, config.commonsChunk.exclude);
    }

    return chunkObj;
  }
  return;
}
