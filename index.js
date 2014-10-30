/**
 * Bothan Public Interface
 * ========================
 *
 * Exports Bothan main functions.
 */
var spawn = require('./src/spawn.js'),
    config = require('./shared/config.js'),
    helpers = require('./shared/helpers.js');

var bothan = {
  config: function(o) {
    if (o.port)
      config.port = o.port;
    return bothan;
  },
  deploy: function(params, callback) {
    if (arguments.length === 1) {
      callback = params;
      params = null;
    }

    params = params || {};

    if (typeof callback !== 'function')
      throw Error('bothan.deploy: no valid callback provided.');

    return spawn(params, callback);
  }
};

// Non-writable properties
Object.defineProperty(bothan, 'version', {
  value: '0.1.0'
});

module.exports = bothan;
