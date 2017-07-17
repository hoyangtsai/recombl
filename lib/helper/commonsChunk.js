const CommonsChunkPlugin = require('webpack/optimize/CommonsChunkPlugin');

module.exports = function(config) {
  if (!!config.commonsChunk && config.entry && config.entry.length > 1) {
    let comName = config.commonsChunk.name || 'common';
    let chunkObj = {
      name: comName,
      filename: `${comName}.js`
    };
    if (config.commonsChunk.minChunks) {
      chunkObj.minChunks = config.commonsChunk.minChunks;
    }
    if (Array.isArray(config.commonsChunk.excludeFile) &&
        config.commonsChunk.excludeFile.length > 0) {
      chunkObj.chunks = config.entry.slice();
      for (let j in config.commonsChunk.excludeFile) {
        removeArrayValue(chunkObj.chunks, config.commonsChunk.excludeFile[j]);
      }
    }
    return new CommonsChunkPlugin(chunkObj);
  }
  return;
}

function removeArrayValue(arr, val) {
  let index = -1;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === val) {
      index = i;
      break;
    }
  }
  if (index === -1) {
    return;
  }
  arr.splice(index, 1);
}
