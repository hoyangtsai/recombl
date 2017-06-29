const chai = require('chai');

chai.use(require('chai-as-promised'));

describe('reco-cli', function() {
  require('./scripts/version');
});
